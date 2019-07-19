import '../helpers/array-extensions';
import Cell, { cellIs, CellType, ValueCell } from './cell';
import {
    AllCellValues, assertValidCoordinates, assertValidValue, CellCoord, CellIndex, CellValue, Indices
} from './cell-values';

type RegionIndices = [
    CellCoord, CellCoord, CellCoord,
    CellCoord, CellCoord, CellCoord,
    CellCoord, CellCoord, CellCoord
];
type BoardRegionIndices = [
    RegionIndices, RegionIndices, RegionIndices,
    RegionIndices, RegionIndices, RegionIndices,
    RegionIndices, RegionIndices, RegionIndices
];

export type CellGroup = [CellType, CellType, CellType, CellType, CellType, CellType, CellType, CellType, CellType];
export type Row = CellGroup;
export type Column = CellGroup;
export type Region = CellGroup;
export type Cells<T extends Row | Column | Region = Row> = [T, T, T, T, T, T, T, T, T];

/**
 * Represents a 9x9 Sudoku board.
 */
export default class Board {
    /**
     * Constructs a board with the given values.
     *
     * @param values The cell values of the board.
     */
    constructor(private readonly values: Cells) {
        this.initNotes();
    }

    /**
     * Returns whether the board is filled or not.
     */
    get isComplete(): boolean {
        for (const cell of this.cells) {
            if (!cell.value || !cell.isValid) {
                return false;
            }
        }

        return true;
    }

    /**
     * Iterates through all cells in board in row-major order.
     */
    get cells(): IterableIterator<CellType> {
        const self = this;
        return (function* () {
            for (const row of self.rows) {
                for (const cell of row) {
                    yield cell as CellType;
                }
            }
        })();
    }

    /**
     * Returns an array of the rows of the board.
     */
    get rows(): Cells<Row> {
        return Indices.map(r => this.values[r]) as Cells<Row>;
    }

    /**
     * Returns an array of the columns of the board.
     */
    get columns(): Cells<Column> {
        return Indices.map(c => Indices.map(r => this.values[r][c])) as Cells<Row>;
    }

    /**
     * Returns an array of the regions of the board.
     */
    get regions(): Cells<Region> {
        return RegionsIndicies.map(indicies =>
            indicies.map(([r, c]) =>
                this.values[r as number][c as number])) as Cells<Region>;
    }

    row(rowIdx: CellIndex): Row {
        return this.values[rowIdx];
    }

    column(colIdx: CellIndex): Column {
        return Indices.map(r => this.values[r][colIdx]) as Column;
    }

    region(regIdx: CellIndex): Region {
        return Array.from(genRegionIndices(regIdx)).map(([r, c]) => this.values[r][c]) as Region;
    }

    /**
     * Validates that there are no illegal cell values.  Marks any invalid cell as invalid.  Returns true if there are
     * no invalid cells, else false.
     */
    validate(): boolean {
        function hasAtLeast2(cells: CellGroup, val: CellValue): false | Cell[] {
            const valCells = cells.filter(c => c.value === val);
            if (valCells.length > 1) {
                return valCells;
            }

            return false;
        }

        function setDupsInvalid(cells: Cell[]): void {
            for (const cell of cells) {
                if (!cellIs.fixed(cell)) {
                    cell.isValid = false;
                }
            }
        }

        const rows = this.rows,
            cols = this.columns,
            regs = this.regions;

        let isValid = true;

        for (const val of AllCellValues) {
            for (const cellList of [rows, cols, regs]) {
                for (const cells of cellList) {
                    const dups = hasAtLeast2(cells, val);
                    if (dups) {
                        setDupsInvalid(dups);
                        isValid = false;
                    }
                }
            }
        }

        return isValid;
    }

    /**
     * Sets the value of the cell at the specified coordinates.  Returns whether the cell is valid.
     */
    setValue(coord: CellCoord, value: CellValue): boolean {
        assertValidCoordinates(coord);
        assertValidValue(value);

        const cell = this.cellAt(coord);
        cell.setValue(value);
        this.applyCellValueToNotes(cell as ValueCell);
        return cell.isValid;
    }

    /**
     * Unsets the value of the cell at the specified coordinates.
     */
    unsetValue(coord: CellCoord): void {
        assertValidCoordinates(coord);

        const cell = this.cellAt(coord);
        cell.unsetValue();

        // reset the notes based on this unset value
        this.initNotes();
    }

    /**
     * Returns a new board with the given values.
     */
    clone(): Board {
        for (const cell of this.cells) {
            if (!cell.isValid) {
                console.error(`Cloning board with invalid cells.`);
                break;
            }
        }

        return new Board(this.rows.map(row => row.map(cell => {
            if (cellIs.notes(cell)) {
                return new Cell(cell.coord, cell.notes);
            } else if (cellIs.fixed) {
                return new Cell(cell.coord, cell.value!);
            }

            return new Cell(cell.coord, cell.value!, false);
        })) as Cells);
    }

