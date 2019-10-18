// import Rewire from 'rewire';

declare var global: NodeJS.Global;
window = window || global;

// window.rewire = Rewire;

declare class Board {
    print(notes?: boolean): string;
}

window.expectBoardNotes = function(board: Board): jest.Matchers<string> {
    return expect('\n' + board.print(true));
}

window.expectBoardNotesSnapshot = function(board: Board, snapshotName: string): string {
    return expectBoardNotes(board).toMatchSnapshot(snapshotName);
}

// @ts-ignore
window.expectStringify = function(value: (() => any) | any, spaces?: number, replacer?: (string | number)[]) {
    if (typeof value === 'function') {
        return expect(() => JSON.stringify(value(), replacer, spaces));
    }

    return expect(JSON.stringify(value, replacer, spaces));
}

// @ts-ignore
window.DEVELOPMENT = true;