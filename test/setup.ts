import Board from '../src/game/board';

export default function setup() {
    window.expectPrintBoardNotes = function(board: Board) {
        return expect(board.print(true));
    }
}