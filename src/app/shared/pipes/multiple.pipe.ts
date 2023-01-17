import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'multiple',
})
export class MultiplePipe implements PipeTransform {
  public transform(value: string[]): string {
    if (!Array.isArray(value)) {
      return value;
    }

    switch (value.length) {
      case 0:
        return '';
      case 1:
        return value[0];
      default:
        return 'Multiple';
    }
  }
}

@NgModule({
  declarations: [MultiplePipe],
  exports: [MultiplePipe],
})
export class MultiplePipeModule {}
