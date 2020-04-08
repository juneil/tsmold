import { Simple, Required, Min, Max, Items } from '../src/decorators';
import { Molder } from '../src/molder';

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
        }

        class SubAccount extends Account {
            @Items(User) more: User[];
        }

        expect(Molder.instantiate(SubAccount, { amount: 3, enabled: 'true', sss: 'ss' })).toBe({
            amount: 3,
            enabled: true
        });
    });
});