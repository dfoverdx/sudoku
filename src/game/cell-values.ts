import '../helpers/array-extensions';
import { Notes } from './cell';

export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type CellValues = [CellValue, CellValue, CellValue, CellValue, CellValue, CellValue, CellValue, CellValue, CellValue];
export const AllCellValues = Array.makeReadonly([1, 2, 3, 4, 5, 6, 7, 8, 9] as CellValues);

export type CellIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type CellIndices = [CellIndex, CellIndex, CellIndex, CellIndex, CellIndex, CellIndex, CellIndex, CellIndex, CellIndex];
export const Indices = Array.makeReadonly([0, 1, 2, 3, 4, 5, 6, 7, 8] as CellIndices);

export default function* cellValues(notes?: Notes): IterableIterator<CellValue> {
    for (let i of AllCellValues) {
        if (!notes || notes[i -1]) {
            yield i;
        }
    }
}