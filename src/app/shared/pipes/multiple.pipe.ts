import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'multiple',
})
export class MultiplePipe implements PipeTransform {
  public transform(value: string[], numberTitle?: string): string {
    if (!Array.isArray(value)) {
      return value;
    }

    switch (value.length) {
      case 0:
        return '';
      case 1:
        return value[0];
      default:
        return numberTitle ? `${value.length} ${numberTitle}` : 'Multiple';
    }
  }
}

@NgModule({
  declarations: [MultiplePipe],
  exports: [MultiplePipe],
})
export class MultiplePipeModule {}
