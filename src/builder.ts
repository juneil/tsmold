import { MOLD, TYPE, REQUIRED, MIN, MAX, PATTERN, ITEMS } from './constants';

function type(value: any): Record<string, any> {
    switch (value) {
        case Number:
            return { type: 'number' };
        case String:
            return { type: 'string' };
        case Boolean:
            return { type: 'boolean' };
        case Array:
            return { type: 'array' };
        case undefined:
            return { type: 'null' };
        default:
            if (hasMetadata(value)) {
                return extractSchema(value);
            }
            return { type: 'object' };
    }
}

function min(value: number, type: any): Record<string, any> {
    switch (type) {
        case Number:
            return { minimum: value };
        case String:
            return { minLength: value };
        case Array:
            return { minItems: value };
    }
}

function max(value: number, typeValue: any): Record<string, any> {
    switch (typeValue) {
        case Number:
            return { maximum: value };
        case String:
            return { maxLength: value };
        case Array:
            return { maxItems: value };
    }
}

function pattern(value: string, typeValue: any): Record<string, any> {
    switch (typeValue) {
        case String:
            return { pattern: value };
    }
}

function items(value: any, typeValue: any): Record<string, any> {
    switch (typeValue) {
        case Array:
            return { items: type(value) };
    }
}

function buildProperty(
    propertyKey: string,
    rule: string,
    value: any,
    target: Function
): Record<string, any> {
    const typeValue = ruleValue(TYPE, target, propertyKey);
    switch (rule) {
        case TYPE:
            return type(value);
        case MIN:
            return min(value, typeValue);
        case MAX:
            return max(value, typeValue);
        case PATTERN:
            return pattern(value, typeValue);
        case ITEMS:
            console.log(value);
            return items(value, typeValue);
    }
}

function hasMetadata(target: Function): boolean {
    return !!Reflect.getMetadata(MOLD, target);
}

function requiredProperties(target: Function): string[] {
    const metadata = Reflect.getMetadata(MOLD, target) || {};
    return Object.keys(metadata).filter((key) => ruleValue(REQUIRED, target, key));
}

function rulesByProperty(target: Function, propertyKey: string): [string, any][] {
    const metadata = Reflect.getMetadata(MOLD, target) || {};
    const rules = metadata[propertyKey] || {};
    return Object.entries(rules);
}

function buildProperties(target: Function): Record<string, any> {
    return properties(target)
        .map((key) =>
            rulesByProperty(target, key)
                .map(([rule, value]) => buildProperty(key, rule, value, target))
                .reduce((acc, cur) => ({ ...acc, [key]: { ...acc[key], ...cur } }), {})
        )
        .reduce((acc, cur) => ({ ...acc, ...cur }), {});
}

export function properties(target: Function): string[] {
    const metadata = Reflect.getMetadata(MOLD, target) || {};
    return Object.keys(metadata);
}

export function extractSchema(target: Function): Record<string, any> {
    return {
        title: target.name,
        type: 'object',
        properties: buildProperties(target),
        required: requiredProperties(target),
        additionalProperties: false
    };
}

export function ruleValue(rule: string, target: Function, propertyKey: string): any {
    const metadata = Reflect.getMetadata(MOLD, target) || {};
    const rules = metadata[propertyKey] || {};
    return rules[rule];
}
