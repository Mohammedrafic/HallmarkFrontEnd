import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from '../../store/app.actions';
import { Store } from '@ngxs/store';
import { UserState } from '../../store/user.state';
import { Subject } from 'rxjs';
import { SearchComponent } from '@shared/components/search/search.component';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { GetOrganizationStructure } from '../../store/user.actions';
import { AbstractPermissionGrid } from "@shared/helpers/permissions";

@Component({
  selector: 'app-pay-rate',
  templateUrl: './pay-rate.component.html',
  styleUrls: ['./pay-rate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayRateComponent extends AbstractPermissionGrid implements OnInit {

  public exportMap = new Subject<ExportedFileType>()

  addPayRateBtnText: string = 'Add Record';

  searchQuery: string = '';
  public filteredItems$ = new Subject<number>();
  
  constructor(protected override store: Store) {
    super(store);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.store.dispatch(new GetOrganizationStructure());
  }

  public override defaultExport(fileType: ExportedFileType): void {
    (this.exportMap as Subject<ExportedFileType>).next(fileType);
  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public filter(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }


  public addPayRateSetupRecord(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  subsToPermissions(): void {
    this.userPermission = this.store.selectSnapshot(UserState.userPermission);
  }

}
