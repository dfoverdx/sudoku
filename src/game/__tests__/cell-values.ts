import { Notes } from '../cell';
import cellValues, { assertValidCoordinates, assertValidIndex, assertValidValue, Indices } from '../cell-values';

it('returns the values 1 through 9 when passed no arguments', () => {
    expect(Array.from(cellValues())).toMatchSnapshot();
});

it('only returns values in the supplied set if passed an argument', () => {
    const notes: Notes = [
        false,
        false,
        false,
        true,
        false,
        true,
        false,
        false,
        true
    ];
    expect(Array.from(cellValues(notes))).toMatchSnapshot();
});

describe('assertValidValue', () => {
    afterEach(() => {
        // @ts-ignore
        window.DEVELOPMENT = true;
    });

    it('succeeds on values 1-9', () => {
        for (const v of cellValues()) {
            expect(assertValidValue(v)).toBe(true);
        }
    });

    it('throws an error in invalid values', () => {
        expect(() => assertValidValue(0)).toThrowErrorMatchingInlineSnapshot(
            `"Value '0' is invalid.  It must be an integer between 1 and 9."`
        );
        expect(() => assertValidValue(10)).toThrowErrorMatchingInlineSnapshot(
            `"Value '10' is invalid.  It must be an integer between 1 and 9."`
        );
        expect(() => assertValidValue([1])).toThrowErrorMatchingInlineSnapshot(
            `"Value '[1]' is invalid.  It must be an integer between 1 and 9."`
        );
        expect(() => assertValidValue(1.1)).toThrowErrorMatchingInlineSnapshot(
            `"Value '1.1' is invalid.  It must be an integer between 1 and 9."`
        );
        expect(() => assertValidValue('a')).toThrowErrorMatchingInlineSnapshot(
            `"Value '\\"a\\"' is invalid.  It must be an integer between 1 and 9."`
        );
        expect(() => assertValidValue(null)).toThrowErrorMatchingInlineSnapshot(
            `"Value 'null' is invalid.  It must be an integer between 1 and 9."`
        );
        expect(() =>
            assertValidValue(() => 1)
        ).toThrowErrorMatchingInlineSnapshot(
            `"Value 'undefined' is invalid.  It must be an integer between 1 and 9."`
        );
        // @ts-ignore
        expect(() => assertValidValue()).toThrowErrorMatchingInlineSnapshot(
            `"Value 'undefined' is invalid.  It must be an integer between 1 and 9."`
        );
    });

    it('returns true for invalid values when DEVELOPMENT = false', () => {
        // @ts-ignore
        window.DEVELOPMENT = false;

        expect(assertValidValue(0)).toBe(true);
        expect(assertValidValue(10)).toBe(true);
        expect(assertValidValue([1])).toBe(true);
        expect(assertValidValue(1.1)).toBe(true);
        expect(assertValidValue('a')).toBe(true);
        expect(assertValidValue(null)).toBe(true);
        expect(assertValidValue(() => 1)).toBe(true);
        // @ts-ignore
        expect(assertValidValue()).toBe(true);
    });
});

describe('assertValidIndex', () => {
    afterEach(() => {
        // @ts-ignore
        window.DEVELOPMENT = true;
    });

    it('succeeds on indices 0-8', () => {
        for (const v of Indices) {
            expect(assertValidIndex(v)).toBe(true);
        }
    });

    it('throws an error in invalid indices', () => {
        expect(() => assertValidIndex(-1)).toThrowErrorMatchingInlineSnapshot(
            `"Index '-1' is invalid.  It must be an integer between 0 and 8."`
        );
        expect(() => assertValidIndex(9)).toThrowErrorMatchingInlineSnapshot(
            `"Index '9' is invalid.  It must be an integer between 0 and 8."`
        );
        expect(() => assertValidIndex([1])).toThrowErrorMatchingInlineSnapshot(
            `"Index '[1]' is invalid.  It must be an integer between 0 and 8."`
        );
        expect(() => assertValidIndex(1.1)).toThrowErrorMatchingInlineSnapshot(
            `"Index '1.1' is invalid.  It must be an integer between 0 and 8."`
        );
        expect(() => assertValidIndex('a')).toThrowErrorMatchingInlineSnapshot(
            `"Index '\\"a\\"' is invalid.  It must be an integer between 0 and 8."`
        );
        expect(() => assertValidIndex(null)).toThrowErrorMatchingInlineSnapshot(
            `"Index 'null' is invalid.  It must be an integer between 0 and 8."`
        );
        expect(() =>
            assertValidIndex(() => 1)
        ).toThrowErrorMatchingInlineSnapshot(
            `"Index 'undefined' is invalid.  It must be an integer between 0 and 8."`
        );
        // @ts-ignore
        expect(() => assertValidIndex()).toThrowErrorMatchingInlineSnapshot(
            `"Index 'undefined' is invalid.  It must be an integer between 0 and 8."`
        );
    });

    it('returns true for invalid indices when DEVELOPMENT = false', () => {
        // @ts-ignore
        window.DEVELOPMENT = false;

        expect(assertValidIndex(-1)).toBe(true);
        expect(assertValidIndex(9)).toBe(true);
        expect(assertValidIndex([1])).toBe(true);
        expect(assertValidIndex(1.1)).toBe(true);
        expect(assertValidIndex('a')).toBe(true);
        expect(assertValidIndex(null)).toBe(true);
        expect(assertValidIndex(() => 1)).toBe(true);
        // @ts-ignore
        expect(assertValidIndex()).toBe(true);
    });
});

