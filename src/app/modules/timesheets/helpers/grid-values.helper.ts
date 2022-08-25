import { DecimalPipe, formatCurrency, formatNumber, formatDate } from '@angular/common';

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

  public static formatNumber(value: string | number, format?: string): string {
    if (!Number(value)) {
      return '';
    }

    return formatNumber(+value, 'en', format)?.toString()?.replace(',', '') || '';
  }
}
