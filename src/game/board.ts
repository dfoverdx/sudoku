import '../helpers/array-extensions';
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
            if (row !== idx && upCell.notes) {
                upCell.removeNote(value);
            }

            upCell = this.values[row][idx];
            if (col !== idx && upCell.notes) {
                upCell.removeNote(value);
            }
        }

        for (const [rowIdx, colIdx] of genRegionIndices(getRegion(row, col))) {
            const upCell = this.values[rowIdx][colIdx];
            if ((row !== rowIdx || col !== colIdx) && upCell.notes) {
                upCell.removeNote(value);
            }
        }

        return cell.isValid;
    }

    clone(): Board {
        return new Board(this.rows);
    }

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

        const cellNotes = this.rows.map(r => r.map(cell => cell.print().split('\n'))).flat(),

            noteRowStr = (idx: CellIndex, cr: 0 | 1 | 2) => {
                const [
                    r1, r2, r3,
                    r4, r5, r6,
                    r7, r8, r9,
                ] = cellNotes.slice(idx * 9);
                return `${r1[cr]}  ${r2[cr]}  ${r3[cr]}  ┃  ${r4[cr]}  ${r5[cr]}  ${r6[cr]}  ┃  ${r7[cr]}  ${r8[cr]}  ${r9[cr]}` +
                    (cr === 2 && idx % 3 !== 2 ? '\n               ┃                 ┃               ' : '');
            },

            rowStr = (r: CellIndex) => `${noteRowStr(r, 0)}
${noteRowStr(r, 1)}
${noteRowStr(r, 2)}`;

        const str = Indices.map(r => rowStr(r));
        str.splice(6, 0, '━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━');
        str.splice(3, 0, '━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━');

        return str.join('\n').trimEnd();
    }

    private initNotes(): void {
        Cell.parsing = true;

        for (let reg of RegionsIndicies) {
            for (let [row, col] of reg) {
                const cell = this.values[row][col];
                if (cell.value) {
                    // this will be a no-op on actually setting the value, but will handle all the note changes
                    this.setValue(row, col, cell.value);
                }
            }
        }

        Cell.parsing = false;
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

export function getRegion(row: CellIndex, col: CellIndex) {
    let regCol = parseInt(col / 3),
        regRow = parseInt(row / 3);
    return regRow * 3 + regCol as CellIndex;
}

export function* genRegionIndices(region: CellIndex) {
    const rowStart = parseInt(region / 3),
        colStart = (region % 3) * 3;

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