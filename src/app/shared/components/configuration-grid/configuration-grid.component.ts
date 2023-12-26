import { Component, ViewChild, Input, Output, EventEmitter,OnInit } from '@angular/core';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { Store } from '@ngxs/store';
import { GridComponent, RowDataBoundEventArgs } from '@syncfusion/ej2-angular-grids';
import { Configuration, ConfigurationChild } from '@shared/models/organization-settings.model';
import {
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
} from 'src/app/shared/constants/messages';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { DeleteOrganizationSettingsValues, DeleteOrganizationSettingsValuesSucceeded } from '@organization-management/store/organization-management.actions';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { distinctUntilChanged, filter, merge, Observable, ObservableInput, skip, Subject, switchMap, take, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-configuration-grid',
  templateUrl: './configuration-grid.component.html',
  styleUrls: ['./configuration-grid.component.scss'],
})
export class ConfigurationGridComponent extends AbstractPermissionGrid implements OnInit{
  @ViewChild('grid') grid: GridComponent;

  @Input() configurations: Configuration[] = [];
  @Input() set showSystemColumn(value: boolean) {
    this.showSystem = value;
    if (this.grid) {
      this.grid.getColumnByField('systemType').visible = value;
      this.grid.refreshColumns();
    }
  }
  public showSystem = false;
  private unsubscribe$: Subject<void> = new Subject();
  @Input() disabledSettings: string[];
  @Input() hasPermissions: Record<string, boolean> = {};
  @Input() override gridDataSource: object[] = [];
  @Input() override totalDataRecords = 0;
  @Input() set isAgency(value: boolean) {
    this.hideColumn = value;
    this.grid?.refreshColumns();
  }
  public hideColumn: boolean;

  @Output() openOverrideSettingDialog = new EventEmitter<Configuration>();
  @Output() openEditSettingDialog = new EventEmitter<{
    parentRecord: Configuration,
    childRecord: ConfigurationChild | undefined,
    event: MouseEvent
  }>();
  @Output() DeleteSettingValueSucceded = new EventEmitter<boolean>();

  public constructor(
    protected override store: Store,
    private confirmService:ConfirmService,
    private actions$: Actions,
  ) {
    super(store);
  }
  override ngOnInit(): void {
    super.ngOnInit();
    this.watchForDeleteAction();
  }
  public changePageSize(event: number): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = event;
  }

  public changePage(event: number): void {
    this.gridDataSource = this.getRowsPerPage(this.configurations, event);
    this.currentPagerPage = event;
  }

  public emitOpenOverrideSettingDialog(data: Configuration): void {
    this.openOverrideSettingDialog.emit(data);
  }

  public emitOpenEditSettingDialog(
    parentRecord: Configuration,
    childRecord: ConfigurationChild | undefined,
    event: MouseEvent
  ): void {
    this.openEditSettingDialog.emit({parentRecord, childRecord, event});
  }

  public rowDataBound(args: RowDataBoundEventArgs): void {
    // hides expand button if no children
    if (!(args.data as Configuration)?.children?.length && args.row) {
      const element = args.row.querySelector('td');
      if (element) {
        element.innerHTML = ' ';
        element.className = 'e-customized-expand-cell';
      }
    }
  }

  private getRowsPerPage(data: Configuration[], currentPage: number): Configuration[] {
    return data.slice(
      currentPage * this.pageSizePager - this.pageSizePager,
      currentPage * this.pageSizePager
    );
  }
  public onDeleteSettingValue(settingValueId?: number){
    this.confirmService
    .confirm(DELETE_RECORD_TEXT, {
      title: DELETE_RECORD_TITLE,
      okButtonLabel: 'Delete',
      okButtonClass: 'delete-button',
    })
    .subscribe((confirm) => {
      if (confirm) {
        this.store.dispatch(new DeleteOrganizationSettingsValues(settingValueId));
      }
      this.removeActiveCssClass();
    });
  }
  private watchForDeleteAction(): void {
    this.actions$
    .pipe(
      takeUntil(this.unsubscribe$),
      ofActionSuccessful(DeleteOrganizationSettingsValuesSucceeded)
    ).subscribe(() => {
     this.DeleteSettingValueSucceded.emit(true);
    });
  
  }
}
