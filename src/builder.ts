import { MOLD, TYPE, REQUIRED, MIN, MAX, PATTERN, ITEMS, ENUM } from './constants';

/**
 * type
 *
 * Get JSON Schema type value
 *
 * @param value
 */
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

/**
 * min
 *
 * Get JSON Schema min value depending of the data type
 *
 * @param value
 * @param typeValue
 */
function min(value: number, typeValue: any): Record<string, any> {
    switch (typeValue) {
        case Number:
            return { minimum: value };
        case String:
            return { minLength: value };
        case Array:
            return { minItems: value };
    }
}

/**
 * max
 *
 * Get JSON Schema max value depending of the data type
 *
 * @param value
 * @param typeValue
 */
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

/**
 * pattern
 *
 * Get JSON Schema pattern value
 *
 * @param value
 * @param typeValue
 */
function pattern(value: string, typeValue: any): Record<string, any> {
    switch (typeValue) {
        case String:
            return { pattern: value };
    }
}

/**
 * items
 *
 * Get JSON Schema items value
 *
 * @param value
 * @param typeValue
 */
function items(value: any, typeValue: any): Record<string, any> {
    switch (typeValue) {
        case Array:
            return { items: type(value) };
    }
}

/**
 * enum
 *
 * Get JSON Schema enum values
 * for type string
 *
 * @param value
 * @param typeValue
 */
function enumMapper(value: any, typeValue: any): Record<string, any> {
    switch (typeValue) {
        case String:
            return { enum: [].concat(value).filter(Boolean) };
    }
}

/**
 * buildProperty
 *
 * Build the JSON Schema value for a class property's rule
 *
 * Example:
 *
 * class Account {
 *      @Min(0)
 *      @Max(9999)
 *      balance: integer
 * }
 *
 * Each rule will be processed by this function:
 * buildProperty('balance', TYPE, Number, Account);
 * buildProperty('balance', MIN, 0, Account);
 * buildProperty('balance', MAX, 9999, Account);
 *
 * As a result:
 * { type: 'number' }
 * { minimum: 0 }
 * { maximum: 9999 }
 *
 * @param propertyKey
 * @param rule
 * @param value
 * @param target
 */
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
            return items(value, typeValue);
        case ENUM:
            return enumMapper(value, typeValue);
    }
}

/**
 * hasMetadata
 *
 * Check if the class provided has Molder metadata.
 *
 * @param target
 */
function hasMetadata(target: Function): boolean {
    return !!Reflect.getMetadata(MOLD, target);
}

/**
 * requiredProperties
 *
 * Get the required property key list of a class
 *
 * @param target
 */
function requiredProperties(target: Function): string[] {
    const metadata = Reflect.getMetadata(MOLD, target) || {};
    return Object.keys(metadata).filter((key) => ruleValue(REQUIRED, target, key));
}

/**
 * rulesByProperty
 *
 * Get the rules for a class property
 *
 * @param target
 * @param propertyKey
 */
function rulesByProperty(target: Function, propertyKey: string): [string, any][] {
    const metadata = Reflect.getMetadata(MOLD, target) || {};
    const rules = metadata[propertyKey] || {};
    return Object.entries(rules);
}

/**
 * buildProperties
 *
 * Build by merging all the JSON Schema values
 * into one object per property
 *
 * @param target
 */
function buildProperties(target: Function): Record<string, any> {
    return properties(target)
        .map((key) =>
            rulesByProperty(target, key)
                .map(([rule, value]) => buildProperty(key, rule, value, target))
                .reduce((acc, cur) => ({ ...acc, [key]: { ...acc[key], ...cur } }), {})
        )
        .reduce((acc, cur) => ({ ...acc, ...cur }), {});
}

/**
 * properties
 *
 * Get the property key list of a class
 *
 * @param target
 */
export function properties(target: Function): string[] {
    const metadata = Reflect.getMetadata(MOLD, target) || {};
    return Object.keys(metadata);
}

/**
 * extractSchema
 *
 * Use all the stored rules in metadata
 * to build a JSON Schema
 *
 * @param target
 */
export function extractSchema(target: Function): Record<string, any> {
    return {
        title: target.name,
        type: 'object',
        properties: buildProperties(target),
        required: requiredProperties(target),
        additionalProperties: false
    };
}

/**
 * ruleValue
 *
 * Get the rule value for provided class and property.
 *
 * @param rule
 * @param target
 * @param propertyKey
 */
export function ruleValue(rule: string, target: Function, propertyKey: string): any {
    const metadata = Reflect.getMetadata(MOLD, target) || {};
    const rules = metadata[propertyKey] || {};
    return rules[rule];
}
