import { formatCurrency, formatDate } from '@angular/common';
import { Directive } from '@angular/core';

@Directive()
export class GridValuesHelper {
  formatDate(value: string, pattern: string): string {
    if (!value) {
      return '';
    }
    return formatDate(value, pattern, 'en-US');
  }

  formatCurrency(value: string): string {
    if (!value) {
      return '';
    }
    return formatCurrency(Number(value), 'en', '$');
  }
}
