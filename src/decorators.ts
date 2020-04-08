import 'reflect-metadata';
import { TYPE, MOLDER, MAX, MIN, REQUIRED, PATTERN, ITEMS } from './constants';

/**
 * defineTypeMetadata
 *
 * Add the type rule for a property key if
 * it doesn't exist only
 *
 * @param target
 * @param key
 */
function defineTypeMetadata(target: any, key: string): void {
    const metadata = Reflect.getMetadata(MOLDER, target.constructor) || {};
    if (metadata[key] && metadata[key][TYPE]) {
        return;
    }
    addRule(target.constructor, key, TYPE, Reflect.getMetadata('design:type', target, key));
}

/**
 * addRule
 *
 * Add a new rule for a property by
 * extracting the mold metadata from the target and inserting
 * the value in the property key object
 *
 * Example:
 *
 * new rule for key1: max 100
 * Extract: { key1: { [symbol('mold:min')]: 0 } }
 * Append:  { [symbol('mold:max')]: 100 }
 * Save: { key1: { [symbol('mold:min')]: 0 }, { [symbol('mold:max')]: 100 } }
 *
 * @param target
 * @param propertyKey
 * @param rule
 * @param value
 */
function addRule(target: Function, propertyKey: string, rule: string, value: any): void {
    const metadata = Reflect.getMetadata(MOLDER, target) || {};
    const rules = metadata[propertyKey] || {};
    metadata[propertyKey] = { ...rules, [rule]: value };
    Reflect.defineMetadata(MOLDER, metadata, target);
}

/**
 * Create a decorator without argument
 * Example: @Simple
 *
 * @param rule
 */
const withoutArg = (rule?: string) => {
    return (target: any, key: string): void => {
        defineTypeMetadata(target, key);
        if (rule) {
            addRule(target.constructor, key, rule, true);
        }
    };
};

/**
 * Create a decorator with one argument
 * Example: @Min(1)
 *
 * @param rule
 */
const with1Arg = <T>(rule: string) => (value: T) => {
    return (target: any, key: string): void => {
        defineTypeMetadata(target, key);
        addRule(target.constructor, key, rule, value);
    };
};

export const Simple = withoutArg();
export const Required = withoutArg(REQUIRED);
export const Max = with1Arg<number>(MAX);
export const Min = with1Arg<number>(MIN);
export const Pattern = with1Arg<string>(PATTERN);
export const Items = with1Arg<any>(ITEMS);
