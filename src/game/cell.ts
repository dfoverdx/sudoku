import '../helpers/array-extensions';
import { assertValidCoordinates, assertValidValue, CellCoord, CellIndex, CellValue, Indices } from './cell-values';

export type Notes = [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
const AllNotes: Notes = new Array(9).fill(true).toReadonly() as Notes;

export interface NotesCell extends Cell {
    readonly notes: Notes;
}

export interface ValueCell extends Cell {
    readonly value: CellValue;
}

export interface FixedCell extends ValueCell {
    readonly isValid: true;
    readonly notes: undefined;
}

export default class Cell {
    /**
     * Constructs an empty `NotesCell` at the given cell coordinates.
     */
    constructor(coord: CellCoord);

    /**
     * Constructs a `FixedCell` at the given cell coordinates with the given value.
     */
    constructor(coord: CellCoord, value: CellValue);

    /**
     * Constructs a `NotesCell` at the given cell coordinates with the given set of available values.
     */
    constructor(coord: CellCoord, noteSet: Set<CellValue>);

    /**
     * Constructs a `NotesCell` at the given cell coordinates with the given notes.
     */
    constructor(coord: CellCoord, notes: Notes);
    constructor(
        public readonly coord: CellCoord,
        val: CellValue | Notes | Set<CellValue> = AllNotes.slice() as Notes
    ) {
        assertValidCoordinates(coord);

        if (val instanceof Set) {
            this.notes = Indices.map(i => val.has(i + 1 as CellValue)) as Notes;
        } else if (Array.isArray(val)) {
            if (val.length !== 9) {
                throw new Error(`Notes array must contain 9 elements.  Found ${val.length}.`);
            }

            this.notes = val.slice() as Notes;
        } else if (val !== undefined) {
            if (!val || isNaN(val) || val < 1 || val > 9 || val !== parseInt(val)) {
                throw new Error(`Invalid 'val' specified: ${val}`);
            }

            this._value = val;
        }
    }

    /**
     * Whether or not the cell is valid, that is, whether the `CellValue` is available according to the cell's `notes`.
     */
    public isValid: boolean = true;

    /**
     * The list of values this cell can possibly be.  If the cell is a `FixedCell`, is `undefined`.
     */
    public readonly notes?: Notes;

    private _value?: CellValue;

    /**
     * The value of the cell.  Is `undefined` if this cell is a `NotesCell`.
     */
    public get value() {
        return this._value;
    }

    /**
     * Sets the value of the cell.
     */
    public setValue(val: CellValue) {
        if (val) {
            assertValidValue(val);

            if (this._value) {
                if (val !== this._value) {
                    throw new Error(`Cannot set cell value to ${val}.  It has already been set to ${this._value}.`);
                } else {
                    console.warn(`Attempting to set cell value to ${val} after it has already been set.`);
                }
            } else if (!this.canBe(val)) {
                console.error(`Cannot set cell to value ${val}.`);
                this.isValid = false;
            }
        }

        this._value = val;
        if (this.notes && this._value) {
            this.notes.fill(false);
        }
    }

    /**
     * Returns whether the cell can be the specified value.
     */
    public canBe(val: CellValue): boolean {
        if (this._value) {
            return this._value === val;
        }

        return this.notes![val - 1];
    }

    /**
     * If the cell has only one available value in the notes, returns that value.  Else, returns false.
     */
    public mustBe(): CellValue | false {
        if (!this.notes) {
            return this._value as CellValue;
        }

        const idx = this.notes.indexOfOnly<CellIndex>(v => v);
        if (idx === -1) {
            return false;
        }

        return idx + 1 as CellValue;
    }

    /**
     * Removes the specified value from the cell's notes.
     */
    public removeNote(value: CellValue): boolean {
        if (!this.notes) {
            return false;
        }

        let oldVal = this.notes[value - 1];
        this.notes[value - 1] = false;
        return oldVal;
    }

    /**
     * Prints the cell's value or its notes in a 3x3 character string.
     */
    public print(): string {
        if (this.value) {
            return `
┌─┐
│${this.value}│
└─┘`.trim();
        }

        const n = (v: CellValue) => this.notes![v - 1] ? v : ' ';
        return [
            [n(1), n(2), n(3)],
            [n(4), n(5), n(6)],
            [n(7), n(8), n(9)],
        ].map(row => row.join('') + '\n').join('');
    }
}

export const cellIs = {
    notes(cell: Cell): cell is NotesCell {
        return !cell.value;
    },

    fixed(cell: Cell): cell is FixedCell {
        return !cell.notes;
    },

    value(cell: Cell): cell is ValueCell {
        return !!cell.value;
    }
}