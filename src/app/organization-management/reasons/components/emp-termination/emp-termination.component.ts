import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ofActionSuccessful, Select } from "@ngxs/store";
import { Observable, takeWhile } from "rxjs";
import {
  GetInternalTransferReasons, GetTerminationReasons, RemoveInternalTransferReasons, RemoveTerminationReasons, SaveTerminatedReasonError, UpdateInternalTransferReasonsSuccess, UpdateTerminationReasonsSuccess,
} from "@organization-management/store/reject-reason.actions";
import { RejectReasonState } from "@organization-management/store/reject-reason.state";
import { RejectReasonPage } from "@shared/models/reject-reason.model";
import { ReasonsComponent } from '@organization-management/reasons/models/reasons-component.class';

@Component({
  selector: 'app-emp-termination',
  templateUrl: './emp-termination.component.html',
  styleUrls: ['./emp-termination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmpTerminationComponent extends ReasonsComponent implements OnInit,OnDestroy {


  @Select(RejectReasonState.terminationReasons)
  public reasons$: Observable<RejectReasonPage>;

  protected getData(): void {
    this.store.dispatch(new GetTerminationReasons(this.currentPage, this.pageSize));
  }

  protected remove(id: number): void {
    this.store.dispatch(new RemoveTerminationReasons(id));
  }

  protected subscribeOnSaveReasonError(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveTerminatedReasonError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.setReasonControlError());
  }

  protected subscribeOnUpdateReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(UpdateTerminationReasonsSuccess),
      takeWhile(() => this.isAlive),
    ).subscribe(() => this.getData());
  }
}
