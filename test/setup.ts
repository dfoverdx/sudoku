// import Rewire from 'rewire';

declare var global: any;
window = window || global;

// window.rewire = Rewire;

declare class Board {
    print(notes?: boolean): string;
}

// @ts-ignore
window.expectBoardNotes = function(board: Board) {
    return expect(board.print(true));
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