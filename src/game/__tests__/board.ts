import Board, { genRegionIndices, getRegion } from '../board';
import { CellIndex, Indices } from '../cell-values';

it('constructs an empty board', () => {
    expect(Board.Empty).toMatchSnapshot('empty board');
});

describe('parse()', () => {
    it('constructs a board with values', () => {
        let board = Board.parse(`
            123456789
            .........
            .........
            .........
            .........
            .........
            .........
            .........
            .........
        `);
        expect(board).toMatchSnapshot('parsed board with one row');
        expect(board.print(true)).toMatchSnapshot(
            'one-row board printed notes'
        );

        board = Board.parse(`
            123456789
            456789123
            789123456
            .........
            .........
            .........
            .........
            .........
            .........
        `);
        expect(board).toMatchSnapshot('parsed board with 3 rows');

        board = Board.parse(`
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
        expect(board.print(true)).toMatchSnapshot('parsed easy board');
    });

    it('throws errors when parsing bad board data', () => {
        // empty string
        expect(() => Board.parse(``)).toThrowError();

        // 8 lines
        expect(() =>
            Board.parse(`
                012345678
                .........
                .........
                .........
                .........
                .........
                .........
                .........
                .........
            `)
        ).toThrowError();

        // 10 lines
        expect(() =>
            Board.parse(`
                123456789
                .........
                .........
                .........
                .........
                .........
                .........
                .........
                .........
                .........
            `)
        ).toThrowError();

        // missing values
        expect(() =>
            Board.parse(`
                1234567
                .........
                .........
                .........
                .........
                .........
                .........
                .........
                .........
            `)
        ).toThrowError();

        // extra values
        expect(() =>
            Board.parse(`
                1234567891
                .........
                .........
                .........
                .........
                .........
                .........
                .........
                .........
            `)
        ).toThrowError();
    });
});

// it('clones a board', () => {
//     const board = Board.parse(`
//             123456789
//             .........
//             .........
//             .........
//             .........
//             .........
//             .........
//             .........
//             .........
//         `),
//         clone = board.clone();

//     expect(clone).toEqual(board);
//     expect(clone.print()).toMatchInlineSnapshot(`
//                 "123|456|789
//                 ...|...|...
//                 ...|...|...
//                 ---+---+---
//                 ...|...|...
//                 ...|...|...
//                 ...|...|...
//                 ---+---+---
//                 ...|...|...
//                 ...|...|...
//                 ...|...|..."
//         `);

//     board.setValue(1, 0, 4);
//     expect(clone).not.toEqual(board);
//     expect(clone.values[1][0].value).toBe(4);
//     expect(board.values[1][0].value).toBeUndefined();
// });

it('sets values properly', () => {
    let board = Board.Empty;
    expect(board.setValue(0, 0, 1)).toBe(true);
    expect(board.print(true)).toMatchSnapshot('board with [0, 0] set to 1');

    expect(board.setValue(1, 2, 6)).toBe(true);
    expect(board.print(true)).toMatchSnapshot(
        'board with [0, 0] = 1, [1, 2] = 6'
    );

    expect(board.setValue(4, 2, 7)).toBe(true);
    expect(board.print(true)).toMatchSnapshot(
        'board with [0, 0] = 1, [1, 2] = 6, [4, 2] = 7'
    );

    board = Board.Empty;
    expect(board.setValue(0, 5, 6)).toBe(true);
    expect(board.print(true)).toMatchSnapshot('board with [5, 6] set to 6');
});

describe('helper functions', () => {
    test('getRegion() calculates the correct regions for various values', () => {
        for (const row of Indices) {
            const rowOff = row < 3 ? 0 : row < 6 ? 3 : 6;
            for (const col of Indices) {
                const colOff = col < 3 ? 0 : col < 6 ? 1 : 2,
                    region = getRegion(row, col);
                expect(region).toBe(rowOff + colOff);
            }
        }
    });

    test('genRegionIndicies calculates the correct indices for a given region', () => {
        function genReg(reg: CellIndex) {
            return JSON.stringify(Array.from(genRegionIndices(reg)));
        }
        expect(genReg(0)).toMatchInlineSnapshot(
            `"[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]]"`
        );
        expect(genReg(1)).toMatchInlineSnapshot(
            `"[[0,3],[0,4],[0,5],[1,3],[1,4],[1,5],[2,3],[2,4],[2,5]]"`
        );
        expect(genReg(2)).toMatchInlineSnapshot(
            `"[[0,6],[0,7],[0,8],[1,6],[1,7],[1,8],[2,6],[2,7],[2,8]]"`
        );
        expect(genReg(3)).toMatchInlineSnapshot(
            `"[[1,0],[1,1],[1,2],[2,0],[2,1],[2,2],[3,0],[3,1],[3,2]]"`
        );
        expect(genReg(4)).toMatchInlineSnapshot(
            `"[[1,3],[1,4],[1,5],[2,3],[2,4],[2,5],[3,3],[3,4],[3,5]]"`
        );
        expect(genReg(5)).toMatchInlineSnapshot(
            `"[[1,6],[1,7],[1,8],[2,6],[2,7],[2,8],[3,6],[3,7],[3,8]]"`
        );
        expect(genReg(6)).toMatchInlineSnapshot(
            `"[[2,0],[2,1],[2,2],[3,0],[3,1],[3,2],[4,0],[4,1],[4,2]]"`
        );
        expect(genReg(7)).toMatchInlineSnapshot(
            `"[[2,3],[2,4],[2,5],[3,3],[3,4],[3,5],[4,3],[4,4],[4,5]]"`
        );
        expect(genReg(8)).toMatchInlineSnapshot(
            `"[[2,6],[2,7],[2,8],[3,6],[3,7],[3,8],[4,6],[4,7],[4,8]]"`
        );
    });
});