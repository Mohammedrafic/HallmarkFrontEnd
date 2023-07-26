import { Component, OnDestroy, OnInit } from '@angular/core';

import { ofActionSuccessful, Select } from '@ngxs/store';
import { Observable, takeWhile } from 'rxjs';

import { ReasonsComponent } from '@organization-management/reasons/models/reasons-component.class';
import {
  GetManualInvoiceRejectReasonsByPage,
  RemoveManualInvoiceRejectReason,
  SaveManualInvoiceRejectReasonError,
  UpdateManualInvoiceRejectReasonSuccess,
} from '@organization-management/store/reject-reason.actions';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { RejectReasonPage } from '@shared/models/reject-reason.model';

@Component({
  selector: 'app-manual-invoice-reject-reason',
  styleUrls: ['./manual-invoice-reject-reason.component.scss'],
  templateUrl: './manual-invoice-reject-reason.component.html',
})
export class ManualInvoiceRejectReasonComponent extends ReasonsComponent implements OnInit, OnDestroy {
  @Select(RejectReasonState.manualInvoiceReasonsPage)
  public reasons$: Observable<RejectReasonPage>;
  protected remove(id: number) {
    this.store.dispatch(new RemoveManualInvoiceRejectReason(id));
  }

  protected getData() {
    this.store.dispatch(new GetManualInvoiceRejectReasonsByPage(this.currentPage, this.pageSize));
  }

  protected subscribeOnSaveReasonError(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveManualInvoiceRejectReasonError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.setReasonControlError());
  }

  protected subscribeOnUpdateReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(UpdateManualInvoiceRejectReasonSuccess),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.getData());
  }
}
