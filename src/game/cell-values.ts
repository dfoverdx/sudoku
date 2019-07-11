import '../helpers/array-extensions';
import { Notes } from './cell';

export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type CellValues = [CellValue, CellValue, CellValue, CellValue, CellValue, CellValue, CellValue, CellValue, CellValue];
export const AllCellValues = Array.makeReadonly([1, 2, 3, 4, 5, 6, 7, 8, 9] as CellValues);

export type CellIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type CellIndices = [CellIndex, CellIndex, CellIndex, CellIndex, CellIndex, CellIndex, CellIndex, CellIndex, CellIndex];
export type CellCoord = [CellIndex, CellIndex];
export const Indices = Array.makeReadonly([0, 1, 2, 3, 4, 5, 6, 7, 8] as CellIndices);

export default function* cellValues(notes?: Notes): IterableIterator<CellValue> {
    for (let i of AllCellValues) {
        if (!notes || notes[i -1]) {
            yield i;
        }
    }
}

export function assertValidValue(value: any): value is CellValue {
    if (DEVELOPMENT) {
        const valueStr = JSON.stringify(value);
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 9) {
            throw new Error(`Value '${valueStr}' is invalid.  It must be an integer between 1 and 9.`);
        }
    }

    return true;
}

export function assertValidIndex(index: any): index is CellIndex {
    if (DEVELOPMENT) {
        const indexStr = JSON.stringify(index);
        if (typeof index !== 'number' || !Number.isInteger(index) || index < 0 || index > 8) {
            throw new Error(`Index '${indexStr}' is invalid.  It must be an integer between 0 and 8.`);
        }
    }

    return true;
}

export function assertValidCoordinates(coord: any): coord is CellCoord {
    if (DEVELOPMENT) {
        const coordStr = JSON.stringify(coord);
        if (!Array.isArray(coord) || coord.length !== 2) {
            throw new Error(`Coordinates '${coordStr}' is invalid.  It must be a 2-element array of element values 0-8.`);
        }

        const [row, col] = coord;
        try {
            assertValidIndex(row);
            assertValidIndex(col);
        } catch {
            throw new Error(`Coordinates '${coordStr}' is invalid.  It must be a 2-element array of element values 0-8.`);
        }
    }

    return true;
}