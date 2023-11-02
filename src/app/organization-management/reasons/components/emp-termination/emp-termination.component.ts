import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ofActionSuccessful, Select } from "@ngxs/store";
import { Observable, takeWhile } from "rxjs";
import {
  GetInactivationReasons,
  RemoveInactivationReasons,
  SaveInactivatedReasonError,
  UpdateInactivationReasonsSuccess,
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


  @Select(RejectReasonState.inactivationReasons)
  public reasons$: Observable<RejectReasonPage>;

  protected getData(): void {
    this.store.dispatch(new GetInactivationReasons(this.currentPage, this.pageSize));
  }

  protected remove(id: number): void {
    this.store.dispatch(new RemoveInactivationReasons(id));
  }

  protected subscribeOnSaveReasonError(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveInactivatedReasonError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.setReasonControlError());
  }

  protected subscribeOnUpdateReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(UpdateInactivationReasonsSuccess),
      takeWhile(() => this.isAlive),
    ).subscribe(() => this.getData());
  }
}
