import Board from './board';
import { cellIs, CellType, NotesCell } from './cell';
import { AllCellValues, CellCoord, CellIndex, CellValue } from './cell-values';

export type GuessResult = [Board, [CellCoord, CellValue]];
type OnSetValue = (coord: CellCoord, value: CellValue) => void;
type OnRuleChage = (rule: number) => void;

interface RunOptions {
    guess?: boolean;
    onSetValue?: OnSetValue;
    onRuleChange?: OnRuleChage;
}

export default function run(
    board: Board,
    {
        guess,
        onSetValue,
        onRuleChange,
    }: RunOptions = { guess: false }
): boolean {
    let madeChange = 1;
    const rules = [
        () => canOnlyBeValueRule(board, onSetValue),
        () => onlyCellCanBeValueRule(board, onSetValue),
        () => valueMustBeInRowOrColumnOfRegionRule(board),
        // setsOfValuesRule(board),
    ];

    while (madeChange) {
        madeChange = 0;
        for (let i = 0; i < rules.length; i++) {
            onRuleChange && onRuleChange(i + 1);
            madeChange |= (rules[i]() as any as number);
        }
    }

    if (guess && !board.isComplete) {
        let result = makeGuess(board);

        if (!result) {
            return false;
        }

        let guessed: [CellCoord, CellValue],
            clone: Board;
        do {
            [clone, guessed] = result;
            console.info(`Guessing value ${guessed[1]} at ${JSON.stringify(guessed[0])}`);
            if (run(clone, { guess: true })) {
                for (const cell of board.cells) {
                    if (cellIs.notes(cell)) {
                        let cloneCell = clone.cellAt(cell.coord);
                        board.setValue(cloneCell.coord, cloneCell.value!);
                        onSetValue && onSetValue(cloneCell.coord, cloneCell.value!);
                    }
                }

                return true;
            }
        } while ((result = makeGuess(board, guessed)) !== false);

        return false;
    }

    return board.isComplete;
}

export const rules = {
    canOnlyBeValue: canOnlyBeValueRule,
    onlyCellCanBeValue: onlyCellCanBeValueRule,
    valueMustBeInRowOrColumnOfRegion: valueMustBeInRowOrColumnOfRegionRule,
    // setsOfValues: setsOfValuesRule,
};

function canOnlyBeValueRule(board: Board, onSetValue?: OnSetValue): boolean {
    let madeChange = false;

    for (const cell of board.cells) {
        if (cell.value) {
            continue;
        }

        let mustBe = cell.mustBe();
        if (mustBe) {
            board.setValue(cell.coord, mustBe);
            onSetValue && onSetValue(cell.coord, mustBe);
            madeChange = true;
        }
    }

    return !!madeChange;
}

function onlyCellCanBeValueRule(board: Board, onSetValue?: OnSetValue): boolean {
    let madeChange = false;

    for (const testVal of AllCellValues) {
        let idx: CellIndex | -1;

        for (const row of board.rows) {
            idx = row.indexOfOnly(cell => cell.canBe(testVal));
            if (idx !== -1 && cellIs.notes(row[idx])) {
                board.setValue(row[idx].coord, testVal);
                onSetValue && onSetValue(row[idx].coord, testVal);
                madeChange = true;
            }
        }

        for (const col of board.columns) {
            idx = col.indexOfOnly(cell => cell.canBe(testVal));
            if (idx !== -1 && cellIs.notes(col[idx])) {
                board.setValue(col[idx].coord, testVal);
                onSetValue && onSetValue(col[idx].coord, testVal);
                madeChange = true;
            }
        }

        for (const reg of board.regions) {
            idx = reg.indexOfOnly(cell => cell.canBe(testVal));
            if (idx !== -1 && cellIs.notes(reg[idx])) {
                board.setValue(reg[idx].coord, testVal);
                onSetValue && onSetValue(reg[idx].coord, testVal);
                madeChange = true;
            }
        }
    }

    return madeChange;
}

function valueMustBeInRowOrColumnOfRegionRule(board: Board): boolean {
    let madeChange = false;

    for (const reg of board.regions) {
        const unfilledCells = reg.filter(c => cellIs.notes(c));
        for (const cell of unfilledCells) {
            for (const val of AllCellValues.filter(v => cell.canBe(v))) {
                let allInRow = true,
                    allInCol = true;
                const otherCells = unfilledCells.filter(c => c !== cell && c.canBe(val));
                if (!otherCells.length) {
                    continue;
                }

                for (const otherCell of otherCells) {
                    if (cell.row !== otherCell.row) {
                        allInRow = false;
                    }

                    if (cell.column !== otherCell.column) {
                        allInCol = false;
                    }

                    if (!allInRow && !allInCol) {
                        break;
                    }
                }

                if (DEVELOPMENT) {
                    if (allInRow && allInCol) {
                        throw new Error(`Somehow both allInRow and allInCol are true`);
                    }
                }

                if (!allInRow && !allInCol) {
                    continue;
                }

                const cellReg = cell.region;
                if (allInRow) {
                    for (const otherCell of board.row(cell.row).filter(c => c.region !== cellReg)) {
                        madeChange = cellIs.notes(otherCell) && otherCell.removeNote(val) || madeChange;
                    }
                } else {
                    for (const otherCell of board.column(cell.column).filter(c => c.region !== cellReg)) {
                        madeChange = cellIs.notes(otherCell) && otherCell.removeNote(val) || madeChange;
                    }
                }
            }
        }
    }

    return madeChange;
}

