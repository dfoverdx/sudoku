import '../helpers/readonly-array';

export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type CellValues = [CellValue, CellValue, CellValue, CellValue, CellValue, CellValue, CellValue, CellValue, CellValue];
export const AllCellValues = Array.makeReadOnly([1, 2, 3, 4, 5, 6, 7, 8, 9] as CellValues);
export type CellIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type CellIndices = [CellIndex, CellIndex, CellIndex, CellIndex, CellIndex, CellIndex, CellIndex, CellIndex, CellIndex];
export const Indices = Array.makeReadOnly([0, 1, 2, 3, 4, 5, 6, 7, 8] as CellIndices);

export default function* cellValues(notes?: Set<CellValue> | CellValue[]): IterableIterator<CellValue> {
    if (notes && Array.isArray(notes)) {
        notes = new Set<CellValue>(notes);
    }
    
    for (let i of AllCellValues) {
        if (!notes || notes.has(i)) {
            yield i;
        }
    }
}