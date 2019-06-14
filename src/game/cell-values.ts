export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export default function* cellValues(notes?: Set<CellValue> | CellValue[]): IterableIterator<CellValue> {
    if (notes && Array.isArray(notes)) {
        notes = new Set(notes);
    }
    
    for (let i = 1; i <= 9; i++) {
        if (!notes || notes.has(i as CellValue)) {
            yield i as CellValue;
        }
    }
}