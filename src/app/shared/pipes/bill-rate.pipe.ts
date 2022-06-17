import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'billRate'
})

export class BillRatePipe implements PipeTransform{
  transform(rate: number, candidateRate: number): any {
    return candidateRate ?
      `$${Number(rate).toFixed(2)} - ${Number(candidateRate).toFixed(2)}` :
      `$${Number(rate).toFixed(2)} - ${Number(rate).toFixed(2)}`;
  }
}
