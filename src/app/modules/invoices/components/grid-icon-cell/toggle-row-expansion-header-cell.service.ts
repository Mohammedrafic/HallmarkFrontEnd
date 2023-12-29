import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable()
export class ToggleRowExpansionHeaderCellService {
  public handleDetailsEvent: Subject<{showdetails : any}> = new Subject<{showdetails : any}>();
  constructor() {
  }

  public HandleStatusChangeClick(showdetails: any): void {
      this.handleDetailsEvent.next(showdetails);
  }
 
}
