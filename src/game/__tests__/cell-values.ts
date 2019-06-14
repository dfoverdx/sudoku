import cellValues, { CellValue } from '../cell-values';

it('returns the values 1 through 9 when passed no arguments', () => {
    expect(Array.from(cellValues())).toMatchSnapshot();
});

it('only returns values in the supplied set if passed an argument', () => {
    const notesSet = new Set<CellValue>([ 1, 3, 5 ]);
    expect(Array.from(cellValues(notesSet))).toMatchSnapshot();

    const notesArray: CellValue[] = [ 4, 6, 9 ];
    expect(Array.from(cellValues(notesArray))).toMatchSnapshot();
});