    /**
     * Prints the state of the board.
     *
     * @param notes If true, prints a larger version of the board, displaying the notes of each cell.
     */
    print(notes = false): string {
        if (!notes) {
            let rowLines = [];
            for (let row of this.rows) {
                let rStr = row.map(cell => cell.value || '.').join('');
                rowLines.push(`${rStr.substr(0, 3)}|${rStr.substr(3, 3)}|${rStr.substr(6)}`);
            }

            rowLines.splice(6, 0, '---+---+---');
            rowLines.splice(3, 0, '---+---+---');

            return rowLines.join('\n');
        }

        const cellNotes = this.rows.map(r => r.map(cell => cell.print().split('\n'))).flat();

        function noteRowStr(idx: CellIndex, cr: 0 | 1 | 2) {
            const [
                r1, r2, r3,
                r4, r5, r6,
                r7, r8, r9,
            ] = cellNotes.slice(idx * 9);
            return `${r1[cr]}  ${r2[cr]}  ${r3[cr]}  ┃  ${r4[cr]}  ${r5[cr]}  ${r6[cr]}  ┃  ${r7[cr]}  ${r8[cr]}  ${r9[cr]}` +
                (cr === 2 && idx % 3 !== 2 ? '\n               ┃                 ┃               ' : '');
        }

        function rowStr (r: CellIndex) {
            return [noteRowStr(r, 0), noteRowStr(r, 1), noteRowStr(r, 2)].join('\n');
        }

        const str = Indices.map(r => rowStr(r));
        str.splice(6, 0, '━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━');
        str.splice(3, 0, '━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━');

        return str.join('\n');
    }

    /**
     * Returns the cell at the given 0-indexed [row, column].
     *
     * @param row The row of the desired cell.
     * @param column The column of the desired cell.
     */
    cellAt(row: CellIndex, column: CellIndex): Cell;

    /**
     * Returns the cell at the given 0-indexed coordinates.
     *
     * @param coord The coordinates of the desired cell.
     */
    cellAt(coord: CellCoord): Cell;
    cellAt(rowOrCoord: CellIndex | CellCoord, col?: CellIndex): Cell {
        if (Array.isArray(rowOrCoord)) {
            [rowOrCoord, col] = rowOrCoord;
        }

        return this.values[rowOrCoord][col!];
    }

    /**
     * Initializes the notes of the board given the fixed cells.
     */
    private initNotes(): void {
        for (const cell of this.cells) {
            if (cellIs.fixed(cell)) {
                this.applyCellValueToNotes(cell);
            }
        }
    }

    /**
     * Applies a cell's value to the notes of the affected cells.
     *
     * @param cell The cell whose value is affecting other cells.
     */
    private applyCellValueToNotes(cell: ValueCell) {
        if (!cell.value) {
            throw new Error(`Cell at ${JSON.stringify(cell.coord)} does not contain a value.`);
        }

        const [row, col] = cell.coord,
            value = cell.value;

        for (const idx of Indices) {
            let upCell = this.values[idx][col];
            if (row !== idx && upCell.notes) {
                upCell.removeNote(value);
            }

            upCell = this.values[row][idx];
            if (col !== idx && upCell.notes) {
                upCell.removeNote(value);
            }
        }

        for (const [rowIdx, colIdx] of genRegionIndices(getRegion(row, col))) {
            const upCell = this.cellAt(rowIdx, colIdx);
            if (cellIs.notes(upCell)) {
                upCell.removeNote(value);
            }
        }
    }

    /**
     * Returns a new board with all empty cells.
     */
    static get Empty(): Board {
        const genRows = function*() {
            for (const row of Indices) {
                yield [
                    new Cell([row, 0] as CellCoord), new Cell([row, 1] as CellCoord), new Cell([row, 2] as CellCoord),
                    new Cell([row, 3] as CellCoord), new Cell([row, 4] as CellCoord), new Cell([row, 5] as CellCoord),
                    new Cell([row, 6] as CellCoord), new Cell([row, 7] as CellCoord), new Cell([row, 8] as CellCoord)
                ] as Row;
            }
        }

        return new Board(Array.from(genRows()) as Cells);
    }

    /**
     * Parses a string into a `Board`.
     *
     * @param data The board represented in string form, with `1`-`9` representing a valued cell and `.` representing a
     * blank cell.
     */
    static parse(data: string): Board {
        // trim lines and remove empty ones
        const lines = data.split(/\r?\n/g).map(line => line.trim()).filter(line => !!line);

        if (lines.length !== 9 || lines.some(line => !/^[1-9\.]{9}$/.test(line))) {
            throw new Error(`Invalid board data: ${data}`);
        }

        const rows = lines.map((line, row) =>
            Array.from(line).map((l, col) => {
                const coord: CellCoord = [row, col] as CellCoord;
                return l === '.' ? new Cell(coord) : new Cell(coord, parseInt(l) as CellValue)
            }));

        return new Board(rows as Cells<Row>);
    }
}

/**
 * Gets the region of the specified 0-indexed [row, column].
 *
 * @param row Board row of the region.
 * @param column Board column of the region.
 */
export function getRegion(row: CellIndex, column: CellIndex): CellIndex;

/**
 * Gets the region of the specified 0-indexed cell coordinates.
 *
 * @param coord Cell coordinates of the region.
 */
export function getRegion(coord: CellCoord): CellIndex;
export function getRegion(rowOrCoord: CellCoord | CellIndex, col?: CellIndex) {
    if (Array.isArray(rowOrCoord)) {
        [rowOrCoord, col] = rowOrCoord;
    }

    let regCol = parseInt(col! / 3),
        regRow = parseInt(rowOrCoord / 3);
    return regRow * 3 + regCol as CellIndex;
}

/**
 * Returns an iterable of `CellCoord` for the given region.
 */
export function* genRegionIndices(region: CellIndex): IterableIterator<CellCoord> {
    const rowStart = parseInt(region / 3) * 3,
        colStart = (region % 3) * 3;

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            yield [rowStart + r, colStart + c] as CellCoord;
        }
    }
}

const RegionsIndicies = Array.from(Indices.map(i => Array.from(genRegionIndices(i)))) as BoardRegionIndices;