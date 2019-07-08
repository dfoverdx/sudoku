import { AllCellValues, CellValue } from './cell-values';

export type Notes = Set<CellValue>;

export default class Cell {
    constructor(value: CellValue);
    constructor(notes?: Notes);
    constructor(val?: CellValue | Notes) {
        if (val instanceof Set) {
            this.notes = val;
        } else if (val !== undefined) {
            if (!val || isNaN(val) || val < 1 || val > 9 || val !== parseInt(val)) {
                throw new Error(`Invalid 'val' specified: ${val}`);
            }

            this._value = val;
        } else {
            this.notes = new Set(AllCellValues) as Notes;
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
            this.notes!.clear();
        }
    }


    public canBe(val: CellValue): boolean {
        if (this._value) {
            return this._value === val;
        }

        return this.notes!.has(val);
    }

    public mustBe(): CellValue | false {
        return !this.notes ? this._value as CellValue : 
            this.notes.size === 1 ? this.notes.values().next().value : false;
    }
}