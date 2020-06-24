import { Simple, Required, Min, Max, Item, Enum, ExtendRules } from '../src/decorators';
import { Molder } from '../src/mold';
import { MOLD } from '../src/constants';
import { extractSchema } from '../src/builder';

describe('Molder tests', () => {
    test('Class inheritance', () => {
        class User {
            @Required name: string;
        }

        class Account {
            @Max(11) amount: number;
            @Min(0) name: string;
            @Required enabled: boolean;
            @Item(String) list: string[];
            @Simple other: User;
            @Required @Enum('a', 'b') foo: string;
        }

        @ExtendRules(Account)
        class SubAccount extends Account {
            @Item(User) more: User[];
        }

        expect(
            Molder.instantiate(SubAccount, { amount: 3, enabled: 'true', sss: 'ss', foo: 'b' })
        ).toEqual({
            amount: 3,
            enabled: true,
            foo: 'b'
        });
    });
    test('Multiple children inheritance', () => {
        class User {
            @Required name: string;
        }

        class Account {
            @Max(11) amount: number;
            @Min(0) name: string;
            @Required enabled: boolean;
            @Item(String) list: string[];
            @Simple other: User;
            @Required @Enum('a', 'b') foo: string;
        }

        @ExtendRules(Account)
        class SubAccount extends Account {
            @Item(User) more: User[];
        }

        @ExtendRules(SubAccount)
        class SubAccountBis extends SubAccount {
            @Required data: string;
        }

        expect(
            Molder.instantiate(SubAccountBis, {
                amount: 3,
                enabled: 'true',
                sss: 'ss',
                foo: 'b',
                data: 'test'
            })
        ).toEqual({
            amount: 3,
            enabled: true,
            foo: 'b',
            data: 'test'
        });
    });
});
