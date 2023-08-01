import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Select, ofActionSuccessful } from '@ngxs/store';
import { ReasonsComponent } from '@organization-management/reasons/models';
import { GetSourcingReasonsByPage, GetTerminationReasons, RemoveSourcingReasons, RemoveTerminationReasons, SaveSourcingReasonsError, SaveTerminatedReasonError, UpdateSourcingReasonsSuccess, UpdateTerminationReasonsSuccess } from '@organization-management/store/reject-reason.actions';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { RejectReasonPage, SourcingReasonPage } from '@shared/models/reject-reason.model';
import { Observable, takeWhile } from 'rxjs';

@Component({
  selector: 'app-sourcing-reason',
  templateUrl: './sourcing-reason.component.html',
  styleUrls: ['./sourcing-reason.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SourcingReasonComponent extends ReasonsComponent implements OnInit,OnDestroy {


  @Select(RejectReasonState.sourcingReasonspage)
  public reasons$: Observable<SourcingReasonPage>;

  protected getData(): void {
    this.store.dispatch(new GetSourcingReasonsByPage(this.currentPage, this.pageSize));
  }

  protected remove(id: number): void {
    this.store.dispatch(new RemoveSourcingReasons(id));
  }

  protected subscribeOnSaveReasonError(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveSourcingReasonsError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.setReasonControlError());
  }

  protected subscribeOnUpdateReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(UpdateSourcingReasonsSuccess),
      takeWhile(() => this.isAlive),
    ).subscribe(() => this.getData());
  }
}

