import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ofActionSuccessful, Select } from "@ngxs/store";
import { Observable, takeWhile } from "rxjs";
import {
  GetCategoryNoteReasons,
  RemoveCategoryNoteReasons, UpdateCategoryNoteReasonsError, UpdateCategoryNoteReasonsSuccess
} from "@organization-management/store/reject-reason.actions";
import { RejectReasonState } from "@organization-management/store/reject-reason.state";
import { RejectReasonPage } from "@shared/models/reject-reason.model";
import { ReasonsComponent } from '@organization-management/reasons/models/reasons-component.class';
import { UserPermissions } from "@core/enums";
import { Permission } from "@core/interface";

@Component({
  selector: 'app-category-note',
  templateUrl: './category-note.component.html',
  styleUrls: ['./category-note.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryNoteComponent extends ReasonsComponent implements OnInit,OnDestroy {

 
  @Input() userPermission: Permission;

  @Select(RejectReasonState.categoryNote)
  public reasons$: Observable<RejectReasonPage>;
  public readonly userPermissions = UserPermissions;

  protected getData(): void {
    this.store.dispatch(new GetCategoryNoteReasons(this.currentPage, this.pageSize));
  }

  protected remove(id: number): void {
    this.store.dispatch(new RemoveCategoryNoteReasons(id));
  }

  protected subscribeOnSaveReasonError(): void {
    this.actions$.pipe(
      ofActionSuccessful(UpdateCategoryNoteReasonsError),
      takeWhile(() => this.isAlive)
    ).subscribe(() => this.setReasonControlError());
  }

  protected subscribeOnUpdateReasonSuccess(): void {
    this.actions$.pipe(
      ofActionSuccessful(UpdateCategoryNoteReasonsSuccess),
      takeWhile(() => this.isAlive),
    ).subscribe(() => this.getData());
  }
}
