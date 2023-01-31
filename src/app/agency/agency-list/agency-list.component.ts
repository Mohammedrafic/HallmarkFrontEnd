import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { debounceTime, filter, Observable, Subject, takeUntil } from 'rxjs';

import {
  ExportAgencyList,
  GetAgencyByPage,
  GetAgencyFilteringOptions,
  SaveAgency,
  SaveAgencySucceeded,
} from 'src/app/agency/store/agency.actions';
import { AgencyState } from 'src/app/agency/store/agency.state';
import { AgencyStatus, STATUS_COLOR_GROUP } from 'src/app/shared/enums/status';
import { Agency, AgencyFilteringOptions, AgencyListFilters, AgencyPage } from 'src/app/shared/models/agency.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
import { SetHeaderState, ShowExportDialog, ShowFilterDialog } from 'src/app/store/app.actions';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { DatePipe } from '@angular/common';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { agencyListFilterColumns, agencyStatusMapper } from '@agency/agency-list/agency-list.constants';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';

@Component({
  selector: 'app-agency-list',
  templateUrl: './agency-list.component.html',
  styleUrls: ['./agency-list.component.scss'],
})
export class AgencyListComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  public readonly statusEnum = AgencyStatus;
  public readonly statusMapper = agencyStatusMapper;

  public columnsToExport: ExportColumn[] = [
    { text: 'Agency Name', column: 'AgencyName' },
    { text: 'Agency Status', column: 'AgencyStatus' },
    { text: 'Contact Person', column: 'ContactPerson' },
    { text: 'Phone', column: 'Phone' },
  ];
  public fileName: string;
  public defaultFileName: string;
  public filterColumns = agencyListFilterColumns;
  public agencyListFilterFormGroup: FormGroup;
  public filteredItems$ = new Subject<number>();

  private filters: AgencyListFilters = {};
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

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
    this.store.dispatch(new SetHeaderState({ title: 'Agency List', iconName: 'clock' }));
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.initAgencyListFilterFormGroup();
    this.updatePage();
    this.subscribeOnPageChanges();
    this.subscribeOnAgencyFilteringOptions();
    this.subscribeOnSuccessAgencyByPage();
    this.setFileName();
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

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  public getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find((item) => item[1].includes(status));
    return found ? found[0] : 'e-default';
  }

  public onEdit(data: any) {
    this.router.navigate(['/agency/agency-list/edit', data.agencyDetails.id]);
  }

  public onRemove(data: any) {
    this.confirmService
      .confirm('Are you sure you want to inactivate the Agency?', {
        okButtonLabel: 'Inactivate',
        okButtonClass: 'delete-button',
        title: 'Inactivate the Agency',
      })
      .pipe(filter((confirm) => !!confirm))
      .subscribe(() => {
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
    });
    this.filteredItems = this.filterService.generateChips(this.agencyListFilterFormGroup, this.filterColumns);
    this.filteredItems$.next(this.filteredItems.length);
  }

  public override updatePage(): void {
    this.store.dispatch(new GetAgencyByPage(this.currentPage, this.pageSize, this.orderBy, this.filters));
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
    });
  }
}
