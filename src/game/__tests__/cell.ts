import Cell from '../cell';
import cellValues, { CellValue } from '../cell-values';

afterEach(() => {
    jest.restoreAllMocks();
});

it('can be instantiated without a value', () => {
    const v = new Cell();
    expect(v).toMatchSnapshot();
});

it('can be instantiated with a value', () => {
    let v = new Cell(1);
    expect(v).toMatchSnapshot();
});

it('can be instantiated with an array', () => {
    let v = new Cell([
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false
    ]);
    expect(v).toMatchSnapshot();
});

it('can be instantiated with a Set', () => {
    let v = new Cell(new Set<CellValue>([1, 2, 3]));
    expect(v).toMatchSnapshot();
});

it(`can't have its value overwritten`, () => {
    let v = new Cell(1);

    const spy = jest.spyOn(console, 'warn').mockImplementationOnce(msg => {
        expect(msg).toMatchInlineSnapshot(
            `"Attempting to set cell value to 1 after it has already been set."`
        );
    });
    v.value = 1;
    expect(console.warn).toHaveBeenCalled();

    spy.mockClear();

    expect(() => (v.value = 2)).toThrowErrorMatchingInlineSnapshot(
        `"Cannot set cell value to 2.  It has already been set to 1."`
    );
    expect(console.warn).not.toHaveBeenCalled();
});

it('throws an error if instantiated with an invalid value', () => {
    const C = (Cell as any) as new (...args: any[]) => Cell,
        nc = (...args: any[]) => () => new C(...args);

    expect(nc('abc')).toThrowErrorMatchingInlineSnapshot(
        `"Invalid 'val' specified: abc"`
    );
    expect(nc([])).toThrowErrorMatchingInlineSnapshot(
        `"Notes array must contain 9 elements.  Found 0."`
    );
    expect(nc(null)).toThrowErrorMatchingInlineSnapshot(
        `"Invalid 'val' specified: null"`
    );
    expect(nc(10)).toThrowErrorMatchingInlineSnapshot(
        `"Invalid 'val' specified: 10"`
    );
    expect(nc(-1)).toThrowErrorMatchingInlineSnapshot(
        `"Invalid 'val' specified: -1"`
    );
    expect(nc(0)).toThrowErrorMatchingInlineSnapshot(
        `"Invalid 'val' specified: 0"`
    );
});

it('warns if setting a value to itself unless parsing', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementationOnce(msg => {
            expect(msg).toMatchInlineSnapshot(
                `"Attempting to set cell value to 1 after it has already been set."`
            );
        }),
        cell = new Cell(1);

    cell.value = 1;
    expect(console.warn).toHaveBeenCalledTimes(1);

    spy.mockReset();
    try {
        Cell.parsing = true;
        cell.value = 1;
    } finally {
        Cell.parsing = false;
    }

    expect(console.warn).not.toHaveBeenCalled();
});

describe('canBe()', () => {
    it('with a value, only returns `true` for `canBe()` on its own value', () => {
        for (let i of cellValues()) {
            const cell = new Cell(i);

            for (let j of cellValues()) {
                expect(cell.canBe(j)).toBe(i === j);
            }
        }
    });

    it('without a value, returns `true` if a the value is in the `notes`, else `false`', () => {
        const cell = new Cell();
        cell.removeNote(1);
        for (let i of cellValues()) {
            expect(cell.canBe(i)).toBe(i !== 1);
        }
    });
});

it('prints', () => {
    let cell = new Cell(1);
    expect(cell.print()).toMatchInlineSnapshot(`
        "┌─┐
        │1│
        └─┘"
    `);

    cell = new Cell();
    expect(cell.print()).toMatchInlineSnapshot(`
                                "123
                                456
                                789
                                "
                `);

    cell = new Cell(new Set<CellValue>([1, 5, 9]));
    expect(cell.print()).toMatchInlineSnapshot(`
                "1  
                 5 
                  9
                "
        `);
});
