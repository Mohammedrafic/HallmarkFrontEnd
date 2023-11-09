import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { debounceTime, filter, Observable, Subject, takeUntil, take } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

import {
  ExportAgencyList,
  GetAgencyByPage,
  GetAgencyFilteringOptions,
  SaveAgency,
  SaveAgencySucceeded,
  ConvertAgencyToMSP,
  ConvertAgencyToMSPSucceeded
} from 'src/app/agency/store/agency.actions';
import { AgencyState } from 'src/app/agency/store/agency.state';
import { AgencyStatus, STATUS_COLOR_GROUP } from 'src/app/shared/enums/status';
import { Agency, AgencyFilteringOptions, AgencyListFilters, AgencyPage } from 'src/app/shared/models/agency.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { SetHeaderState, ShowExportDialog, ShowFilterDialog, ShowMSPCustomSideDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { DatePipe } from '@angular/common';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { agencyListFilterColumns, agencyStatusMapper, MSPMenuOptions, MSPMenuType } from '@agency/agency-list/agency-list.constants';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { ConfirmEventType } from '@shared/enums/confirm-modal-events.enum';
import { UserState } from '../../store/user.state';
import { BusinessUnitType } from '../../shared/enums/business-unit-type';


@Component({
  selector: 'app-agency-list',
  templateUrl: './agency-list.component.html',
  styleUrls: ['./agency-list.component.scss'],
})
export class AgencyListComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
    convertAgencyToMSPFormGroup: FormGroup;

  onScroll() {
    if (this.trigger) {
      this.trigger.closeMenu();
    }
  }

  public readonly statusEnum = AgencyStatus;
  public readonly statusMapper = agencyStatusMapper;

  public columnsToExport: ExportColumn[] = [
    { text: 'Agency VMSId', column: 'AgencyVMSID' },
    { text: 'Agency Name', column: 'AgencyName' },
    { text: 'Agency Status', column: 'AgencyStatus' },
    { text: 'NetSuite Id', column:'NetSuiteId'},
    { text: 'Tax ID', column: 'TaxID' },
    { text: 'Address Line1', column: 'AddressLine1' },
    { text: 'Address Line2', column: 'AddressLine2' },
    { text: 'City', column: 'City' },
    { text: 'State', column: 'State' },
    { text: 'Country', column: 'Country' },
    { text: 'ZipCode', column: 'ZipCode' },
    { text: 'Phone Line1', column: 'PhoneLine1' },
    { text: 'Phone Line 2', column: 'PhoneLine2' },
    { text: 'Fax', column: 'Fax' },
    { text: 'Last Modified At', column: 'LastModifiedAt' },
    { text: 'Last Modified By', column: 'LastModifiedBy' },
    { text: 'Base Fee', column: 'BaseFee' },
    { text: 'Payment Mode', column: 'PaymentMode' },
    { text: 'Payee', column: 'Payee' },
    { text: 'Effective date', column: 'Effectivedate' },
    { text: 'Effective date ending', column: 'Effectivedateending' },
    { text: 'Bank Name', column: 'BankName' },
    { text: 'Routing Number', column:'RoutingNumber'},
    { text: 'Account Holder Name', column: 'AccountHolderName' },
    { text: 'NS PaymentId', column:'NSPaymentID'},
    { text: 'Contact Person', column: 'ContactPerson' },
    { text: 'Phone', column: 'Phone' },
    
  ];
  public fileName: string;
  public defaultFileName: string;
  public filterColumns = agencyListFilterColumns;
  public agencyListFilterFormGroup: FormGroup;
  public filteredItems$ = new Subject<number>();
  public menuOption: Record<string, ItemModel[]>;
  public currentAgency: Agency;
  public convertMspHeader: string = "Convert To MSP";

  private filters: AgencyListFilters = {};
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  public agencyData = new Subject<Agency>();
  public businessUnitType: BusinessUnitType;
  public isBusinessUnitTypeMSP: boolean = false;
  public isBusinessUnitTypeHallmark: boolean = false;

  @Select(AgencyState.agencies)
  agencies$: Observable<AgencyPage>;

  @Select(AgencyState.agencyFilteringOptions)
  agencyFilteringOptions$: Observable<AgencyFilteringOptions>;

  constructor(
    protected override store: Store,
    private router: Router,
    private actions$: Actions,
    private confirmService: ConfirmService,
    private datePipe: DatePipe,
    private filterService: FilterService,
    private formBuilder: FormBuilder
  ) {
    super(store);
    this.store.dispatch(new SetHeaderState({ title: 'Agency List', iconName: 'briefcase' }));
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.initAgencyListFilterFormGroup();
    this.initMenuItems();
    this.updatePage();
    this.subscribeOnPageChanges();
    this.subscribeOnAgencyFilteringOptions();
    this.subscribeOnSuccessAgencyByPage();
    this.setFileName();
    this.setBusinessUnitType();
    this.subscribeOnSuccessAgencyConvertedToMspByPage();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public navigateToAgencyForm(): void {
    this.router.navigate(['/agency/agency-list/add']);
  }

  public dataBound(): void {
    this.contentLoadedHandler();
    this.grid.hideScroll();
  }

  public setBusinessUnitType(): void {
    this.businessUnitType = this.store.selectSnapshot(UserState.user)?.businessUnitType as BusinessUnitType;
    if (this.businessUnitType == BusinessUnitType.Hallmark) {
      this.isBusinessUnitTypeHallmark = true;
    }
    else if (this.businessUnitType == BusinessUnitType.MSP) {
      this.isBusinessUnitTypeMSP = true;
    }
  }

  public changeGridSize(page: number): void {
    this.pageSize = page;
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
    this.currentPage = 1;
  }

  public changeGridPage(page: number): void {
    this.pageSubject.next(page);
  }

  public getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find((item) => item[1].includes(status));
    return found ? found[0] : 'e-default';
  }

  public onEdit(data: Agency) {
    this.router.navigate(['/agency/agency-list/edit', data.agencyDetails.id]);
  }

  public onRemove(data: Agency) {
    this.confirmService
      .confirmActions('Are you sure you want to inactivate the Agency?', {
        okButtonLabel: 'Inactivate',
        okButtonClass: 'delete-button',
        title: 'Inactivate the Agency',
      })
      .pipe(
        take(1),
        filter(({action}) => action === ConfirmEventType.YES),
      ).subscribe(() => {
        this.inactivateAgency(data);
      });
  }

  public closeExport(): void {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.defaultFileName = this.getDefaultFileName();
    this.store.dispatch(
      new ExportAgencyList(
        new ExportPayload(
          fileType,
          {
            ids: this.selectedItems.length ? this.selectedItems.map((val) => val.createUnder.id) : null,
            ...this.filters,
          },
          options ? options.columns.map((val) => val.column) : this.columnsToExport.map((val) => val.column),
          null,
          options?.fileName || this.defaultFileName
        )
      )
    );
    this.clearSelection(this.grid);
  }

  public override customExport(): void {
    this.defaultFileName = this.getDefaultFileName();
    this.fileName = this.defaultFileName;
    this.store.dispatch(new ShowExportDialog(true));
  }

  public showFilters(): void {
    this.store.dispatch(new GetAgencyFilteringOptions());
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.agencyListFilterFormGroup, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.updatePage();
  }

  private clearFilters(): void {
    this.agencyListFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
    this.filteredItems$.next(this.filteredItems.length);
  }

  public onFilterApply(): void {
    this.filters = this.agencyListFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.agencyListFilterFormGroup, this.filterColumns);
    this.updatePage();
    this.store.dispatch(new ShowFilterDialog(false));
    this.filteredItems$.next(this.filteredItems.length);
  }

  public onFilterClose() {
    this.agencyListFilterFormGroup.setValue({
      searchTerm: this.filters.searchTerm || null,
      businessUnitNames: this.filters.businessUnitNames || [],
      statuses: this.filters.statuses || [],
      cities: this.filters.cities || [],
      contacts: this.filters.contacts || [],
      isMSPAgencies: this.filters.isMSPAgencies || null,
    });
    this.filteredItems = this.filterService.generateChips(this.agencyListFilterFormGroup, this.filterColumns);
    this.filteredItems$.next(this.filteredItems.length);
  }

  public override updatePage(): void {
    this.store.dispatch(new GetAgencyByPage(this.currentPage, this.pageSize, this.orderBy, this.filters));
  }

  public menuOptionSelected(id: MSPMenuType, data: Agency): void {
    switch (Number(id)) {
      case MSPMenuType['Edit']:
        this.onEdit(data);
        break;
      case MSPMenuType['Convert to MSP']:
        this.currentAgency = data;
        this.store.dispatch(new ShowMSPCustomSideDialog(true));
        break;
      case MSPMenuType['Unlink from MSP']:
        /*to be implemented*/
        break;
      case MSPMenuType['View History']:
        this.agencyData.next(data);
        break;
    }
  }

  public onMspSideDialogClose(): void {
    this.store.dispatch(new ShowMSPCustomSideDialog(false));
  }

  public onConvertAgencyToMSPFormSaveClick(): void {
    var agencyId = this.currentAgency.agencyDetails.id ?? null;
    var netSuiteId = this.currentAgency.netSuiteId ?? null;
    var name = this.currentAgency.agencyDetails.name;
    this.store.dispatch(new ConvertAgencyToMSP(agencyId, netSuiteId, name));
    this.store.dispatch(new ShowMSPCustomSideDialog(false));
    this.updatePage();
  }

  private initMenuItems(): void {
    this.agencies$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data?.items) {
        data.items.forEach((item) => {
          this.menuOption = MSPMenuOptions(item.isMsp ? item.isMsp : false);
          item.menuItems = this.menuOption['mSPMenuOption'];
        });
      }
    });
  }

  private getDefaultFileName(): string {
    const currentDateTime = this.generateDateTime(this.datePipe);
    return `Agency List ${currentDateTime}`;
  }

  private inactivateAgency(agency: Agency): void {
    if (agency.createUnder) {
      const inactiveAgency = {
        agencyDetails: { ...agency.agencyDetails, status: AgencyStatus.Inactive },
        agencyBillingDetails: agency.agencyBillingDetails,
        agencyContactDetails: agency.agencyContactDetails,
        agencyPaymentDetails: agency.agencyPaymentDetails,
        agencyJobDistribution: agency.agencyJobDistribution,
        agencyId: agency.agencyDetails.id,
        parentBusinessUnitId: agency.createUnder.parentUnitId,
      };

      this.store.dispatch(new SaveAgency(inactiveAgency));
    }
  }

  private setFileName(): void {
    const currentDateTime = this.datePipe.transform(Date.now(), 'MM/dd/yyyy');
    this.fileName = `Agency ${currentDateTime}`;
  }

  private subscribeOnSuccessAgencyByPage(): void {
    this.actions$
      .pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveAgencySucceeded))
      .subscribe((agency: { payload: Agency }) => {
        this.updatePage();
      });
  }

  private subscribeOnSuccessAgencyConvertedToMspByPage(): void {
    this.actions$
      .pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(ConvertAgencyToMSPSucceeded))
      .subscribe(() => {
        this.updatePage();
      });
  }

  private subscribeOnPageChanges(): void {
    this.pageSubject.pipe(debounceTime(1)).subscribe((page: number) => {
      this.currentPage = page;
      this.updatePage();
    });
  }

  private subscribeOnAgencyFilteringOptions(): void {
    this.agencyFilteringOptions$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((data: AgencyFilteringOptions) => {
        this.filterColumns['businessUnitNames'].dataSource = data.businessUnitNames;
        this.filterColumns['statuses'].dataSource = data.statuses;
        this.filterColumns['cities'].dataSource = data.cities;
        this.filterColumns['contacts'].dataSource = data.contacts;
      });
  }

  private initAgencyListFilterFormGroup(): void {
    this.agencyListFilterFormGroup = this.formBuilder.group({
      searchTerm: new FormControl(null),
      businessUnitNames: new FormControl([]),
      statuses: new FormControl([]),
      cities: new FormControl([]),
      contacts: new FormControl([]),
      isMSPAgencies: new FormControl(false)
    });
  }
}
