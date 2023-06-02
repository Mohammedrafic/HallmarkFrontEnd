import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { SetHeaderState, ShowExportDialog, ShowFilterDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DonoreturnFilters } from '@shared/models/donotreturn.model';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { MasterDNRExportCols, TITLE } from '../donotreturn-grid.constants';
import { UserState } from 'src/app/store/user.state';
import { Permission } from '@core/interface';
import { UserPermissions } from '@core/enums';

@Component({
  selector: 'app-do-not-return-details',
  templateUrl: './do-not-return-details.component.html',
  styleUrls: ['./do-not-return-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DoNotReturnDetailsComponent extends AbstractPermissionGrid implements OnInit {
public filters: DonoreturnFilters = {};

  @ViewChild('grid')
  public grid: GridComponent;

  @Select(UserState.userPermission)
  currentUserPermissions$: Observable<Permission>;

  public fileName: string;
  public defaultFileName: string;
  public isdnrActive=true;
  public columnsToExport: ExportColumn[] = MasterDNRExportCols;
  public exportDonotreturn$ = new Subject<ExportedFileType>();
  public filteredcnt:number = 0;
  public importDialogEvent: Subject<boolean> = new Subject<boolean>();
  public refreshGridEvent: Subject<boolean> = new Subject<boolean>();
  public fliterFlag$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public override userPermissions = UserPermissions;

  constructor(protected override store:Store) { 
    super(store)
    store.dispatch(new SetHeaderState({ title: TITLE, iconName: 'user-x' }));
  }

  override ngOnInit(): void {
   // this.store.dispatch([new DoNotReturn.DonotreturnByPage(this.currentPage, this.pageSize, this.filters, 1)]);
    super.ngOnInit();
  }

  public override updatePage(){
    this.refreshGridEvent.next(true);
  }
  
  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public override defaultExport(fileType: ExportedFileType): void {
    if (this.isdnrActive) {
      this.exportDonotreturn$.next(fileType);
    } 
  }

  public showFilters(): void {
    this.fliterFlag$.next(true);
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public AddDonotlist(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  public addDoNotReturn(): void {
    this.fliterFlag$.next(false);
    this.store.dispatch(new ShowSideDialog(true));
  }

  public openImportDialog(): void {
    this.importDialogEvent.next(true);
  }

  public appliedFilters($event:number){
    this.filteredcnt = $event;
  }

}
