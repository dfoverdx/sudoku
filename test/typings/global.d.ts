export {}

// import Rewire from 'rewire';

declare class Board {}

declare global {
    // const rewire: typeof Rewire;

    function expectBoardNotes(board: Board): jest.Matchers<string>;
    function expectStringify(value: () => any, spaces?: number, replacer?: (string | number)[]): jest.Matchers<() => string>;
    function expectStringify(value: any, spaces?: number, replacer?: (string | number)[]): jest.Matchers<string>;

    interface Window {
        readonly DEVELOPMENT: true;

        // rewire: typeof Rewire;

        // @ts-ignore
        expectBoardNotes(board: Board): jest.Matchers<string>;
        expectStringify(value: any, spaces?: number): jest.Matchers<string>;
    }
}