import { Injectable } from '@angular/core';
import { OrderType } from '@shared/enums/order-type';
import { Order } from '@shared/models/order-management.model';

import { Observable, Subject } from 'rxjs';


@Injectable()
export class OrderGridSystemStateService {
  public systemClickEvents: Subject<{system:string,order:Order}> = new Subject<{system:string,order:Order}>();
  constructor() {
  }

  public HandleClickEvent(system:string,order:Order): void {
    this.systemClickEvents.next({system,order});
  }
 
 
}
