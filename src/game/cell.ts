import '../helpers/array-extensions';
import { CellIndex, CellValue } from './cell-values';

export type Notes = [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
const AllNotes: Notes = new Array(9).fill(true).toReadonly() as Notes;

export default class Cell {
    constructor(value: CellValue);
    constructor(notes?: Notes);
    constructor(val: CellValue | Notes = AllNotes.slice() as Notes) {
        if (Array.isArray(val)) {
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

    public isValid: boolean = true;

    public readonly notes?: Notes;

    private _value?: CellValue;
    public get value() {
        return this._value;
    }

    public set value(val) {
        if (val) {
            if (this._value) {
                if (val !== this._value) {
                    throw new Error(`Cannot set cell value to ${val}.  It has already been set to ${this._value}.`);
                } else {
                    console.warn(`Attempting to set cell value to ${val} after it has already been set.`);
                }
            } else if (val && !this.canBe(val)) {
                throw new Error(`Cannot set cell to value ${val}.`);
            }
        }

        this._value = val;
        if (this.notes) {
            this.notes.fill(false);
        }
    }


    public canBe(val: CellValue): boolean {
        if (this._value) {
            return this._value === val;
        }

        return this.notes![val - 1];
    }

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

    public removeNote(val: CellValue): boolean {
        if (!this.notes) {
            return false;
        }

        let oldVal = this.notes[val - 1];
        this.notes[val - 1] = false;
        return oldVal;
    }
}