export {}

declare module '../../src/game/board';

import Board from '../../src/game/board';

declare global {
    function expectPrintBoardNotes(board: Board): jest.Matchers<string>;

    interface Window {
        expectPrintBoardNotes(board: Board): jest.Matchers<string>;
    }
}