export {}

declare class Board {}

declare global {
    function expectBoardNotes(board: Board): jest.Matchers<string>;
    function expectBoardNotesSnapshot(board: Board, snapshotName?: string): string;
    function expectStringify(value: () => any, spaces?: number, replacer?: (string | number)[]): jest.Matchers<() => string>;
    function expectStringify(value: any, spaces?: number, replacer?: (string | number)[]): jest.Matchers<string>;

    interface Window {
        readonly DEVELOPMENT: true;

        expectBoardNotes(board: Board): jest.Matchers<string>;
        expectBoardNotesSnapshot(board: Board, snapshotName?: string): string;
        expectStringify(value: any, spaces?: number): jest.Matchers<string>;
    }
}