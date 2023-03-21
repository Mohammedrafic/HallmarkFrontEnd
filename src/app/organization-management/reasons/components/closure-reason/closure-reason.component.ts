import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable, takeWhile } from 'rxjs';

import { UserPermissions } from '@core/enums';
import { OrginazationModuleSettings, Permission } from '@core/interface';
import { ReasonsComponent } from '@organization-management/reasons/models/reasons-component.class';
import {
  GetClosureReasonsByPage,
  RemoveClosureReasons,
  SaveClosureReasonsError,
  UpdateClosureReasonsSuccess,
} from '@organization-management/store/reject-reason.actions';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { RejectReasonPage } from '@shared/models/reject-reason.model';

@Component({
  selector: 'app-closure-reason',
  templateUrl: './closure-reason.component.html',
  styleUrls: ['./closure-reason.component.scss'],
})
export class ClosureReasonComponent extends ReasonsComponent implements OnInit,OnDestroy {
  @Input() userPermission: Permission;

  @Select(RejectReasonState.closureReasonsPage)
  public reasons$: Observable<RejectReasonPage>;
  public readonly userPermissions = UserPermissions;
  @Input() showSystem: boolean;

  protected getData(): void {
    this.store.dispatch(new GetClosureReasonsByPage(this.currentPage, this.pageSize, this.orderBy));
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
