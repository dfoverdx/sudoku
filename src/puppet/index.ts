import c from 'ansi-colors';
import PQueue from 'p-queue';
import { Browser, ElementHandle, launch, Page } from 'puppeteer';
import Board from '../game/board';
import { CellCoord, CellValue } from '../game/cell-values';
import run from '../game/run';
import awaitRetry from '../helpers/await-retry';

export interface Puppet<TDiff extends string | undefined = undefined> {
    readonly name: string;

    load(page: Page, difficulty?: TDiff): Promise<any>;
    newGame(page: Page, wasPrev?: boolean): Promise<any>;
    readGame(page: Page): Promise<Board>;
    setCellValue(page: Page, coord: CellCoord, value: CellValue): Promise<any>;
    finish?(page: Page): Promise<any>;
}

interface RunnerOptions<TDiff extends string | undefined> {
    difficulty: TDiff extends string ? TDiff : never;
    guess: boolean;
    delay: number;
    maximizeWindow: boolean;
    newGame: boolean;
}

const defaultOptions = {
    guess: true,
    delay: 0,
    maximizeWindow: true,
    newGame: true
};

let browser: Browser | undefined = undefined,
    lastPuppet: Puppet<any>,
    lastDifficulty: string;

interface runPuppet {
    (): Promise<void>;
    newGame(): Promise<void>;
    close(): Promise<void>;
}

export default async function runPuppet<TDiff extends string | undefined = undefined>(
    puppet: Puppet<TDiff>,
    options: Partial<RunnerOptions<TDiff>>,
) {
    options = Object.assign({}, defaultOptions, options);

    let {
        difficulty,
        guess,
        delay,
        maximizeWindow,
        newGame,
    } = options as Required<RunnerOptions<TDiff>>;

    if (!browser) {
        const args = [];

        if (maximizeWindow) {
            args.push('--start-maximized');
        }

        browser = await launch({ headless: false, args, defaultViewport: null });
        browser.on('disconnected', () => process.exit(0));
    }

    console.log(c.cyan(`Starting ${c.underline(c.bold(puppet.name))}${c.reset(' ')}${c.cyan('Puppet')}`));

    const page = (await browser.pages())[0];

    if (!newGame || puppet !== lastPuppet || difficulty !== lastDifficulty) {
        console.debug(`Loading page...`);
        if (difficulty) {
            console.debug(`Selecting ${c.green(difficulty)}${c.reset('')} difficulty`);
            await puppet.load(page, difficulty);
        } else {
            await puppet.load(page);
        }
    } else {
        await puppet.newGame(page, puppet === lastPuppet);
    }

    addRuleDisplay(page);

    [ lastPuppet, lastDifficulty ] = [ puppet, difficulty ];

    let pq = new PQueue({ interval: delay, intervalCap: 1, concurrency: 1 });
    console.debug('Reading game');
    const board = await puppet.readGame(page),
        onSetValue = async (coord: CellCoord, value: CellValue) => {
            pq.add(async () => {
                await puppet.setCellValue(page, coord, value);
            });
        };

    console.debug(board.print());

    run(board, { guess, onSetValue });
    if (puppet.finish) {
        pq.add(async () => {
            await puppet.finish!(page);
        });
    }

    pq.add(() => Promise.wait(1000));
    await pq.onEmpty();
}

runPuppet.newGame = async function () {
    if (!lastPuppet) {
        console.error(`Cannot start a new game when the puppet has not yet been loaded.`);
        return;
    }

    const page = (await browser!.pages())[0];
    lastPuppet.newGame(page);
}

runPuppet.close = function () {
    return browser!.close();
}

type ParseCellValue = (cell: ElementHandle) => PromiseLike<string>;
export async function readGame(page: Page, cellSelector: string, parseCellValue: ParseCellValue): Promise<Board>;
export async function readGame(
    page: Page,
    rowSelector: string,
    cellSelector: string,
    parseCellValue: ParseCellValue
): Promise<Board>;
export async function readGame(
    page: Page,
    rowSelector: string,
    cellSelector: string | (ParseCellValue),
    parseCellValue?: ParseCellValue
): Promise<Board> {
    let gameStr: string | null;
    if (parseCellValue) {
        gameStr = await awaitRetry(async () => {
            const str =
                (await Promise.all((await page.$$(rowSelector)!).map(async row =>
                    (await Promise.all((await row.$$(cellSelector as string))
                        .map(parseCellValue as ParseCellValue)))
                        .join('')
                ))).join('\n');

            // 89 = 8 rows * (9 columns + 1 \n) + 1 row * 9 columns
            if (str.length !== 89) {
                await page.waitFor(500);
                return null;
            }

            return str;
        }, 6);
    } else {
        [ cellSelector, parseCellValue ] = [ rowSelector, cellSelector as ParseCellValue ];

        gameStr = await awaitRetry(async () => {
            const str =
                (await Promise.all((await Promise.all(await page.$$(cellSelector as string))).map(parseCellValue!)))
                    .reduce((arr, val, idx) => {
                            if (idx % 9 === 0) {
                                arr.push([] as string[]);
                            }

                            arr[arr.length - 1].push(val);

                            return arr;
                        }, [] as string[][])
                    .reduce((arr, row) => {
                            arr.push(row.join(''));
                            return arr;
                        }, [] as string[])
                    .join('\n');

            if (str.length !== 89) {
                await page.waitFor(500);
                return null;
            }

            return str;
        });
    }


    if (!gameStr) {
        throw new Error('Could not read game.');
    }

    return Board.parse(gameStr);
}

async function addRuleDisplay(page: Page): Promise<void> {
    const css = `
        #rulesDiv {
            position: absolute;
            top: 0;
            right: 0;
            background: lightgray;
        }

        #rulesDiv li.selected {
            font-weight: bold;
        }
    `;

    await page.evaluate(`
        if (!document.querySelector('#rulesDiv')) {
            const style = document.createElement('style'),
                rulesDiv = document.createElement('div');

            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = \`
                    ${css}
                \`;
            } else {
                style.appendChild(document.createTextNode(\`${css}\`));
            }

            document.head.append(style);

            rulesDiv.id = 'rulesDiv';
            document.body.prepend(rulesDiv);
        }
    `);
}