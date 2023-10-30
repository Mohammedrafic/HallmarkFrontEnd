import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ofActionSuccessful, Select } from "@ngxs/store";
import { Observable, takeWhile } from "rxjs";
import {
  GetRejectReasonsByPage,
  RemoveRejectReasons,
  SaveRejectReasonsError,
  UpdateRejectReasonsSuccess,
} from "@organization-management/store/reject-reason.actions";
import { RejectReasonState } from "@organization-management/store/reject-reason.state";
import { RejectReasonPage } from "@shared/models/reject-reason.model";
import { ReasonsComponent } from '@organization-management/reasons/models/reasons-component.class';
import { UserPermissions } from "@core/enums";
import { Permission } from "@core/interface";

@Component({
  selector: 'app-candidate-reject-reason',
  templateUrl: './candidate-reject-reason.component.html',
  styleUrls: ['./candidate-reject-reason.component.scss'],
})
export class CandidateRejectReasonComponent extends ReasonsComponent implements OnInit,OnDestroy {
  @Input() userPermission: Permission;
  @Input() showSystem = false;

  @Select(RejectReasonState.rejectReasonsPage)
  public reasons$: Observable<RejectReasonPage>;
  public readonly userPermissions = UserPermissions;

  protected getData(): void {
    this.store.dispatch(new GetRejectReasonsByPage(this.currentPage, this.pageSize));
  }

  protected remove(id: number): void {
    this.store.dispatch(new RemoveRejectReasons(id));
  }

  protected subscribeOnSaveReasonError(): void {
    this.actions$.pipe(
      ofActionSuccessful(SaveRejectReasonsError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.setReasonControlError());
  }

  protected subscribeOnUpdateReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(UpdateRejectReasonsSuccess),
      takeWhile(() => this.isAlive),
    ).subscribe(() => this.getData());
  }
}
