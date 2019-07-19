import '../helpers/array-extensions';
import { getRegion } from './board';
import { assertValidCoordinates, assertValidValue, CellCoord, CellIndex, CellValue, Indices } from './cell-values';

export type Notes = [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
const AllNotes: Notes = new Array(9).fill(true).toReadonly() as Notes;

export interface NotesSet extends Set<CellValue> {}
export const NotesSet = Set;

export interface NotesCell extends Cell {
    readonly notes: Notes;
    readonly notesArray: CellValue[];
    readonly notesSet: NotesSet;
}

export interface ValueCell extends Cell {
    readonly value: CellValue;
}

export interface FixedCell extends ValueCell {
    readonly isValid: true;
    readonly notes: undefined;
}

export type CellType = NotesCell | ValueCell | FixedCell;

export default class Cell {
    /**
     * Constructs an empty `NotesCell` at the given cell coordinates.
     */
    constructor(coord: CellCoord);

    /**
     * Constructs a `ValueCell` or a `FixedCell` at the given cell coordinates with the given value.
     */
    constructor(coord: CellCoord, value: CellValue, fixed?: boolean);

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
        val: CellValue | Notes | Set<CellValue> = AllNotes.slice() as Notes,
        fixed?: boolean
    ) {
        assertValidCoordinates(coord);

        if (val instanceof Set) {
            this.notes = Indices.map(i => val.has(i + 1 as CellValue)) as Notes;
        } else if (Array.isArray(val)) {
            if (val.length !== 9) {
                throw new Error(`Notes array must contain 9 elements.  Found ${val.length}.`);
            }

            this.notes = val.slice() as Notes;
        } else {
            assertValidValue(val);
            this._value = val;

            if (fixed === false) {
                this.notes = new Array(9).fill(false) as Notes;
            }
        }
    }

    /**
     * Whether or not the cell is valid, that is, whether the `CellValue` is available according to the cell's `notes`.
     */
    public isValid = true;

    /**
     * The list of values this cell can possibly be.  If the cell is a `FixedCell`, is `undefined`.
     */
    public readonly notes?: Notes;

    private _value?: CellValue;

    public get row() {
        return this.coord[0];
    }

    public get column() {
        return this.coord[1];
    }

    public get region() {
        return getRegion(this.coord);
    }

    public get notesArray(): CellValue[] | undefined {
        if (!cellIs.notes(this)) {
            return undefined;
        }

        return this.notes.map((v, i) => v ? i + 1 as CellValue : 0).filter(v => v) as CellValue[];
    }

    public get notesSet(): NotesSet | undefined {
        if (!cellIs.notes(this)) {
            return undefined;
        }

        return new Set<CellValue>(this.notesArray);
    }

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

        this._value = val;
        if (this.notes && this._value) {
            this.notes.fill(false);
        }
    }

    public unsetValue(): void {
        if (cellIs.fixed(this)) {
            throw new Error(`Attempting to unset the value of a fixed cell.`);
        }

        this._value = undefined;
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
        if (cellIs.value(this)) {
            return this._value!;
        }

        const idx = this.notes!.indexOfOnly<CellIndex>(v => v);
        if (idx === -1) {
            return false;
        }

        return idx + 1 as CellValue;
    }

    /**
     * Removes the specified value from the cell's notes.
     */
    public removeNote(value: CellValue): boolean {
        if (cellIs.fixed(this)) {
            throw new Error(`Cannot remove a note from a fixed cell.`);
        }

        let oldVal = this.notes![value - 1];
        this.notes![value - 1] = false;
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
};