import cellValues, { CellValue } from './cell-values';

abstract class CellBase {
    public isValid: boolean = true;
    public abstract canBe(val: CellValue): boolean;
}

export class ValueCell extends CellBase {
    constructor(private val: CellValue) {
        super();

        if (!this.val || isNaN(this.val) || this.val < 1 || this.val > 9 || this.val !== parseInt(this.val)) {
            throw new Error(`Invalid 'val' specified: ${this.val}`);
        }
    }

    public get value() {
        return this.val;
    }

    public set value(val: CellValue) {
        if (this.val) {
            if (this.val !== val) {
                throw new Error(`Cannot set cell value to ${val}.  It has already been set to ${this.val}.`);
            } else {
                console.warn(`Attempting to set cell value to ${val} after it has already been set.`);
            }
        }

        this.val = val;
    }

    public canBe(val: CellValue) {
        return val === this.value;
    }
}

export class EmptyCell extends CellBase {
    public readonly notes: Set<CellValue> = new Set(cellValues());

    public canBe(val: CellValue) {
        return this.notes.has(val);
    }

    public mustBe(): CellValue | false {
        return this.notes.size === 1 ? this.notes.values().next().value : false;
    }

    public setValue(val: CellValue) {
        if (!this.canBe(val)) {
            throw new Error(`Cannot set cell to value ${val}.`);
        }

        delete (this as any).notes;
        this.constructor = ValueCell;
        (this as any as ValueCell).value = val;
    }
}

export type Cell = ValueCell | EmptyCell;