import { Simple, Required, Min, Max, Item, Enum } from '../src/decorators';
import { Molder } from '../src/mold';
import { MOLD } from '../src/constants';

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

        class SubAccount extends Account {
            @Item(User) more: User[];
        }

        class SubAccountBis extends Account {
            @Required data: string;
        }

        console.log('xxx', Reflect.getMetadata(MOLD, SubAccount));

        expect(
            Molder.instantiate(SubAccount, { amount: 3, enabled: 'true', sss: 'ss', foo: 'b' })
        ).toEqual({
            amount: 3,
            enabled: true,
            foo: 'b'
        });
    });
});
