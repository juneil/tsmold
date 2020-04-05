import { Simple, Required, Min, Max, Items } from '../src/decorators';
import { extractSchema } from '../src/builder';
import { Mold } from '../src/mold';

describe('Number tests', () => {
    test('Check number property', () => {
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

        console.dir(
            require('util').inspect(extractSchema(SubAccount), { showHidden: false, depth: null })
        );

        const res = Mold.instantiate(SubAccount, { amount: 3, enabledk: 'true', sss: 'ss' });
        console.log(res);
    });
});
