import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { ListOfKeyForms } from '@client/order-management/interfaces';

@Injectable()
export class IrpContainerStateService {
  public saveEvents: Subject<void> = new Subject<void>();

  private formState: ListOfKeyForms;
  private documents: Blob[];

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
}
