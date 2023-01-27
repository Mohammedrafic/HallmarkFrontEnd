import { Directive } from '@angular/core';
import { formatDate } from '@angular/common';

@Directive()
export class GridHelper {
  formatEmptyValue(value: string): string {
    return !value ? '' : value;
  }

  formatDate(value: string, pattern: string): string {
    if (!value) {
      return '';
    }
    return formatDate(value, pattern, 'en-US', 'UTC');
  }
}
