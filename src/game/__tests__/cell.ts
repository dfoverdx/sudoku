import Cell, { cellIs } from '../cell';
import cellValues, { CellValue } from '../cell-values';

afterEach(() => {
    jest.restoreAllMocks();
});

it('can be instantiated with just coordinates', () => {
    const cell = new Cell([0, 0]);
    expect(cell).toMatchSnapshot();
});

it('can be instantiated with a value', () => {
    const cell = new Cell([0, 0], 1);
    expect(cellIs.fixed(cell)).toBe(true);
    expect(cell).toMatchSnapshot();
});

it('can be instantiated with a value and not be fixed', () => {
    const cell = new Cell([0, 0], 1, false);
    expect(cellIs.fixed(cell)).toBe(false);
    expect(cell).toMatchSnapshot();
});

it('can be instantiated with an array', () => {
    let cell = new Cell(
        [0, 0],
        [true, true, true, false, false, false, false, false, false]
    );
    expect(cell).toMatchSnapshot();
});

it('can be instantiated with a Set', () => {
    let cell = new Cell([0, 0], new Set<CellValue>([1, 2, 3]));
    expect(cell).toMatchSnapshot();
});

it(`can't have its value overwritten`, () => {
    let cell = new Cell([0, 0], 1);

    const spy = jest.spyOn(console, 'warn').mockImplementationOnce(msg => {
        expect(msg).toMatchInlineSnapshot(
            `"Attempting to set cell value to 1 after it has already been set."`
        );
    });
    cell.setValue(1);
    expect(console.warn).toHaveBeenCalled();

    spy.mockClear();

    expect(() => cell.setValue(2)).toThrowErrorMatchingInlineSnapshot(
        `"Cannot set cell value to 2.  It has already been set to 1."`
    );
    expect(console.warn).not.toHaveBeenCalled();
});

it('throws an error if instantiated with an invalid value', () => {
    // @ts-ignore
    const nc = (...args: any[]) => () => new Cell(...args);

    // invalid index arguments
    expect(nc()).toThrowErrorMatchingInlineSnapshot(
        `"Coordinates 'undefined' is invalid.  It must be a 2-element array of element values 0-8."`
    );
    expect(nc([])).toThrowErrorMatchingInlineSnapshot(
        `"Coordinates '[]' is invalid.  It must be a 2-element array of element values 0-8."`
    );
    expect(nc([0])).toThrowErrorMatchingInlineSnapshot(
        `"Coordinates '[0]' is invalid.  It must be a 2-element array of element values 0-8."`
    );
    expect(nc([0, 1, 2])).toThrowErrorMatchingInlineSnapshot(
        `"Coordinates '[0,1,2]' is invalid.  It must be a 2-element array of element values 0-8."`
    );
    expect(nc([0, '1'])).toThrowErrorMatchingInlineSnapshot(
        `"Coordinates '[0,\\"1\\"]' is invalid.  It must be a 2-element array of element values 0-8."`
    );
    expect(nc([-1, 1])).toThrowErrorMatchingInlineSnapshot(
        `"Coordinates '[-1,1]' is invalid.  It must be a 2-element array of element values 0-8."`
    );
    expect(nc([1, 9])).toThrowErrorMatchingInlineSnapshot(
        `"Coordinates '[1,9]' is invalid.  It must be a 2-element array of element values 0-8."`
    );

    // invalid value arguments
    expect(nc([0, 0], 'abc')).toThrowErrorMatchingInlineSnapshot(
        `"Value '\\"abc\\"' is invalid.  It must be an integer between 1 and 9."`
    );
    expect(nc([0, 0], [])).toThrowErrorMatchingInlineSnapshot(
        `"Notes array must contain 9 elements.  Found 0."`
    );
    expect(nc([0, 0], null)).toThrowErrorMatchingInlineSnapshot(
        `"Value 'null' is invalid.  It must be an integer between 1 and 9."`
    );
    expect(nc([0, 0], 10)).toThrowErrorMatchingInlineSnapshot(
        `"Value '10' is invalid.  It must be an integer between 1 and 9."`
    );
    expect(nc([0, 0], -1)).toThrowErrorMatchingInlineSnapshot(
        `"Value '-1' is invalid.  It must be an integer between 1 and 9."`
    );
    expect(nc([0, 0], 0)).toThrowErrorMatchingInlineSnapshot(
        `"Value '0' is invalid.  It must be an integer between 1 and 9."`
    );
});

