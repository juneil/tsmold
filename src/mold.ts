import Ajv from 'ajv';
import { SCHEMA } from './constants';
import { extractSchema } from './builder';

export class Mold {
    static instantiate<T>(token: { new (): T }, payload: any): T {
        const instance = Reflect.construct(token, []);
        Object.entries(this.validate(token, payload)).forEach(([key, value]) => {
            instance[key] = value;
        });
        return instance;
    }

    static validate<T extends Function>(token: T, payload: any): any {
        const value = this.getCompiledSchema(token)(payload);
        if (!value) {
            throw new Error(new Ajv().errorsText(this.getCompiledSchema(token).errors));
        }
        return payload;
    }

    private static getCompiledSchema(token: Function): Ajv.ValidateFunction {
        let compiledSchema = Reflect.getMetadata(SCHEMA, token);
        if (!compiledSchema) {
            const ajv = Ajv({ removeAdditional: true, useDefaults: true, coerceTypes: true });
            const schema = extractSchema(token);
            compiledSchema = ajv.compile(schema);
            Reflect.defineMetadata(SCHEMA, compiledSchema, token);
        }
        return compiledSchema;
    }
}
