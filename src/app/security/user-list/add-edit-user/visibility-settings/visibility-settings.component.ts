import { Component, EventEmitter, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from "@angular/forms";

import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { GridComponent } from "@syncfusion/ej2-angular-grids";
import { debounceTime, filter, Observable, Subject, take, takeUntil, throttleTime } from "rxjs";

import { User } from "@shared/models/user-managment-page.model";
import { UserVisibilitySetting, UserVisibilitySettingsPage, UserVisibilityFilter } from "@shared/models/visibility-settings.model";
import { AbstractGridConfigurationComponent } from "@shared/components/abstract-grid-configuration/abstract-grid-configuration.component";
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from "@shared/constants";
import { ConfirmService } from "@shared/services/confirm.service";
import {
  GetUserVisibilitySettingsPage,
  RemoveUserVisibilitySetting,
  RemoveUserVisibilitySettingSucceeded,
  SaveUserVisibilitySettingsSucceeded
} from "src/app/security/store/security.actions";
import { SecurityState } from "src/app/security/store/security.state";

@Component({
  selector: 'app-visibility-settings',
  templateUrl: './visibility-settings.component.html',
  styleUrls: ['./visibility-settings.component.scss']
})
export class VisibilitySettingsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  @Input() set user (user: User | null) {
    this.createdUser = user;
    this.userId = this.createdUser?.id as string;
  }

  @Select(SecurityState.userVisibilitySettingsPage)
  public userVisibilitySettingsPage$: Observable<UserVisibilitySettingsPage>;

  public createdUser: User | null;
  public openAddEditDialog = new EventEmitter<UserVisibilitySetting | null>();

  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  private userId: string;

  public filters: UserVisibilityFilter = {
    userId: ''
  };

  constructor(private store: Store,
              private fb: FormBuilder,
              private actions$: Actions,
              private confirmService: ConfirmService) {
    super();
  }

  ngOnInit(): void {
    this.currentPage= 1;
    this.filters.userId = this.userId;
    this.filters.pageNumber = this.currentPage;
    this.filters.pageSize = this.pageSize;

    this.store.dispatch(new GetUserVisibilitySettingsPage(this.filters));
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetUserVisibilitySettingsPage(this.filters));
    });
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveUserVisibilitySettingsSucceeded))
      .subscribe(() => this.store.dispatch(new GetUserVisibilitySettingsPage(this.filters)));
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(RemoveUserVisibilitySettingSucceeded))
      .subscribe(() => this.store.dispatch(new GetUserVisibilitySettingsPage(this.filters)));
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public dataBound(): void {
    this.grid.hideScroll();
  }

  public addNew(): void {
    this.openAddEditDialog.emit();
  }

  public onEdit(data: UserVisibilitySetting) {
    this.openAddEditDialog.emit(data);
  }

  public onRemove(data: UserVisibilitySetting) {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .pipe(
        filter((confirm) => !!confirm),
        take(1)
        ).subscribe(() => {
        this.store.dispatch(new RemoveUserVisibilitySetting(data.id, this.userId));
      });
  }

  public onRowsDropDownChanged(): void {
    this.pageSize  = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
      this.filters.pageNumber = this.currentPage;
      this.currentPage=event.currentPage;
    }
  }
}
