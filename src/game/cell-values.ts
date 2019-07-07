export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const AllCellValues = new Set<CellValue>([ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);

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