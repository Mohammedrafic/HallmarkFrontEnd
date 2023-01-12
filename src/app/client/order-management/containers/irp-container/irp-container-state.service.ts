import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { ListOfKeyForms} from '@client/order-management/interfaces';
import { CreateOrderDto } from '@shared/models/order-management.model';
import { IrpOrderJobDistribution } from '@shared/enums/job-distibution';

@Injectable()
export class IrpContainerStateService {
  public saveEvents: Subject<void> = new Subject<void>();

  private formState: ListOfKeyForms;
  private documents: Blob[];
  private deleteDocumentsGuids: string[] = [];

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
}