it('warns if setting a value to itself', () => {
    jest.spyOn(console, 'warn').mockImplementationOnce(msg => {
        expect(msg).toMatchInlineSnapshot(
            `"Attempting to set cell value to 1 after it has already been set."`
        );
    });

    const cell = new Cell([0, 0], 1);
    cell.setValue(1);
    expect(console.warn).toHaveBeenCalledTimes(1);
});

it('prints', () => {
    let cell = new Cell([0, 0], 1);
    expect(cell.print()).toMatchSnapshot('cell with value "1"');

    cell = new Cell([0, 0]);
    expect(cell.print()).toMatchSnapshot('cell with now value and all notes');

    cell = new Cell([0, 0], new Set<CellValue>([1, 5, 9]));
    expect(cell.print()).toMatchSnapshot('cell with notes 1, 5, and 9');
});

describe('canBe()', () => {
    it('with a value, only returns `true` for `canBe()` on its own value', () => {
        for (const i of cellValues()) {
            const cell = new Cell([0, 0], i);

            for (let j of cellValues()) {
                expect(cell.canBe(j)).toBe(i === j);
            }
        }
    });

    it('without a value, returns `true` if a the value is in the `notes`, else `false`', () => {
        const cell = new Cell([0, 0]);
        cell.removeNote(1);
        for (let i of cellValues()) {
            expect(cell.canBe(i)).toBe(i !== 1);
        }
    });

    it(`prints an error if setting a value to something not in the cell's notes`, () => {
        const cell = new Cell([0, 0], new Set<CellValue>([1, 2, 3])),
            err = jest
                .spyOn(console, 'error')
                .mockImplementationOnce(msg =>
                    expect(msg).toMatchInlineSnapshot(
                        `"Cannot set cell to value 4."`
                    )
                );

        cell.setValue(4);
        expect(err).toHaveBeenCalledTimes(1);
    });
});

describe('mustBe()', () => {
    it('returns the value of a fixed cell', () => {
        expect(new Cell([0, 0], 1).mustBe()).toBe(1);
    });

    it('returns the value of a cell with a value', () => {
        expect(new Cell([0, 0], 1, false).mustBe()).toBe(1);
    });

    it('returns the only value if there is only one note available', () => {
        expect(new Cell([0, 0], new Set<CellValue>([1])).mustBe()).toBe(1);
    });

    it('returns false if more than one note is available', () => {
        expect(new Cell([0, 0], new Set<CellValue>([1, 2])).mustBe()).toBe(
            false
        );
    });
});

describe('unsetsValue()', () => {
    test('non-fixed cells can have their values unset', () => {
        const cell = new Cell([0, 0], 1, false),
            err = jest.spyOn(console, 'error');
        cell.unsetValue();

        expect(err).not.toHaveBeenCalled();
        expect(cell).toMatchSnapshot();
    });

    test('fixed cells cannot have their values unset', () => {
        const cell = new Cell([0, 0], 1, true);
        expect(() => cell.unsetValue()).toThrowErrorMatchingInlineSnapshot(
            `"Attempting to unset the value of a fixed cell."`
        );
        expect(cell).toMatchSnapshot();
    });
});

describe('removeNote()', () => {
    it('throws an error if removing a note from a fixed cell', () => {
        const cell = new Cell([0, 0], 1);
        expect(() => cell.removeNote(2)).toThrowErrorMatchingInlineSnapshot(
            `"Cannot remove a note from a fixed cell."`
        );
    });

    it('returns false if the cell has a value', () => {
        let cell = new Cell([0, 0], 1, false);
        expect(cell.removeNote(1)).toBe(false);
        expect(cell.removeNote(2)).toBe(false);

        cell = new Cell([0, 0]);
        cell.setValue(1);
        expect(cell.removeNote(1)).toBe(false);
        expect(cell.removeNote(2)).toBe(false);
    });

    it('returns false if the note already is unset', () => {
        const cell = new Cell([0, 0], new Set<CellValue>([1]));
        expect(cell.removeNote(2)).toBe(false);
    });

    it('returns true if a note is removed', () => {
        const cell = new Cell([0, 0], new Set<CellValue>([1, 2]));
        expect(cell.removeNote(2)).toBe(true);
    });
});