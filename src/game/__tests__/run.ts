import Board from '../board';
import run, { GuessResult, makeGuess, rules } from '../run';
import {
    AppExpertBoard, AppMasterBoard, AppMasterBoard2, AppToughBoard, FullBoard, SiteEasyBoard, SiteExpertBoard,
    SiteHardBoard
} from './__helpers__/test-boards';

afterEach(() => {
    jest.restoreAllMocks();
});

describe('run()', () => {
    it('returns true if the board is complete', () => {
        expect(run(FullBoard)).toBe(true);
    }, 2000);

    it('returns false if the board is incomplete', () => {
        expect(run(Board.Empty)).toBe(false);
    }, 2000);

    it('can beat tough difficulty level by combining rules', () => {
        const board = Board.parse(`
                .9......3
                ..1....94
                ...189...
                ..79..2..
                ..87639..
                ..6..18..
                ...832...
                13....4..
                6......7.
            `),
            rule1Board = board.clone(),
            rule2Board = board.clone();

        // gets stuck on rule 1
        while (rules.canOnlyBeValue(rule1Board)) {}
        expectBoardNotesSnapshot(rule1Board, 'gets stuck with just rule 1');

        while (rules.onlyCellCanBeValue(rule2Board)) {}
        expectBoardNotesSnapshot(rule2Board, 'gets stuck with just rule 2');

        run(board);
        expect(run(board)).toBe(true);
        expectBoardNotesSnapshot(board, 'complete board');
    });

    it('does its best on an expert difficulty level', () => {
        const board = AppExpertBoard.clone();
        run(board);
        expectBoardNotesSnapshot(board, 'expert board stuck');
    });

    it('does its best on a master difficulty level', () => {
        const board = AppMasterBoard.clone();
        run(board);
        expectBoardNotesSnapshot(board, 'master board stuck');
    });

    it('can beat any valid puzzle with guessing', () => {
        jest.spyOn(console, 'info').mockImplementation(() => void(0));

        let board = AppMasterBoard.clone();
        run(board, { guess: true });
        expectBoardNotesSnapshot(board, 'complete master board');

        board = AppMasterBoard2.clone();
        run(board, { guess: true });
        expectBoardNotesSnapshot(board, 'complete master board 2');

        board = Board.Empty;
        run(board, { guess: true });
        expectBoardNotesSnapshot(board, 'complete empty board');
    });

    it('handles guessing on invalid puzzles', () => {
        jest.spyOn(console, 'info').mockImplementation(() => void(0));
        let board = AppMasterBoard.clone();
        board.setValue([0, 0], 7);

        expect(run(board, { guess: true })).toBe(false);
    });
});

test('canOnlyBeValue', () => {
    let board = Board.Empty;
    expect(rules.canOnlyBeValue(board)).toBe(false);
    expectBoardNotesSnapshot(board, 'empty board');

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
    expectBoardNotesSnapshot(board, 'full row');

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
    expectBoardNotesSnapshot(board, 'three constraints');

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
    expectBoardNotesSnapshot(board, 'multiple gets in one go');

    board = SiteEasyBoard.clone();
    expect(rules.canOnlyBeValue(board)).toBe(true);
    expectBoardNotesSnapshot(board, 'easy mode');

    while (rules.canOnlyBeValue(board)) {}
    expectBoardNotesSnapshot(board, 'easy mode complete');

    board = SiteHardBoard.clone();
    while (rules.canOnlyBeValue(board)) {}
    expectBoardNotesSnapshot(board, 'hard board stuck');
});

test('onlyCellCanBeValue', () => {
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
    expectBoardNotesSnapshot(board, '[0, 2] = 3');

    board = SiteEasyBoard.clone();
    expect(rules.onlyCellCanBeValue(board)).toBe(true);
    expectBoardNotesSnapshot(board, 'easy board');

    while (rules.onlyCellCanBeValue(board)) {}
    expectBoardNotesSnapshot(board, 'easy board complete');

    board = AppToughBoard.clone();
    expect(rules.onlyCellCanBeValue(board)).toBe(true);
    expectBoardNotesSnapshot(board, 'tough board');

    while (rules.onlyCellCanBeValue(board)) {}
    expectBoardNotesSnapshot(board, 'tough board stuck');

    board = SiteHardBoard.clone();
    expect(rules.onlyCellCanBeValue(board)).toBe(true);
    expectBoardNotesSnapshot(board, 'hard board');

    while (rules.onlyCellCanBeValue(board)) {}
    expectBoardNotesSnapshot(board, 'hard board complete');
});

test('valueMustBeInRowOrColumnOfRegion', () => {
    let board = Board.parse(`
        .23......
        .56......
        .89......
        .........
        .........
        .........
        .........
        .........
        .........
    `);

    expect(rules.valueMustBeInRowOrColumnOfRegion(board)).toBe(true);
    expectBoardNotesSnapshot(board);
});

// test('setsOfValues', () => {
//     let board = Board.parse(`
//         1........
//         .5.....23
//         .89......
//         2........
//         .........
//         .........
//         3........
//         6........
//         .........
//     `);

//     expect(rules.setsOfValues(board)).toBe(true);
//     expectBoardNotesSnapshot(board, 'sets of two values');

//     board = Board.parse(`
//         1........
//         .5.....23
//         .89......
//         2........
//         .........
//         .........
//         3........
//         .........
//         .........
//     `);

//     expect(rules.setsOfValues(board)).toBe(true);
//     expectBoardNotesSnapshot(board, 'sets of 3 values');

//     board = Board.parse(`
//         1........
//         .5.....23
//         .89.....6
//         2........
//         .........
//         .........
//         3........
//         .........
//         .........
//     `);

//     expect(rules.setsOfValues(board)).toBe(true);
//     expectBoardNotesSnapshot(board, 'sets of mixed 2 and 3 values');
// });

// test('numOpenSpaces', () => {
//     const board = Board.parse(`
//         .23......
//         .56......
//         .89......
//         .........
//         .........
//         .........
//         .........
//         .........
//         .........
//     `);

//     expect(numOpenSpaces(board.region(0))).toBe(3);
//     expect(numOpenSpaces(board.region(2))).toBe(9);
// });

test('guess()', () => {

    let board = SiteExpertBoard.clone(),
        result: GuessResult | false = makeGuess(board) as GuessResult;
    expect(result).not.toBe(false);
    expectBoardNotesSnapshot(result[0], 'Guess a 3 at [1,1]');
    expect(result[1][0]).toEqual([1, 1]);
    expect(result[1][1]).toBe(3);

    result = makeGuess(board, result[1]) as GuessResult;
    expect(result).not.toBe(false);
    expectBoardNotesSnapshot(result[0], 'Guess a 5 at [1,1]');
    expect(result[1][0]).toEqual([1, 1]);
    expect(result[1][1]).toBe(5);

    result = makeGuess(board, result[1]);
    expect(result).toBe(false);
});
