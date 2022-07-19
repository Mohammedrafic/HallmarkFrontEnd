import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';

@Injectable({
  providedIn: 'root',
})
export class OrderManagementService {
  public selectTab$: Subject<OrganizationOrderManagementTabs> = new Subject<OrganizationOrderManagementTabs>();

  constructor() {}
}
