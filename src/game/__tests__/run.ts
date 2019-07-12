import Board from '../board';
// import { rules } from '../run';
import run, { rules } from '../run';
import { EasyBoard, FullBoard, HardBoard, MediumBoard } from './__helpers__/test-boards';

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

    it('can beat hard difficulty level by combining rules', () => {
        const
            board = Board.parse(`
                ..7.....1
                .....4..2
                ...1...7.
                .2..96...
                .5....63.
                ..9.5.42.
                9.8..1...
                ....49...
                6....7.54
            `),
            rule1Board = board.clone(),
            rule2Board = board.clone();

        // gets stuck on rule 1
        while (rules.canOnlyBeValue(rule1Board)) { }
        expectBoardNotes(rule1Board).toMatchSnapshot('gets stuck with just rule 1');

        while (rules.onlyCellCanBeValue(rule2Board)) { }
        expectBoardNotes(rule2Board).toMatchSnapshot('gets stuck with just rule 2');

        expect(run(board)).toBe(true);
        expectBoardNotes(board).toMatchSnapshot('complete board');
    });

    it('can beat tough difficulty level by combining rules', () => {
        const board = Board.parse(`
                .9......3
                ..1....94
                ...189...
                ..79..2..
                ..87639..
                ..6..18..
                ..4832...
                13....4..
                6......7.
            `),
            rule1Board = board.clone(),
            rule2Board = board.clone();

        // gets stuck on rule 1
        while (rules.canOnlyBeValue(rule1Board)) { }
        expectBoardNotes(rule1Board).toMatchSnapshot('gets stuck with just rule 1');

        while (rules.onlyCellCanBeValue(rule2Board)) { }
        expectBoardNotes(rule2Board).toMatchSnapshot('gets stuck with just rule 2');

        run(board);
        // expect(run(board)).toBe(true);
        expectBoardNotes(board).toMatchSnapshot('complete board');
    });
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