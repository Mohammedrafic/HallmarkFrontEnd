import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatBytes',
})
export class FormatBytesPipe implements PipeTransform {

  transform(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const coefficient = 1024;
    let result = bytes;
    let unit = units[0];

    if (isNaN(result)) {
      return `0 ${unit}`;
    }

    for (const u of units) {
      if (result <= coefficient) {
        unit = u;
        break;
      } else {
        result = result / coefficient;
      }
    }

    return `${result.toFixed(2) + unit}`;
  }
}
