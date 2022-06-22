import { Component, OnInit } from '@angular/core';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from '../../store/app.actions';
import { Store } from '@ngxs/store';
import { FilteredItem } from '@shared/models/filter.model';
import { UserState } from '../../store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { Subject } from 'rxjs';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';

export enum BillRateNavigationTabs {
  BillRateSetup,
  ExternalBillRateType,
  ExternalBillRateTypeMapping
}

@Component({
  selector: 'app-bill-rates',
  templateUrl: './bill-rates.component.html',
  styleUrls: ['./bill-rates.component.scss']
})
export class BillRatesComponent extends AbstractGridConfigurationComponent implements OnInit {
  public isBillRateSetupTabActive: boolean = true;
  public isExternalBillRateType: boolean = false;
  public isExternalBillRateTypeMapping: boolean = false;
  public exportBillRateSetup$ = new Subject<ExportedFileType>();
  public isReadOnly = false; // TODO: temporary solution, until specific service provided

  constructor(private store: Store) {
    super();
  }

  ngOnInit(): void {
    this.handlePagePermission();
  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public override defaultExport(fileType: ExportedFileType): void {
    if (this.isBillRateSetupTabActive) {
      this.exportBillRateSetup$.next(fileType);
    }
  }

  public onTabSelected(selectedTab: any): void {
    this.isBillRateSetupTabActive = BillRateNavigationTabs['BillRateSetup'] === selectedTab.selectedIndex;
    this.isExternalBillRateType = BillRateNavigationTabs['ExternalBillRateType'] === selectedTab.selectedIndex;
    this.isExternalBillRateTypeMapping = BillRateNavigationTabs['ExternalBillRateTypeMapping'] === selectedTab.selectedIndex;
    this.store.dispatch(new ShowSideDialog(false));
  }

  public filter(): void {
    // TODO: uncomment after implementation
    // this.store.dispatch(new ShowFilterDialog(true));
  }

  public addBillRateSetupRecord(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  // TODO: temporary solution, until specific service provided
  private handlePagePermission(): void {
    const user = this.store.selectSnapshot(UserState.user);
    this.isReadOnly = user?.businessUnitType === BusinessUnitType.Organization;
  }
}

