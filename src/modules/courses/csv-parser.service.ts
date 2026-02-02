import { Injectable } from '@nestjs/common';
import csv from 'csv-parser';
import { Readable } from 'stream';

interface HyroxCsvRow {
  'Last name'?: string;
  'First Name'?: string;
  Gender?: string;
  'Age Group'?: string;
  Nationality?: string;
  Race?: string;
  Division?: string;
  'Total Time'?: string;
  'Run 1'?: string;
  'Sled Push'?: string;
  'Run 2'?: string;
  'Sled Pull'?: string;
  'Run 3'?: string;
  'Burpee Broad Jump'?: string;
  'Run 4'?: string;
  Row?: string;
  'Run 5'?: string;
  'Farmer Carry'?: string;
  'Run 6'?: string;
  'Sandbag Lunges'?: string;
  'Run 7'?: string;
  'Wall Balls'?: string;
  'Run 8'?: string;
  [key: string]: string | undefined;
}

@Injectable()
export class CsvParserService {
  /**
   * Parse un fichier CSV de results.hyrox.com et retourne les données formatées
   */
  async parseHyroxCsv(csvBuffer: Buffer): Promise<
    Array<{
      name: string;
      city: string;
      date: string;
      category: string;
      totalTime: number;
      times?: Array<{ segment: string; timeSeconds: number }>;
      source?: string;
      notes?: string;
    }>
  > {
    return new Promise((resolve, reject) => {
      const results: Array<{
        name: string;
        city: string;
        date: string;
        category: string;
        totalTime: number;
        times?: Array<{ segment: string; timeSeconds: number }>;
        source?: string;
        notes?: string;
      }> = [];
      const stream = Readable.from(csvBuffer.toString());

      stream
        .pipe(csv())
        .on('data', (row: HyroxCsvRow) => {
          const course = this.parseHyroxRow(row);
          if (course) {
            results.push(course);
          }
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error: Error) => {
          reject(error);
        });
    });
  }

  /**
   * Parse une ligne CSV de results.hyrox.com
   */
  private parseHyroxRow(row: HyroxCsvRow): {
    name: string;
    city: string;
    date: string;
    category: string;
    totalTime: number;
    times: Array<{ segment: string; timeSeconds: number }>;
    source: string;
    notes: string;
  } | null {
    if (!row['Total Time'] || !row['Race']) {
      return null;
    }

    const totalTime = this.parseTimeToSeconds(row['Total Time']);
    if (!totalTime) {
      return null;
    }

    const raceName = row['Race'] || '';
    const city = this.extractCityFromRaceName(raceName);
    const category = row['Division'] || row['Gender'] || 'All';

    const times = this.parseSegmentTimes(row);

    return {
      name: raceName,
      city,
      date: this.extractDateFromRaceName(raceName) || new Date().toISOString().split('T')[0],
      category,
      totalTime,
      times,
      source: 'results.hyrox.com',
      notes: this.formatNotes(row),
    };
  }

  /**
   * Parse le temps total (format: "HH:MM:SS" ou "MM:SS")
   */
  private parseTimeToSeconds(timeString: string): number | null {
    if (!timeString) return null;

    const parts = timeString.split(':').map(Number);
    if (parts.length === 3) {
      // Format HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // Format MM:SS
      return parts[0] * 60 + parts[1];
    }
    return null;
  }

  private parseSegmentTimes(row: HyroxCsvRow): Array<{ segment: string; timeSeconds: number }> {
    const segments: Array<{ key: keyof HyroxCsvRow; segment: string }> = [
      { key: 'Run 1', segment: 'run1' },
      { key: 'Sled Push', segment: 'sledPush' },
      { key: 'Run 2', segment: 'run2' },
      { key: 'Sled Pull', segment: 'sledPull' },
      { key: 'Run 3', segment: 'run3' },
      { key: 'Burpee Broad Jump', segment: 'burpeeBroadJump' },
      { key: 'Run 4', segment: 'run4' },
      { key: 'Row', segment: 'row' },
      { key: 'Run 5', segment: 'run5' },
      { key: 'Farmer Carry', segment: 'farmerCarry' },
      { key: 'Run 6', segment: 'run6' },
      { key: 'Sandbag Lunges', segment: 'sandbagLunges' },
      { key: 'Run 7', segment: 'run7' },
      { key: 'Wall Balls', segment: 'wallBalls' },
      { key: 'Run 8', segment: 'run8' },
    ];

    const times: Array<{ segment: string; timeSeconds: number }> = [];

    for (const { key, segment } of segments) {
      const timeValue = row[key];
      if (timeValue) {
        const seconds = this.parseTimeToSeconds(timeValue);
        if (seconds !== null) {
          times.push({ segment, timeSeconds: seconds });
        }
      }
    }

    return times;
  }

  /**
   * Extrait la ville du nom de la course
   */
  private extractCityFromRaceName(raceName: string): string {
    // Exemples: "HYROX Paris 2024" -> "Paris"
    const match = raceName.match(/HYROX\s+(\w+)/i) || raceName.match(/(\w+)\s+\d{4}/i);
    return match ? match[1] : raceName.split(' ')[0] || 'Unknown';
  }

  /**
   * Extrait la date du nom de la course (si disponible)
   */
  private extractDateFromRaceName(raceName: string): string | null {
    // Exemples: "HYROX Paris 2024" -> "2024-01-01" (date par défaut)
    const yearMatch = raceName.match(/\d{4}/);
    if (yearMatch) {
      return `${yearMatch[0]}-01-01`;
    }
    return null;
  }

  /**
   * Formate les notes avec les informations de l'athlète
   */
  private formatNotes(row: HyroxCsvRow): string {
    const notes: string[] = [];
    if (row['Last name'] && row['First Name']) {
      notes.push(`Athlète: ${row['First Name']} ${row['Last name']}`);
    }
    if (row['Age Group']) {
      notes.push(`Groupe d'âge: ${row['Age Group']}`);
    }
    if (row['Nationality']) {
      notes.push(`Nationalité: ${row['Nationality']}`);
    }
    return notes.join(' | ');
  }
}
