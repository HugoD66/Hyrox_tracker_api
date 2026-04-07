import { CsvParserService } from './csv-parser.service';

describe('CsvParserService', () => {
  let service: CsvParserService;

  beforeEach(() => {
    service = new CsvParserService();
  });

  const toBuffer = (csvContent: string) => Buffer.from(csvContent, 'utf-8');

  it('should parse a valid Hyrox CSV row with total time and segments', async () => {
    const csv = [
      'Race,Division,Gender,Total Time,Run 1,Sled Push,Row,First Name,Last name,Age Group,Nationality',
      'HYROX Paris 2024,Open,Male,01:10:05,04:00,05:00,06:30,Hugo,Martin,30-34,FR',
    ].join('\n');

    const result = await service.parseHyroxCsv(toBuffer(csv));

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'HYROX Paris 2024',
      city: 'Paris',
      date: '2024-01-01',
      category: 'Open',
      totalTime: 4205,
      source: 'results.hyrox.com',
    });
    expect(result[0].times).toEqual([
      { segment: 'run1', timeSeconds: 240 },
      { segment: 'sledPush', timeSeconds: 300 },
      { segment: 'row', timeSeconds: 390 },
    ]);
    expect(result[0].notes).toContain('Athlète: Hugo Martin');
    expect(result[0].notes).toContain("Groupe d'âge: 30-34");
    expect(result[0].notes).toContain('Nationalité: FR');
  });

  it('should fallback to gender when division is missing', async () => {
    const csv = [
      'Race,Gender,Total Time',
      'HYROX Berlin 2025,Female,59:30',
    ].join('\n');

    const result = await service.parseHyroxCsv(toBuffer(csv));

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('Female');
    expect(result[0].totalTime).toBe(3570);
  });

  it('should ignore rows missing Race or Total Time', async () => {
    const csv = [
      'Race,Division,Total Time',
      ',Open,01:02:03',
      'HYROX Nice 2025,Open,',
    ].join('\n');

    const result = await service.parseHyroxCsv(toBuffer(csv));

    expect(result).toEqual([]);
  });

  it('should ignore rows with invalid total time format', async () => {
    const csv = [
      'Race,Division,Total Time',
      'HYROX Lyon 2025,Open,abc',
    ].join('\n');

    const result = await service.parseHyroxCsv(toBuffer(csv));

    expect(result).toEqual([]);
  });

  it('should keep only valid segment times and ignore invalid segment values', async () => {
    const csv = [
      'Race,Division,Total Time,Run 1,Sled Push,Run 2',
      'HYROX Madrid 2025,Open,01:00:00,04:30,invalid,03:15',
    ].join('\n');

    const result = await service.parseHyroxCsv(toBuffer(csv));

    expect(result).toHaveLength(1);
    expect(result[0].times).toEqual([
      { segment: 'run1', timeSeconds: 270 },
      { segment: 'run2', timeSeconds: 195 },
    ]);
  });

  it('should default to current date format when race name has no year', async () => {
    const csv = [
      'Race,Division,Total Time',
      'HYROX Unknown City,Open,00:45:10',
    ].join('\n');

    const result = await service.parseHyroxCsv(toBuffer(csv));

    expect(result).toHaveLength(1);
    expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

