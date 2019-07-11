import Board from './board';

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
            // @ts-ignore
            madeChange |= board.setValue(cell.coord, mustBe);
        }
    }

    return !!madeChange;
}

function ruleOnlyCellCanBeValue(board: Board): boolean {
    let madeChange = false;
    return !!madeChange;
}