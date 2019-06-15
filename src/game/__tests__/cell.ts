import Cell from '../cell';
import cellValues from '../cell-values';

it('can be instantiated without a value', () => {
    const v = new Cell();
    expect(v).toMatchSnapshot();
});

it('can be instantiated with a value', () => {
    let v = new Cell(1);
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

    spy.mockRestore();
});

it('throws an error if instantiated with an invalid value', () => {
    const C = (Cell as any) as new (...args: any[]) => Cell,
        nc = (...args: any[]) => () => new C(...args);

    expect(nc('abc')).toThrowErrorMatchingInlineSnapshot(
        `"Invalid 'val' specified: abc"`
    );
    expect(nc([])).toThrowErrorMatchingInlineSnapshot(
        `"Invalid 'val' specified: "`
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

describe('canBe()', () => {
    it('with a value, only returns `true` for `canBe()` on its own value', () => {
        for (let i of cellValues()) {
            const v = new Cell(i);

            for (let j of cellValues()) {
                expect(v.canBe(j)).toBe(i === j);
            }
        }
    });

    it('without a value, returns `true` if a the value is in the `notes`, else `false`', () => {
        const v = new Cell();
        v.notes!.delete(1);
        for (let i of cellValues()) {
            expect(v.canBe(i)).toBe(i !== 1);
        }
    });
});

