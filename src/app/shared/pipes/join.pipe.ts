import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'join',
})
export class JoinPipe implements PipeTransform {
  transform(input: string[] | number[], character = ''): string {
    if (!Array.isArray(input)) {
      return input;
    }

    return input.join(character);
  }
}

@NgModule({
  declarations: [JoinPipe],
  exports: [JoinPipe],
})
export class JoinPipeModule {}
