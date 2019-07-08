import { Notes } from '../cell';
import cellValues from '../cell-values';

it('returns the values 1 through 9 when passed no arguments', () => {
    expect(Array.from(cellValues())).toMatchSnapshot();
});

it('only returns values in the supplied set if passed an argument', () => {
    const notes: Notes = [ false, false, false, true, false, true, false, false, true ];
    expect(Array.from(cellValues(notes))).toMatchSnapshot();
});