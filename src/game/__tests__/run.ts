import Board from '../board';
// import { rules } from '../run';
import run, { rules } from '../run';

// const rRun = rewire('run'),
//     // @ts-ignore
//     ruleCanOnlyBeValue = rRun.__get__('ruleCanOnlyBeValue'),
//     // @ts-ignore
//     ruleOnlyCellCanBeValue = rRun.__get__('ruleOnlyCellCanBeValue');

const EasyBoard = Board.parse(`
    .4.9..38.
    6......9.
    29.3745..
    .17.96.23
    ...2...54
    8.47.....
    ..253.9.8
    4...276.1
    .81...27.
`);

describe('run()', () => {
    it('returns true if the board is complete', () => {
        const fullBoard = Board.parse(`
            123456789
            456789123
            789123456
            234567891
            567891234
            891234567
            345678912
            678912345
            912345678`);

        expect(run(fullBoard)).toBe(true);
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
});