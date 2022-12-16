import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'irpSystemGridText',
})
export class IrpSystemGridTextPipe implements PipeTransform {
  transform(isIrp: boolean, isVMS: boolean): string {
    const irpText = isIrp ? 'IRP' : '';
    const vmsText = isVMS ? 'VMS' : '';

    if (irpText && vmsText) {
      return `${irpText}, ${vmsText}`;
    }

    return irpText || vmsText;
  }
}
