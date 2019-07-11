import Cell from '../cell';
import cellValues, { CellValue } from '../cell-values';

afterEach(() => {
    jest.restoreAllMocks();
});

it('can be instantiated with just coordinates', () => {
    const v = new Cell([0, 0]);
    expect(v).toMatchSnapshot();
});

it('can be instantiated with a value', () => {
    let v = new Cell([0, 0], 1);
    expect(v).toMatchSnapshot();
});

it('can be instantiated with an array', () => {
    let v = new Cell(
        [0, 0],
        [true, true, true, false, false, false, false, false, false]
    );
    expect(v).toMatchSnapshot();
});

it('can be instantiated with a Set', () => {
    let v = new Cell([0, 0], new Set<CellValue>([1, 2, 3]));
    expect(v).toMatchSnapshot();
});

it(`can't have its value overwritten`, () => {
    let v = new Cell([0, 0], 1);

    const spy = jest.spyOn(console, 'warn').mockImplementationOnce(msg => {
        expect(msg).toMatchInlineSnapshot(
            `"Attempting to set cell value to 1 after it has already been set."`
        );
    });
    v.setValue(1);
    expect(console.warn).toHaveBeenCalled();

    spy.mockClear();

    expect(() => v.setValue(2)).toThrowErrorMatchingInlineSnapshot(
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
        `"Invalid 'val' specified: abc"`
    );
    expect(nc([0, 0], [])).toThrowErrorMatchingInlineSnapshot(
        `"Notes array must contain 9 elements.  Found 0."`
    );
    expect(nc([0, 0], null)).toThrowErrorMatchingInlineSnapshot(
        `"Invalid 'val' specified: null"`
    );
    expect(nc([0, 0], 10)).toThrowErrorMatchingInlineSnapshot(
        `"Invalid 'val' specified: 10"`
    );
    expect(nc([0, 0], -1)).toThrowErrorMatchingInlineSnapshot(
        `"Invalid 'val' specified: -1"`
    );
    expect(nc([0, 0], 0)).toThrowErrorMatchingInlineSnapshot(
        `"Invalid 'val' specified: 0"`
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
});

it('prints', () => {
    let cell = new Cell([0, 0], 1);
    expect(cell.print()).toMatchInlineSnapshot(`
                                                                                                                "┌─┐
                                                                                                                │1│
                                                                                                                └─┘"
                                                        `);

    cell = new Cell([0, 0]);
    expect(cell.print()).toMatchInlineSnapshot(`
                                                                                                                                        "123
                                                                                                                                        456
                                                                                                                                        789
                                                                                                                                        "
                                                                    `);

    cell = new Cell([0, 0], new Set<CellValue>([1, 5, 9]));
    expect(cell.print()).toMatchInlineSnapshot(`
                "1  
                 5 
                  9
                "
        `);
});
