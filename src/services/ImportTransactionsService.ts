import csvParse from 'csv-parse';
import fs from 'fs';

interface Data {
  title: string;
  type: string;
  value: number;
  category: string;
}

class ImportTransactionsService {
  private lines: string[];

  constructor() {
    this.lines = [];
  }

  public async loadCSV(filePath: string): Promise<Data[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    parseCSV.on('data', line => {
      this.lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const objectsLines = this.lines.map(line => ({
      title: line[0],
      type: line[1],
      value: parseInt(line[2], 10),
      category: line[3],
    }));

    return objectsLines;
  }
}

export default ImportTransactionsService;
