import Board from '../board';
// import { rules } from '../run';
import run, { rules } from '../run';
import { EasyBoard, FullBoard, HardBoard, MediumBoard } from './boards/test-boards';

// const rRun = rewire('run'),
//     // @ts-ignore
//     ruleCanOnlyBeValue = rRun.__get__('ruleCanOnlyBeValue'),
//     // @ts-ignore
//     ruleOnlyCellCanBeValue = rRun.__get__('ruleOnlyCellCanBeValue');

describe('run()', () => {
    it('returns true if the board is complete', () => {
        expect(run(FullBoard)).toBe(true);
    }, 2000);

    it('returns false if the board is incomplete', () => {
        expect(run(Board.Empty)).toBe(false);
    }, 2000);
});

test('ruleCanOnlyBeValue', () => {
    let board = Board.Empty;
    expect(rules.canOnlyBeValue(board)).toBe(false);
    expectBoardNotes(board).toMatchSnapshot('empty board');

    board = Board.parse(`
        12345678.
        .........
        .........
        .........
        .........
        .........
        .........
        .........
        .........
    `);

    expect(rules.canOnlyBeValue(board)).toBe(true);
    expectBoardNotes(board).toMatchSnapshot('full row');

    board = Board.parse(`
        123......
        .........
        ......456
        .........
        .........
        ........7
        .........
        .........
        ........8
    `);

    expect(rules.canOnlyBeValue(board)).toBe(true);
    expectBoardNotes(board).toMatchSnapshot('three constraints');

    board = Board.parse(`
        123...78.
        456......
        .89...456
        .........
        .........
        ........7
        .........
        .........
        ........8
    `);

    expect(rules.canOnlyBeValue(board)).toBe(true);
    expectBoardNotes(board).toMatchSnapshot('multiple gets in one go');

    board = EasyBoard.clone();
    expect(rules.canOnlyBeValue(board)).toBe(true);
    expectBoardNotes(board).toMatchSnapshot('easy mode');

    while (rules.canOnlyBeValue(board)) { }
    expectBoardNotes(board).toMatchSnapshot('easy mode complete');

    board = HardBoard.clone();
    while (rules.canOnlyBeValue(board)) { }
    expectBoardNotes(board).toMatchSnapshot('hard board stuck');
});

test('ruleOnlyCellCanBeValue', () => {
    let board = Board.parse(`
        .........
        ........3
        .....3...
        .3.......
        .........
        .........
        3........
        .........
        .........
    `);

    expect(rules.onlyCellCanBeValue(board)).toBe(true);
    expectBoardNotes(board).toMatchSnapshot('[0, 2] = 3');

    board = EasyBoard.clone();
    expect(rules.onlyCellCanBeValue(board)).toBe(true);
    expectBoardNotes(board).toMatchSnapshot('easy board');

    while (rules.onlyCellCanBeValue(board)) { }
    expectBoardNotes(board).toMatchSnapshot('easy board complete');

    board = MediumBoard.clone();
    expect(rules.onlyCellCanBeValue(board)).toBe(true);
    expectBoardNotes(board).toMatchSnapshot('medium board');

    while (rules.onlyCellCanBeValue(board)) { }
    expectBoardNotes(board).toMatchSnapshot('medium board stuck');

    board = HardBoard.clone();
    expect(rules.onlyCellCanBeValue(board)).toBe(true);
    expectBoardNotes(board).toMatchSnapshot('hard board');

    while (rules.onlyCellCanBeValue(board)) { }
    expectBoardNotes(board).toMatchSnapshot('hard board complete');
});