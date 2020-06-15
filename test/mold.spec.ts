import { Simple, Required, Min, Max, Items, Enum } from '../src/decorators';
import { Molder } from '../src/mold';

describe('Molder tests', () => {
    test('Class inheritance', () => {
        class User {
            @Required name: string;
        }

        class Account {
            @Max(11) amount: number;
            @Min(0) name: string;
            @Required enabled: boolean;
            @Items(String) list: string[];
            @Simple other: User;
            @Required @Enum('a', 'b') foo: string;
        }

        class SubAccount extends Account {
            @Items(User) more: User[];
        }

        expect(
            Molder.instantiate(SubAccount, { amount: 3, enabled: 'true', sss: 'ss', foo: 'b' })
        ).toEqual({
            amount: 3,
            enabled: true,
            foo: 'b'
        });
    });
});
