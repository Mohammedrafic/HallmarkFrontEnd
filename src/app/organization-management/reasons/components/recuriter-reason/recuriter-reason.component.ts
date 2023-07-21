import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Select, ofActionSuccessful } from '@ngxs/store';
import { ReasonsComponent } from '@organization-management/reasons/models';
import { GetRecuriterReasonsByPage, GetSourcingReasons, GetSourcingReasonsByPage, GetTerminationReasons, RemoveRecuriterReasons, RemoveSourcingReasons, RemoveTerminationReasons, SaveRecuriterReasons, SaveRecuriterReasonsError, SaveSourcingReasonsError, SaveTerminatedReasonError, UpdateRecuriterReasonsSuccess, UpdateSourcingReasonsSuccess, UpdateTerminationReasonsSuccess } from '@organization-management/store/reject-reason.actions';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { RecuriterReasonPage, RejectReasonPage } from '@shared/models/reject-reason.model';
import { Observable, takeWhile } from 'rxjs';

@Component({
  selector: 'app-recuriter-reason',
  templateUrl: './recuriter-reason.component.html',
  styleUrls: ['./recuriter-reason.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecuriterReasonComponent extends ReasonsComponent implements OnInit,OnDestroy {



  @Select(RejectReasonState.recuriterReasons)
  public reasons$: Observable<RecuriterReasonPage>;

  protected getData(): void {
    this.store.dispatch(new GetRecuriterReasonsByPage(this.currentPage, this.pageSize));
  }

  protected remove(id: number): void {
    this.store.dispatch(new RemoveRecuriterReasons(id));
  }

  protected subscribeOnSaveReasonError(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveRecuriterReasonsError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.setReasonControlError());
  }

  protected subscribeOnUpdateReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(UpdateRecuriterReasonsSuccess),
      takeWhile(() => this.isAlive),
    ).subscribe(() => this.getData());
  }
}

