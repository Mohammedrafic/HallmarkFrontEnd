import { Component, OnDestroy, OnInit } from '@angular/core';
import { ofActionSuccessful, Select } from "@ngxs/store";
import { Observable, takeWhile } from "rxjs";
import {
  GetClosureReasonsByPage,
  RemoveClosureReasons,
  SaveClosureReasonsError,
  UpdateClosureReasonsSuccess,
} from "@organization-management/store/reject-reason.actions";
import { RejectReasonState } from "@organization-management/store/reject-reason.state";
import { RejectReasonPage } from "@shared/models/reject-reason.model";
import { ReasonsComponent } from '@organization-management/reasons/models/reasons-component.class';

@Component({
  selector: 'app-closure-reason',
  templateUrl: './closure-reason.component.html',
  styleUrls: ['./closure-reason.component.scss']
})
export class ClosureReasonComponent extends ReasonsComponent implements OnInit,OnDestroy {
  @Select(RejectReasonState.closureReasonsPage)
  public reasons$: Observable<RejectReasonPage>;

  protected getData(): void {
    this.store.dispatch(new GetClosureReasonsByPage(this.currentPage, this.pageSize, this.orderBy))
  }

  protected remove(id: number): void {
    this.store.dispatch(new RemoveClosureReasons(id));
  }

  protected subscribeOnSaveReasonError(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveClosureReasonsError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.setReasonControlError());
  }

  protected subscribeOnUpdateReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(UpdateClosureReasonsSuccess),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.getData());
  }
}
