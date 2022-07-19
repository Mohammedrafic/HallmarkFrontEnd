import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ShowExportDialog, ShowFilterDialog, ShowSideDialog} from '../../store/app.actions';
import {Select, Store} from '@ngxs/store';
import {UserState} from '../../store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import {debounceTime, distinctUntilChanged, filter, Observable, takeUntil} from "rxjs";
import {SearchComponent} from "@shared/components/search/search.component";
import {map} from "rxjs/operators";
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { Subject } from 'rxjs';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {SecurityState} from "../../security/store/security.state";
import {RoleTreeField} from "../../security/roles-and-permissions/role-form/role-form.component";
import {ExternalBillRatePermissions} from "@organization-management/bill-rates/models/external-bill-rate-permissions.enum";

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
export class BillRatesComponent extends AbstractGridConfigurationComponent implements OnInit, AfterViewInit, OnDestroy {
  @Select(SecurityState.roleTreeField)
  public roleTreeField$: Observable<RoleTreeField>;

  @ViewChild("search") search: SearchComponent;
  public isBillRateSetupTabActive: boolean = true;
  public isExternalBillRateType: boolean = false;
  public isExternalBillRateTypeMapping: boolean = false;
  public exportMap = new Map<BillRateNavigationTabs, Subject<ExportedFileType>>([
    [BillRateNavigationTabs.BillRateSetup, new Subject<ExportedFileType>()],
    [BillRateNavigationTabs.ExternalBillRateType, new Subject<ExportedFileType>()],
    [BillRateNavigationTabs.ExternalBillRateTypeMapping, new Subject<ExportedFileType>()],
  ]);
  public isReadOnly = false; // TODO: temporary solution, until specific service provided

  addBillRateBtnText: string = "Add Record";
  selectedTab: BillRateNavigationTabs = BillRateNavigationTabs.BillRateSetup;

  searchQuery: string = '';
  private unsubscribe$: Subject<void> = new Subject();
  public filteredItems$ = new Subject<number>();
  externalBillRatePermissions = ExternalBillRatePermissions;
  externalBillRatePermissionsMap: Map<ExternalBillRatePermissions, boolean> = new Map<ExternalBillRatePermissions, boolean>();

  get showButton(): boolean {
    return !this.isReadOnly && !this.isExternalBillRateTypeMapping ||
      (this.isExternalBillRateType && this.externalBillRatePermissionsMap.get(ExternalBillRatePermissions.ManageExternalBillRates) as boolean);
  }

  constructor(private store: Store) {
    super();
  }

  ngOnInit(): void {
    this.handlePagePermission();
    this.subsToPermissions();
  }

  ngAfterViewInit(): void {
    this.subsToSearch();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public override defaultExport(fileType: ExportedFileType): void {
    (this.exportMap.get(this.selectedTab) as Subject<ExportedFileType>).next(fileType);
  }

  public onTabSelected(selectedTab: any): void {
    this.selectedTab = selectedTab.selectedIndex;
    this.isBillRateSetupTabActive = BillRateNavigationTabs.BillRateSetup === selectedTab.selectedIndex;
    this.isExternalBillRateType = BillRateNavigationTabs.ExternalBillRateType === selectedTab.selectedIndex;
    this.isExternalBillRateTypeMapping = BillRateNavigationTabs.ExternalBillRateTypeMapping === selectedTab.selectedIndex;

    this.store.dispatch(new ShowSideDialog(false));
    this.setBillRateBtnText(selectedTab.selectedIndex);
    this.searchQuery = '';
  }

  public filter(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  private setBillRateBtnText(tabIndex: number): void {
    switch (tabIndex) {
      case BillRateNavigationTabs.BillRateSetup :
        this.addBillRateBtnText = "Add Record";
        break;
      case BillRateNavigationTabs.ExternalBillRateType :
        this.addBillRateBtnText = "Add External Bill Rate";
        break;
      case BillRateNavigationTabs.ExternalBillRateTypeMapping :
        this.addBillRateBtnText = "Add Mapping";
        break;
    }
  }

  public addBillRateSetupRecord(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  // TODO: temporary solution, until specific service provided
  private handlePagePermission(): void {
    const user = this.store.selectSnapshot(UserState.user);
    this.isReadOnly = user?.businessUnitType === BusinessUnitType.Organization;
  }

  subsToSearch(): void {
    this.search?.inputKeyUpEnter.pipe(
      map((event: KeyboardEvent) => (event.target as HTMLInputElement).value),
      map(q => q.toLowerCase().trim()),
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.unsubscribe$),
    ).subscribe(q => {
      if (q.length >= 2 || q.length === 0) {
        this.searchQuery = q;
      }
    });
  }

  subsToPermissions(): void {
    this.roleTreeField$.pipe(
      map(tree => tree.dataSource),
      filter(items => Boolean(items.length)),
      takeUntil(this.unsubscribe$)
    ).subscribe(permissions => {
      this.externalBillRatePermissionsMap
        .set(
          ExternalBillRatePermissions.ViewExternalBillRates,
          Boolean(permissions.find(item => item.name === ExternalBillRatePermissions.ViewExternalBillRates)?.isAssignable))
        .set(
          ExternalBillRatePermissions.ManageExternalBillRates,
          Boolean(permissions.find(item => item.name === ExternalBillRatePermissions.ManageExternalBillRates)?.isAssignable)
        );
    })
  }
}

