import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import { ListOfKeyForms} from '@client/order-management/interfaces';
import { CreateOrderDto } from '@shared/models/order-management.model';
import { IrpOrderJobDistribution } from '@shared/enums/job-distibution';
import { HaveScheduleBooking } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';

@Injectable()
export class IrpContainerStateService {
  public saveEvents: Subject<void> = new Subject<void>();

  private formState: ListOfKeyForms;
  private documents: Blob[];
  private deleteDocumentsGuids: string[] = [];

  constructor(private confirmService: ConfirmService) {
  }

  public setFormState(state: ListOfKeyForms): void {
    this.formState = state;
  }

  public setDocuments(documents: Blob[]): void {
    this.documents = documents;
  }

  public getFormState(): ListOfKeyForms {
    return this.formState;
  }

  public getDocuments(): Blob[] {
    return this.documents;
  }

  public deleteDocuments(documents: string[]) {
    this.deleteDocumentsGuids = documents;
  }

  public getDeletedDocuments(): string[] {
    return this.deleteDocumentsGuids;
  }

  public getIncludedExternalLogic(order: CreateOrderDto): boolean {
    return order.jobDistribution?.some((distribution: number) => [
      IrpOrderJobDistribution.AllExternal,
      IrpOrderJobDistribution.SelectedExternal,
      IrpOrderJobDistribution.TieringLogicExternal,
    ].includes(distribution)) as boolean;
  }

  public showScheduleBookingModal(): Observable<boolean> {
    return this.confirmService
      .confirm(HaveScheduleBooking, {
        title: 'Scheduled LTA Bookings',
        cancelButtonLabel: 'Update',
        okButtonClass: 'delete-button',
        okButtonLabel: 'Remove',
      });
  }
}
