import '../helpers/readonly-array';
import Cell from './cell';
import { CellIndex, CellValue, Indices } from './cell-values';

type RegionIndex = [CellIndex, CellIndex];
type RegionIndices = [
    RegionIndex, RegionIndex, RegionIndex,
    RegionIndex, RegionIndex, RegionIndex,
    RegionIndex, RegionIndex, RegionIndex
];
type BoardRegionIndices = [
    RegionIndices, RegionIndices, RegionIndices,
    RegionIndices, RegionIndices, RegionIndices,
    RegionIndices, RegionIndices, RegionIndices
];

export type Row = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];
export type Col = Row;
export type Region = Row;
export type Cells<T extends Row | Col | Region = Row> = [T, T, T, T, T, T, T, T, T];

export default class Board {
    constructor(values: Cells) {
        this.values = values;
        this.initNotes();
    }

    public readonly values: Cells;

    get rows(): Cells<Row> {
        return Indices.map(r => this.values[r as number]) as Cells<Row>;
    }

    get cols(): Cells<Col> {
        return Indices.map(c => this.values[c as number]) as Cells<Row>;        
    }

    get regions(): Cells<Region> {
        return RegionsIndicies.map(indicies => 
            indicies.map(([r, c]) => 
                this.values[r as number][c as number])) as Cells<Region>;
    }

    setValue(row: CellIndex, col: CellIndex, value: CellValue): boolean {
        if (row < 0 || row > 8 || col < 0 || col > 8 || value < 1 || value > 9) {
            throw new Error(`Invalid values [${row}, ${col}] = ${value}`);
        }

        let cell = this.values[row][col];

        if (!cell.canBe(value)) {
            cell.isValid = false;
        }

        cell.value = value;

        for (const idx of Indices) {
            let upCell = this.values[idx][col];
            if (row !== idx && !upCell.value) {
                upCell.notes!.delete(value);
            }

            upCell = this.values[row][idx];
            if (col !== idx && !upCell.value) {
                upCell.notes!.delete(value);
            }
        }

        for (const [rowIdx, colIdx] of genRegionIndices(getRegion(row, col))) {
            const upCell = this.values[rowIdx][colIdx];
            if ((row !== rowIdx || col !== colIdx) && !upCell.value) {
                upCell.notes!.delete(value);
            }
        }

        return cell.isValid;
    }

    clone(): Board {
        return new Board(this.rows);
    }

    print(): string {
        let rowLines = [];
        for (let row of this.rows) {
            let rStr = row.map(cell => cell.value || '.').join('');
            rowLines.push(`${rStr.substr(0, 3)}|${rStr.substr(3, 3)}|${rStr.substr(6)}`);
        }

        rowLines.splice(6, 0, '---+---+---');
        rowLines.splice(3, 0, '---+---+---');

        return rowLines.join('\n');
    }

    private initNotes(): void {
        for (let reg of RegionsIndicies) {
            for (let [row, col] of reg) {
                const cell = this.values[row][col];
                if (cell.value) {
                    // this will be a no-op on actually setting the value, but will handle all the note changes
                    this.setValue(row, col, cell.value);
                }
            }
        }
    }

    static get Empty(): Board {
        const genRows = function*() {
            for (let row = 0; row < 9; row++) {
                yield [ 
                    new Cell(), new Cell(), new Cell(), 
                    new Cell(), new Cell(), new Cell(), 
                    new Cell(), new Cell(), new Cell()
                ] as Row;
            }
        }
        
        return new Board(Array.from(genRows()) as Cells);
    }

    static parse(data: string): Board {
        // trim lines and remove empty ones
        const lines = data.split(/\r?\n/g).map(line => line.trim()).filter(line => !!line);

        if (lines.length !== 9 || lines.some(line => !/^[1-9\.]{9}$/.test(line))) {
            throw new Error(`Invalid board data: ${data}`);
        }

        const rows = lines.map(line => 
            Array.from(line).map(l => l === '.' ? new Cell() : new Cell(parseInt(l) as CellValue)));

        return new Board(rows as Cells<Row>);
    }
}

function getRegion(row: CellIndex, col: CellIndex) {
    let regCol = col % 3,
        regRow = parseInt(row / 3);

    return regRow * 3 + regCol as CellIndex;
}

function* genRegionIndices(region: CellIndex) {
    const rowStart = parseInt(region / 3),
        colStart = region % 3;

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            yield [rowStart + r, colStart + c] as RegionIndex;
        }
    }
}

function genRegionsIndices(): BoardRegionIndices {
    return Array.from(Indices.map(i => Array.from(genRegionIndices(i)))) as BoardRegionIndices;
}

const RegionsIndicies: BoardRegionIndices = genRegionsIndices();