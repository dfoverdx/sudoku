import { EmptyCell, ValueCell } from '../cell';
import cellValues from '../cell-values';

describe('ValueCell', () => {
    it('can be instantiated', () => {
        let v = new ValueCell(1);
        expect(v.isValid).toBe(true);
    });

    it(`can't have its value overwritten`, () => {
        let v = new ValueCell(1);

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
        const VC = (ValueCell as any) as new (...args: any[]) => ValueCell,
            nvc = (...args: any[]) => () => new VC(...args);

        expect(nvc()).toThrowErrorMatchingInlineSnapshot(
            `"Invalid 'val' specified: undefined"`
        );
        expect(nvc('abc')).toThrowErrorMatchingInlineSnapshot(
            `"Invalid 'val' specified: abc"`
        );
        expect(nvc([])).toThrowErrorMatchingInlineSnapshot(
            `"Invalid 'val' specified: "`
        );
        expect(nvc(null)).toThrowErrorMatchingInlineSnapshot(
            `"Invalid 'val' specified: null"`
        );
        expect(nvc(10)).toThrowErrorMatchingInlineSnapshot(
            `"Invalid 'val' specified: 10"`
        );
        expect(nvc(-1)).toThrowErrorMatchingInlineSnapshot(
            `"Invalid 'val' specified: -1"`
        );
        expect(nvc(0)).toThrowErrorMatchingInlineSnapshot(
            `"Invalid 'val' specified: 0"`
        );
    });

    describe('canBe()', () => {
        it('only returns `true` for `canBe()` on its own value', () => {
            for (let i of cellValues()) {
                const v = new ValueCell(i);

                for (let j of cellValues()) {
                    expect(v.canBe(j)).toBe(i === j);
                }
            }
        });
    });
});

describe('EmptyCell', () => {
    it('can be instantiated', () => {
        const v = new EmptyCell();
        expect(v).toMatchSnapshot();
    });

    describe('canBe', () => {
        it('returns `true` if a the value is in the `notes`, else `false`', () => {
            const v = new EmptyCell();
            v.notes.delete(1);
            for (let i of cellValues()) {
                expect(v.canBe(i)).toBe(i !== 1);
            }
        });
    });
});
