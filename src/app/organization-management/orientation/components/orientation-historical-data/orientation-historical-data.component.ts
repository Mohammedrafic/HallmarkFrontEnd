import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TakeUntilDestroy } from '@core/decorators';
import { Select, Store } from '@ngxs/store';
import { OrientationTab } from '@organization-management/orientation/enums/orientation-type.enum';
import { OrientationConfiguration, OrientationConfigurationFilters, OrientationConfigurationPage } from '@organization-management/orientation/models/orientation.model';
import { OrientationService } from '@organization-management/orientation/services/orientation.service';
import { DialogMode } from '@shared/enums/dialog-mode.enum';
import { AbstractPermissionGrid } from '@shared/helpers/permissions/abstract-permission-grid';
import { OrganizationStructure } from '@shared/models/organization.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { filter, Observable, takeUntil } from 'rxjs';
import { ShowSideDialog } from 'src/app/store/app.actions';
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
  public title: DialogMode;
  public isEdit: boolean = false;
  public disableControls: boolean = false;

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

  private populateForm(data: OrientationConfiguration): void {
    // TODO: create formGroup
    this.cd.markForCheck();
  }

  public pageChange(data: OrientationConfigurationFilters): void {
    this.filters = data;
    this.getOrientationHistoricalData();
  }

  public openDialog(data: OrientationConfiguration): void {
    if (data) {
      this.title = DialogMode.Edit;
      this.isEdit = true;
      this.populateForm(data);
      this.store.dispatch(new ShowSideDialog(true));
    }
  }
}
