import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable()
export class ToggleRowExpansionHeaderCellService {
  public handleDetailsEvent: Subject<{Details : boolean}> = new Subject<{Details : boolean}>();
  constructor() {
  }

  public HandleStatusChangeClick(Details: boolean): void {
      this.handleDetailsEvent.next({Details : Details});
  }
 
}
