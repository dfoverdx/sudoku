import { ElementHandle } from 'puppeteer';
import { Puppet, readGame } from './index';

type SudokuOnlineDifficulties = 'Easy' | 'Medium' | 'Hard' | 'Very Hard';

let lastDifficulty: SudokuOnlineDifficulties;

const SudokuOnlineDotComPuppet: Puppet<SudokuOnlineDifficulties> = {
    name: 'Sudoku-online.com',

    async load(page, difficulty) {
        await page.goto('https://www.soduko-online.com/');
        await page.waitForSelector('#y6');

        if (lastDifficulty && difficulty !== lastDifficulty || !lastDifficulty && difficulty !== 'Easy') {
            lastDifficulty = difficulty || 'Easy';
            await this.newGame(page);
        }
    },

    async newGame(page) {
        let id =
            lastDifficulty === 'Easy' ? '#g1' :
            lastDifficulty === 'Medium' ? '#g2' :
            lastDifficulty === 'Hard' ? '#g3' :
            '#g4';

        const btn = await page.waitForSelector(id);
        await btn.click();

        await page.waitForFunction(`
            document.querySelector('#y3').innerText === '${lastDifficulty}'
        `);
    },

    readGame(page) {
        return readGame(page, '[id^="vc_"]', getCellValue);
    },

    async setCellValue(page, coord, value) {
        const cell = await page.waitForSelector(`#vc_${coord[1]}_${coord[0]}`);
        await cell.click();
        await page.keyboard.press(value.toString());
    },
};

export default SudokuOnlineDotComPuppet;

async function getCellValue(cell: ElementHandle<Element>): Promise<string> {
    try {
        // @ts-ignore
        const desc: string = cell._remoteObject.description,
            expr = `document.querySelector('${desc}').innerText;`,
            value = await cell.executionContext().evaluate(expr);
        return value || '.';
    } catch (err) {
        console.error(err);
        return '.';
    }
}

// async function promiseChain<P extends Array<Promise<any>>>(promises: P):
//     Promise<[] | { [I in keyof P]: [P[I] extends Promise<infer S> ? S : never] }>
// {
//     let values: [] | { [I in keyof P]: [P[I] extends Promise<infer S> ? S : never] } = [];
//     for (const promise of promises) {
//         // @ts-ignore
//         values.push(await promise);
//     }

//     return values as typeof promises extends [] ? [] : Exclude<typeof values, []>;
// }