import { ElementHandle } from 'puppeteer';
import { Puppet, readGame } from './index';

type WebSudokuDifficulties = 'easy' | 'medium' | 'hard' | 'evil';

let finished = false;

const WebSudokuDotComPuppet: Puppet<WebSudokuDifficulties> = {
    name: 'WebSudoku.com',

    async load(page, difficulty) {
        if (difficulty) {
            const level =
                difficulty === 'easy' ? 1 :
                difficulty === 'medium' ? 2 :
                difficulty === 'hard' ? 3 :
                4;

            await page.goto(`https://nine.websudoku.com/?level=${level}`);
        } else {
            await page.goto('https://nine.websudoku.com');
        }

        await page.waitForSelector('#puzzle_grid');
    },

    async newGame(page) {
        if (!finished) {
            await page.reload();
        } else {
            const btn = await page.waitForSelector('input[name="newgame"]');
            await btn.click();
        }

        await page.waitForSelector('#puzzle_grid');
        finished = false;
    },

    readGame(page) {
        return readGame(page, '#puzzle_grid tr', 'td', getCellValue);
    },

    async setCellValue(page, coord, value) {
        const cell = await page.waitForSelector(`#puzzle_grid tr:nth-child(${coord[0] + 1}) td:nth-child(${coord[1] + 1}) input`);
        await cell.click();
        await page.keyboard.press(value.toString());
    },

    async finish(page) {
        const btn = await page.waitForSelector('input[name="submit"]');
        await btn.click();
        await page.waitForNavigation();
        await page.waitForSelector('#message');
        await Promise.wait(1000);
        finished = true;
    },
};

export default WebSudokuDotComPuppet;

async function getCellValue(cell: ElementHandle<Element>): Promise<string> {
    const value = await cell.$eval('input', i => i.getAttribute('value'));
    return value || '.';
}