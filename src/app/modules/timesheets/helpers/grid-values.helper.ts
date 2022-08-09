import { formatCurrency, formatDate } from '@angular/common';

export class GridValuesHelper {
  public static formatDate(value: string, pattern: string): string {
    if (!value) {
      return '';
    }
    return formatDate(value, pattern, 'en-US');
  }

  public static formatCurrency(value: string): string {
    if (!value) {
      return '';
    }
    return formatCurrency(Number(value), 'en', '$');
  }
}
