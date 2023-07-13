import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { Store } from '@ngxs/store';
import { GridComponent, RowDataBoundEventArgs } from '@syncfusion/ej2-angular-grids';
import { Configuration, ConfigurationChild } from '@shared/models/organization-settings.model';

@Component({
  selector: 'app-configuration-grid',
  templateUrl: './configuration-grid.component.html',
  styleUrls: ['./configuration-grid.component.scss'],
})
export class ConfigurationGridComponent extends AbstractPermissionGrid {
  @ViewChild('grid') grid: GridComponent;

  @Input() configurations: Configuration[] = [];
  @Input() orgSystems = {
    IRP: false,
    VMS: false,
    IRPAndVMS: false,
  };
  @Input() disabledSettings: string[];
  @Input() hasPermissions: Record<string, boolean> = {};
  @Input() override gridDataSource: object[] = [];
  @Input() override totalDataRecords = 0;

  @Output() openOverrideSettingDialog = new EventEmitter<Configuration>();
  @Output() openEditSettingDialog = new EventEmitter<{
    parentRecord: Configuration,
    childRecord: ConfigurationChild | undefined,
    event: MouseEvent
  }>();

  public constructor(
    protected override store: Store,
  ) {
    super(store);
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
    if ((args.data as Configuration)?.children?.length === 0 && args.row) {
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
}
