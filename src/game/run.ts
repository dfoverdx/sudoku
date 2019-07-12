import Board from './board';
import { cellIs } from './cell';
import { AllCellValues, CellIndex } from './cell-values';

export default function run(board: Board): boolean {
    let madeChange = true;
    while (madeChange) {
        madeChange = [
            canOnlyBeValueRule(board),
            onlyCellCanBeValueRule(board),
            valueMustBeInRowOrColumnOfRegionRule(board),
        ].some(mc => mc);
    }

    return board.isComplete;
}

export const rules = {
    canOnlyBeValue: canOnlyBeValueRule,
    onlyCellCanBeValue: onlyCellCanBeValueRule,
    valueMustBeInRowOrColumnOfRegion: valueMustBeInRowOrColumnOfRegionRule,
};

function canOnlyBeValueRule(board: Board): boolean {
    let madeChange = false;

    for (const cell of board.cells()) {
        if (cell.value) {
            continue;
        }

        let mustBe = cell.mustBe();
        if (mustBe) {
            board.setValue(cell.coord, mustBe);
            madeChange = true;
        }
    }

    return !!madeChange;
}

function onlyCellCanBeValueRule(board: Board): boolean {
    let madeChange = false;

    for (const testVal of AllCellValues) {
        let idx: CellIndex | -1;

        for (const row of board.rows) {
            idx = row.indexOfOnly(cell => cell.canBe(testVal));
            if (idx !== -1 && cellIs.notes(row[idx])) {
                board.setValue(row[idx].coord, testVal);
                madeChange = true;
            }
        }

        for (const col of board.columns) {
            idx = col.indexOfOnly(cell => cell.canBe(testVal));
            if (idx !== -1 && cellIs.notes(col[idx])) {
                board.setValue(col[idx].coord, testVal);
                madeChange = true;
            }
        }

        for (const reg of board.regions) {
            idx = reg.indexOfOnly(cell => cell.canBe(testVal));
            if (idx !== -1 && cellIs.notes(reg[idx])) {
                board.setValue(reg[idx].coord, testVal);
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
                    allInCol =  true;
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