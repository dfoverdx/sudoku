import Board from './board';
import { cellIs } from './cell';
import { AllCellValues, CellIndex } from './cell-values';

export default function run(board: Board): boolean {
    let madeChange = true;
    while (madeChange) {
        madeChange = !!(
            // @ts-ignore
            ruleCanOnlyBeValue(board) |
            ruleOnlyCellCanBeValue(board)
        );
    }

    return board.isComplete;
}

export const rules = {
    canOnlyBeValue: ruleCanOnlyBeValue,
    onlyCellCanBeValue: ruleOnlyCellCanBeValue
};

function ruleCanOnlyBeValue(board: Board): boolean {
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

function ruleOnlyCellCanBeValue(board: Board): boolean {
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

        for (const col of board.cols) {
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