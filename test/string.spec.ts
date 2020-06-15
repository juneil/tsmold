import { Simple, Max, Min, Enum } from '../src/decorators';
import { TYPE, MAX, MIN, ENUM } from '../src/constants';
import { ruleValue } from '../src/builder';

describe('String tests', () => {
    test('Check string property', () => {
        class Account {
            @Simple name: string;
        }
        expect(ruleValue(TYPE, Account, 'name')).toBe(String);
    });
    test('Check min/max value', () => {
        class Account {
            @Max(20)
            @Min(1)
            name: string;
        }
        expect(ruleValue(TYPE, Account, 'name')).toBe(String);
        expect(ruleValue(MAX, Account, 'name')).toBe(20);
        expect(ruleValue(MIN, Account, 'name')).toBe(1);
    });
    test('Check enum values', () => {
        class Account {
            @Enum('aa', 'bb', 'cc')
            name: string;
        }
        expect(ruleValue(TYPE, Account, 'name')).toBe(String);
        expect(ruleValue(ENUM, Account, 'name')).toStrictEqual(['aa', 'bb', 'cc']);
    });
});
