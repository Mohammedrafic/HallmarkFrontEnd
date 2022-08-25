import { formatCurrency, formatNumber, formatDate } from '@angular/common';

/**
 * TODO: Move to core helpers
 */
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

  public static formatAbsCurrency(value: number): string {
    if (isNaN(value)) {
      return '';
    }
    const formated = value < 0 ? `(${GridValuesHelper.formatCurrency(value.toString())})`
    : GridValuesHelper.formatCurrency(value.toString());

    return formated;
  }
}
