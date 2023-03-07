import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TakeUntilDestroy } from '@core/decorators';
import { DateTimeHelper } from '@core/helpers';
import { Select, Store } from '@ngxs/store';
import { OrientationTab } from '@organization-management/orientation/enums/orientation-type.enum';
import { OrientationConfiguration, OrientationConfigurationFilters, OrientationConfigurationPage } from '@organization-management/orientation/models/orientation.model';
import { OrientationService } from '@organization-management/orientation/services/orientation.service';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, SETUPS_ACTIVATED } from '@shared/constants';
import { MessageTypes } from '@shared/enums/message-types';
import { AbstractPermissionGrid } from '@shared/helpers/permissions/abstract-permission-grid';
import { BulkActionConfig, BulkActionDataModel } from '@shared/models/bulk-action-data.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { getAllErrors } from '@shared/utils/error.utils';
import { filter, Observable, takeUntil } from 'rxjs';
import { ShowSideDialog, ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';

@Component({
  selector: 'app-orientation-historical-data',
  templateUrl: './orientation-historical-data.component.html',
  styleUrls: ['./orientation-historical-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@TakeUntilDestroy
export class OrientationHistoricalDataComponent extends AbstractPermissionGrid implements OnInit {
  @Input() public isActive: boolean;
  
  public readonly orientationTab = OrientationTab;
  public dataSource: OrientationConfigurationPage;
  public filters: OrientationConfigurationFilters = { pageNumber: 1, pageSize: this.pageSize };
  public disableControls: boolean = false;
  public orientationForm: FormGroup = this.orientationService.generateHistoricalDataForm();
  public bulkActionConfig: BulkActionConfig = { activate: true };

  @Select(UserState.lastSelectedOrganizationId)
  public readonly organizationId$: Observable<number>;

  protected componentDestroy: () => Observable<unknown>;
  
  constructor(
    protected override store: Store,
    private cd: ChangeDetectorRef,
    private orientationService: OrientationService,
    private confirmService: ConfirmService,
  ) {
    super(store);
    this.watchForOrgChange();
    this.watchForSettingState();
  }

  private watchForSettingState(): void {
    this.orientationService.checkIfSettingOff()
      .pipe(
        takeUntil(this.componentDestroy()),
      )
      .subscribe(val => {
        this.disableControls = val;
        this.cd.markForCheck();
      })
  }

  private watchForOrgChange(): void {
    this.organizationId$
      .pipe(
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
        this.getOrientationHistoricalData();
      });
  }

  private getOrientationHistoricalData(): void {
    this.orientationService.getOrientationConfigs(this.filters).subscribe(data => {
      this.dataSource = data; // TODO: use historical data API
      this.cd.markForCheck();
    });
  }

  private populateForm(data: number[]): void {
    this.orientationForm.patchValue({
      ids: data,
      endDate: null,
    });
    this.cd.markForCheck();
  }

  private closeHandler(): void {
    this.orientationForm.reset();
    this.store.dispatch(new ShowSideDialog(false));
  }

  public closeDialog(): void {
    if (this.orientationForm.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm: boolean) => !!confirm))
        .subscribe(() => {
          this.closeHandler();
        });
    } else {
      this.closeHandler();
    }
  }

  
  public saveRecord(): void {
    if (this.orientationForm.invalid) {
      this.orientationForm.markAllAsTouched();
    } else {
      const data = this.orientationForm.getRawValue();
      data.endDate = data.endDate ? DateTimeHelper.toUtcFormat(data.endDate) : data.endDate;
      this.orientationService.saveOrientationConfiguration(data).subscribe({ // TODO: replace with correct API
        next: () => {
          this.store.dispatch(new ShowToast(MessageTypes.Success, SETUPS_ACTIVATED));
          this.closeHandler();
          this.getOrientationHistoricalData();
        },
        error: (error) => this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)))
      });
    }
  }

  public pageChange(data: OrientationConfigurationFilters): void {
    this.filters = data;
    this.getOrientationHistoricalData();
  }

  public openDialog(event: {
    isBulk: boolean
    data: OrientationConfiguration | BulkActionDataModel
  }): void {
    if (!event.isBulk) {
      this.populateForm([(event.data as OrientationConfiguration).id]);    
    } else {
      const ids = (event.data as BulkActionDataModel).items.map(item => item.data.id);
      this.populateForm(ids);
    }
    this.store.dispatch(new ShowSideDialog(true));
  }
}
