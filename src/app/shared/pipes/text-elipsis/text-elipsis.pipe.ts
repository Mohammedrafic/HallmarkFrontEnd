import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textElipsis',
})
export class TextElipsisPipe implements PipeTransform {
  transform(text: string, maxLength = 10): string {
    if (!text) {
      return '';
    }

    const textLength = text.length;

    if (textLength > maxLength) {
      return `${text.slice(0, maxLength - 3)}...`;
    }

    return text;
  }
}
