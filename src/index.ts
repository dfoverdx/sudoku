import './helpers/array-extensions';
import './polyfill';
import runPuppet from './puppet';
import { Puppet } from './puppet/index';
// import SudokuDotComPuppet from './puppet/sudoku-com';
import SudokuOnlineDotComPuppet from './puppet/sudoku-online-com';
import WebSudokuDotComPuppet from './puppet/websudoku-com';

type PuppetDifficulty<T> =
    T extends Puppet<infer TDiff> ? TDiff : never;
type PuppetDiffArray<T extends [...Puppet<string | undefined>[]] = []> =
    [] | { [I in keyof T]: PuppetDifficulty<T[I]> extends undefined ? [T[I]] : [T[I], PuppetDifficulty<T[I]>?] };
type EmptyOrTuple<T extends [] | Array<any>> =
    T extends [] ? T : Exclude<T, []>;

function puppetDifficulties<P extends Array<Puppet<string | undefined>>>(
    arr: PuppetDiffArray<P>
) {
    return arr as EmptyOrTuple<typeof arr>;
}

(async () => {
    const runsPerDifficulty = 2;

    const puppets = puppetDifficulties([
        [ SudokuOnlineDotComPuppet, 'Easy' ],

        [ WebSudokuDotComPuppet, 'evil' ],
        // [ WebSudokuDotComPuppet, 'medium' ],
        // [ WebSudokuDotComPuppet, 'hard' ],
        // [ WebSudokuDotComPuppet, 'evil' ],

        // [ SudokuDotComPuppet, 'easy' ],
        // [ SudokuDotComPuppet, 'medium' ],
        // [ SudokuDotComPuppet, 'hard' ],
        // [ SudokuDotComPuppet, 'expert' ],
    ]);

    for (const [puppet, difficulty] of puppets) {
        for (let i = 0; i < runsPerDifficulty; i++) {
            await runPuppet(puppet, { difficulty, newGame: !!i, delay: 500 });
        }
    }

    // await runPuppet(WebSudokuDotComPuppet, { difficulty: 'hard' });
    // await runPuppet(WebSudokuDotComPuppet, { difficulty: 'hard' });
    // await runPuppet(WebSudokuDotComPuppet, { difficulty: 'hard' });
    // await runPuppet(WebSudokuDotComPuppet, { difficulty: 'evil' });
    // await runPuppet(WebSudokuDotComPuppet, { difficulty: 'evil' });
    // await runPuppet(WebSudokuDotComPuppet, { difficulty: 'evil' });

    // await runPuppet(SudokuDotComPuppet, { difficulty: 'hard' });
    // await runPuppet(SudokuDotComPuppet, { difficulty: 'hard' });
    // await runPuppet(SudokuDotComPuppet, { difficulty: 'hard' });
    // await runPuppet(SudokuDotComPuppet, { difficulty: 'expert' });
    // await runPuppet(SudokuDotComPuppet, { difficulty: 'expert' });
    // await runPuppet(SudokuDotComPuppet, { difficulty: 'expert' });

    await Promise.wait(4000);
    // await runPuppet.close();
})();