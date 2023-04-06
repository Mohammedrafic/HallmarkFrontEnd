import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { Store } from '@ngxs/store';
import { SelectEventArgs } from '@syncfusion/ej2-angular-navigations';

import { TakeUntilDestroy } from '@core/decorators';
import { AbstractPermissionGrid } from "@shared/helpers/permissions";
import { Observable, Subject } from 'rxjs';
import { OrientationTab } from './enums/orientation-type.enum';
import { ShowExportDialog } from 'src/app/store/app.actions';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn } from '@shared/models/export.model';
import { MasterOrientationExportCols } from './components/orientation-grid/orientation-grid.constants';

@Component({
  selector: 'app-orientation',
  templateUrl: './orientation.component.html',
  styleUrls: ['./orientation.component.scss'],
})
@TakeUntilDestroy
export class OrientationComponent extends AbstractPermissionGrid implements OnInit {
  public readonly orientationTab = OrientationTab;
  public selectedTab: OrientationTab = OrientationTab.Setup;
  public exportOrientation$ = new Subject<ExportedFileType>();
  public columnsToExport: ExportColumn[] = MasterOrientationExportCols;
  protected componentDestroy: () => Observable<unknown>;

  constructor(
    protected override store: Store,
    private cd: ChangeDetectorRef,
  ) {
    super(store);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public override defaultExport(fileType: ExportedFileType): void {
      this.exportOrientation$.next(fileType);
  }

  selectTab(selectedTab: SelectEventArgs): void {
    this.selectedTab = selectedTab.selectedIndex;
    this.cd.markForCheck();
  }
}