describe('assertValidCoordinates', () => {
    afterEach(() => {
        // @ts-ignore
        window.DEVELOPMENT = true;
    });

    it('succeeds on valid coordinates', () => {
        for (const row of Indices) {
            for (const col of Indices) {
                expect(assertValidCoordinates([row, col])).toBe(true);
            }
        }
    });

    it('throws an error in invalid coordinates', () => {
        expect(() =>
            // @ts-ignore
            assertValidCoordinates(0, 0)
        ).toThrowErrorMatchingInlineSnapshot(
            `"Coordinates '0' is invalid.  It must be a 2-element array of element values 0-8."`
        );
        expect(() =>
            assertValidCoordinates([-1, 0])
        ).toThrowErrorMatchingInlineSnapshot(
            `"Coordinates '[-1,0]' is invalid.  It must be a 2-element array of element values 0-8."`
        );
        expect(() =>
            assertValidCoordinates([0, 9])
        ).toThrowErrorMatchingInlineSnapshot(
            `"Coordinates '[0,9]' is invalid.  It must be a 2-element array of element values 0-8."`
        );
        expect(() =>
            assertValidCoordinates([0.1, 0])
        ).toThrowErrorMatchingInlineSnapshot(
            `"Coordinates '[0.1,0]' is invalid.  It must be a 2-element array of element values 0-8."`
        );
        expect(() =>
            assertValidCoordinates([0, 0.1])
        ).toThrowErrorMatchingInlineSnapshot(
            `"Coordinates '[0,0.1]' is invalid.  It must be a 2-element array of element values 0-8."`
        );
        expect(() =>
            assertValidCoordinates([0, 0, 0])
        ).toThrowErrorMatchingInlineSnapshot(
            `"Coordinates '[0,0,0]' is invalid.  It must be a 2-element array of element values 0-8."`
        );
        expect(() =>
            assertValidCoordinates([0, 0, undefined])
        ).toThrowErrorMatchingInlineSnapshot(
            `"Coordinates '[0,0,null]' is invalid.  It must be a 2-element array of element values 0-8."`
        );
        expect(() =>
            assertValidCoordinates([0, null])
        ).toThrowErrorMatchingInlineSnapshot(
            `"Coordinates '[0,null]' is invalid.  It must be a 2-element array of element values 0-8."`
        );
        expect(() =>
            assertValidCoordinates([0, '0'])
        ).toThrowErrorMatchingInlineSnapshot(
            `"Coordinates '[0,\\"0\\"]' is invalid.  It must be a 2-element array of element values 0-8."`
        );
        expect(() =>
            // @ts-ignore
            assertValidCoordinates()
        ).toThrowErrorMatchingInlineSnapshot(
            `"Coordinates 'undefined' is invalid.  It must be a 2-element array of element values 0-8."`
        );
    });

    it('returns true for invalid coordinates when DEVELOPMENT = false', () => {
        // @ts-ignore
        window.DEVELOPMENT = false;

        // @ts-ignore
        expect(assertValidCoordinates(0, 0)).toBe(true);
        expect(assertValidCoordinates([-1, 0])).toBe(true);
        expect(assertValidCoordinates([0, 9])).toBe(true);
        expect(assertValidCoordinates([0.1, 0])).toBe(true);
        expect(assertValidCoordinates([0, 0.1])).toBe(true);
        expect(assertValidCoordinates([0, 0, 0])).toBe(true);
        expect(assertValidCoordinates([0, 0, undefined])).toBe(true);
        expect(assertValidCoordinates([0, null])).toBe(true);
        expect(assertValidCoordinates([0, '0'])).toBe(true);
        // @ts-ignore
        expect(assertValidCoordinates()).toBe(true);
    });
});
