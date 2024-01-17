import { formatCurrency, formatNumber, formatDate } from '@angular/common';

export class GridValuesHelper {
  public static formatDate(value: string, pattern: string): string {
    if (!value) {
      return '';
    }
    return formatDate(value, pattern, 'en-US', 'utc');
  }

  public static formatCurrencyValue(value: string): string {
    if (!value) {
      return '';
    }
    return formatCurrency(Number(value), 'en', '$');
  }

  public static formatNumber(value: string | number, format?: string): string {
    if (isNaN(Number(value))) {
      return '';
    }

    return formatNumber(+value, 'en', format)?.toString()?.replace(',', '') || '';
  }

  public static formatAbsCurrency(value: number): string {
    if (isNaN(value)) {
      return '';
    }
    const formated = value < 0 ? `(${GridValuesHelper.formatCurrencyValue(Math.abs(value).toString())})`
    : GridValuesHelper.formatCurrencyValue(value.toString());

    return formated;
  }

  public static formatAbsNumber(value: number, format: string): string {
    if (!Number(value)) {
      return '0.00';
    }

    if (value < 0) {
      return `(${formatNumber(Math.abs(value), 'en', format) || ''})`;
    }

    return formatNumber(value, 'en', format) || '';
  }

  public static formatPercentage(value: number): string {
    if (!Number(value)) {
      return '0.00';
    }

    return `%${formatNumber(value, 'en', '1.2-2')}` || '';
  }
}
