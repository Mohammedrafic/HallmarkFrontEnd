import isEqual from 'lodash/fp/isEqual';
import pick from 'lodash/fp/pick';

import { map, Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import {
  CreateOrderDto,
  Order,
  OrderContactDetails,
  OrderManagement,
  OrderManagementPage,
  OrderWorkLocation,
} from '@shared/models/order-management.model';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { shareReplay } from 'rxjs/operators';
import { JobDistributionModel } from '@shared/models/job-distribution.model';

@Injectable({
  providedIn: 'root',
})
export class SaveTemplateDialogService {
  constructor(private orderService: OrderManagementContentService) {}

  /** Filter out templates witch match with selected region, location, department and skill */
  getFilteredTemplates(order: Order,isIRP? : boolean|null): Observable<OrderManagement[]> {
    const propsToPick = ['regionId', 'locationId', 'departmentId', 'skillId'];
    if (isIRP) {
      return this.orderService.getIRPTemplates({ isTemplate: true }).pipe(
        map((orderManagementPage: OrderManagementPage) =>
          orderManagementPage?.items.filter((template: OrderManagement) =>
            isEqual(pick(propsToPick, order), pick(propsToPick, template))
          )
        ),
        shareReplay()
      );
    } else {
      return this.orderService.getOrders({ isTemplate: true }).pipe(
        map((orderManagementPage: OrderManagementPage) =>
          orderManagementPage?.items.filter((template: OrderManagement) =>
            isEqual(pick(propsToPick, order), pick(propsToPick, template))
          )
        ),
        shareReplay()
      );
    }
  }

  /* When created order need to save as template ids for some properties have to be 0 */
  resetOrderPropertyIds(order: CreateOrderDto): CreateOrderDto {
    const { credentials, contactDetails, jobDistributions, workLocations } = order;
    const newCredentials = credentials.map((credential) => ({ ...credential, id: 0, orderId: 0 }));
    const newContactDetails = contactDetails.map((contact: OrderContactDetails) => ({ ...contact, id: 0 }));
    const newJobDistributions = jobDistributions.map((job: JobDistributionModel) => ({ ...job, id: 0 }));
    const newWorkLocations = workLocations.map((workLocation: OrderWorkLocation) => ({ ...workLocation, id: 0 }));

    return {
      ...order,
      credentials: newCredentials,
      contactDetails: newContactDetails,
      jobDistributions: newJobDistributions,
      workLocations: newWorkLocations,
    };
  }
}