// export function setsOfValuesRule(board: Board): boolean {
//     let madeChange = false;

//     const rows = board.rows,
//         cols = board.columns,
//         regs = board.regions;

//     for (const groups of [rows, cols, regs]) {
//         for (const group of groups) {
//             const finishedCells = new Set<Cell>(),
//                 numOpen = numOpenSpaces(group);

//             for (const cell of group) {
//                 if (finishedCells.has(cell)) {
//                     continue;
//                 }

//                 const notesSet = cell.notesSet;
//                 if (!notesSet) {
//                     finishedCells.add(cell);
//                     continue;
//                 }

//                 // checking for < 2 is not strictly necessary but could optimize in some cases
//                 if (notesSet.size === numOpen || notesSet.size < 2) {
//                     finishedCells.add(cell);
//                     continue;
//                 }

//                 for (let numNotes = 2; numNotes < notesSet.size - 1; numNotes++) {

//                 }
//             }
//         }
//     }

//     return madeChange;
// }


export function makeGuess(board: Board): [Board, [CellCoord, CellValue]] | false;
export function makeGuess(board: Board, [cellCoord, prevGuess]: [CellCoord, CellValue]):
    [Board, [CellCoord, CellValue]] | false;
export function makeGuess(
    board: Board,
    [cellCoord, prevGuess]: [CellCoord, CellValue] | [undefined, undefined] = [undefined, undefined]
): [Board, [CellCoord, CellValue]] | false {
    // @ts-ignore
    let minNotes: CellIndex = 10,
        minCell: CellType | undefined = undefined,
        minCellNotes: CellValue[],
        guess: CellValue,
        clone = board.clone();

    if (!cellCoord) {
        for (const cell of clone.cells) {
            if (cellIs.value(cell)) {
                continue;
            }

            if (!cell.isValid) {
                return false;
            }

            const notes = cell.notesArray;
            if (notes.length === 0) {
                board.cellAt(cell.coord).isValid = false;
                return false;
            }

            if (notes.length < minNotes) {
                minNotes = notes.length as CellIndex;
                minCell = cell;
                minCellNotes = notes;
            }
        }

        if (!minCell) {
            throw new Error(`Somehow got through guess() without finding a minCell.  Should have returned false.`);
        }

        guess = minCellNotes![0];
    } else {
        minCell = board.cellAt(cellCoord) as NotesCell;
        guess = minCell.notesArray.filter(v => v > (prevGuess || 0))[0];

        if (!guess) {
            return false;
        }
    }

    clone.setValue(minCell.coord, guess);
    return [clone, [minCell.coord, guess]];
}

// /**
//  * Recursively finds sets of cells containing exactly the same notes as the given cell.
//  *
//  * @param cell The cell being examined.
//  * @param maxNumNotes The maximum number of notes this rule applies to for the given cell group.
//  * @param group The group of cells to examine.
//  * @param idx The current cell index to examine.
//  * @param notesSet The current set of notes being examined.
//  * @param finishedCells Cells that have already been examined and may be skipped.
//  */
// export function findCompatibleSets(
//     cell: Cell,
//     maxNumNotes: 2 | 3 | 4 | 5 | 6 | 7 | 8,
//     group: CellGroup,
//     idx: CellIndex,
//     cellSet: Set<Cell>,
//     notesSet: NotesSet,
//     finishedCells: Set<Cell>
// ): [Set<Cell>, NotesSet] | undefined {
//     let nextCell = group[idx++],
//         nextNotesSet: NotesSet;

//     while (finishedCells.has(cell) ||
//            nextCell === cell ||
//            !cellIs.notes(nextCell) ||
//            (nextNotesSet = nextCell.notesSet).size > maxNumNotes ||
//            nextNotesSet.size < 2) {
//         if (idx < 9) {
//             nextCell = group[idx++];
//         } else if (cellSet.size) {
//             return [cellSet, notesSet];
//         } else {
//             return undefined;
//         }
//     }

//     return undefined;
// }

// function isSubset<T>(superSet: Set<T>, subset: Set<T>): boolean {
//     for (const t of subset) {
//         if (!superSet.has(t)) {
//             return false;
//         }
//     }

//     return true;
// }

// export function numOpenSpaces(cellGroup: CellGroup): 0 | CellValue {
//     return cellGroup.filter(c => cellIs.notes(c)).length as 0 | CellValue;
// }