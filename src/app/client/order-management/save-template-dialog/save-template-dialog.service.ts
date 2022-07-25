import isEqual from 'lodash/fp/isEqual';
import pick from 'lodash/fp/pick';

import { map, Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { Order, OrderManagement, OrderManagementPage } from '@shared/models/order-management.model';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';

@Injectable({
  providedIn: 'root',
})
export class SaveTemplateDialogService {
  constructor(private orderService: OrderManagementContentService) {}

  /** Filter out templates witch match with selected region, location, department and skill */
  getFilteredTemplates(order: Order): Observable<OrderManagement[]> {
    const propsToPick = ['regionId', 'locationId', 'departmentId', 'skillId'];
    return this.orderService
      .getOrders({ isTemplate: true })
      .pipe(
        map((orderManagementPage: OrderManagementPage) =>
          orderManagementPage?.items.filter((template: OrderManagement) =>
            isEqual(pick(propsToPick, order), pick(propsToPick, template))
          )
        )
      );
  }
}
