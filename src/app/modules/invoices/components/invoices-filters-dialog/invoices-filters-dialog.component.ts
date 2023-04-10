import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  TrackByFunction,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import { combineLatest, debounceTime, Observable, takeUntil, switchMap } from 'rxjs';
import { distinctUntilChanged, filter, map, take } from 'rxjs/operators';

import { Destroyable } from '@core/helpers';
import { FilterPageName } from '@core/enums';
import { CustomFormGroup, DataSourceItem, PreservedFiltersByPage } from '@core/interface';
import { filterOptionFields, SkillFilterOptionFields } from '@core/constants/filters-helper.constant';
import { PageOfCollections } from '@shared/models/page.model';
import { FilterService } from '@shared/services/filter.service';
import { FilteredItem } from '@shared/models/filter.model';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion,
  OrganizationStructure } from '@shared/models/organization.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { UserState } from '../../../../store/user.state';
import { InvoicesState } from '../../store/state/invoices.state';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoicesFiltersService, InvoicesService } from '../../services';
import { InvoiceFilterColumns, InvoiceFilterFieldConfig, InvoiceRecord, InvoicesFilterState,
  InvoiceTabId } from '../../interfaces';
import { DetectFormConfigBySelectedType } from '../../constants';
import { InvoicesAgencyTabId, InvoicesOrgTabId, InvoicesTableFiltersColumns } from '../../enums';
import { InvoiceFiltersAdapter } from '../../adapters';
import { InvoicesModel } from '../../store/invoices.model';
import { PreservedFiltersState } from 'src/app/store/preserved-filters.state';
import { ClearPageFilters } from 'src/app/store/preserved-filters.actions';
import { ShowFilterDialog } from 'src/app/store/app.actions';

@Component({
  selector: 'app-invoices-filters-dialog',
  templateUrl: './invoices-filters-dialog.component.html',
  styleUrls: ['./invoices-filters-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesFiltersDialogComponent extends Destroyable implements OnInit, OnChanges {
  @Select(UserState.organizationStructure)
  private readonly organizationStructure$: Observable<OrganizationStructure>;

  @Select(InvoicesState.invoicesData)
  public invoicesData$: Observable<PageOfCollections<InvoiceRecord> | null>;

  @Select(InvoicesState.organizationStructure)
  public selectedOrgStructure$: Observable<OrganizationStructure | null>;

  @Select(InvoicesState.invoicesOrganizations)
  public readonly organizations$: Observable<DataSourceItem[]>;

  @Select(InvoicesState.selectedOrgId)
  private readonly orgId$: Observable<number>;

  @Select(PreservedFiltersState.preservedFiltersByPageName)
  private readonly preservedFiltersByPageName$: Observable<PreservedFiltersByPage<InvoicesFilterState>>;

  @Input() selectedTabId: InvoiceTabId;

  @Output() readonly appliedFiltersAmount: EventEmitter<number> = new EventEmitter<number>();
  @Output() readonly resetFilters: EventEmitter<void> = new EventEmitter<void>();
  @Output() readonly updateTableByFilters: EventEmitter<InvoicesFilterState> = new EventEmitter<InvoicesFilterState>();

  public filtersFormConfig: InvoiceFilterFieldConfig[] = [];
  public controlTypes = ControlTypes;
  public filteredItems: FilteredItem[] = [];
  public filterColumns: InvoiceFilterColumns;
  public formGroup: CustomFormGroup<InvoiceFilterColumns>;
  public filterOptionFields = filterOptionFields;
  public skillOptionFields = SkillFilterOptionFields;
  public isAgency = false;

  private regions: OrganizationRegion[] = [];

  constructor(
    private filterService: FilterService,
    private cdr: ChangeDetectorRef,
    private invoicesFiltersService: InvoicesFiltersService,
    private store: Store,
    private datePipe: DatePipe,
    private invoicesService: InvoicesService,
    private route: ActivatedRoute,
  ) {
    super();
    this.isAgency = (this.store.snapshot().invoices as InvoicesModel).isAgencyArea;
  }

  trackByFn: TrackByFunction<InvoiceFilterFieldConfig>
    = (_: number, item: InvoiceFilterFieldConfig): InvoicesTableFiltersColumns => item.field;

  ngOnInit(): void {
    this.initFiltersDataSources();
    this.initFormGroup();
    this.watchForControlsValueChanges();
    this.setFormGroupValidators();
    this.startFormGroupWatching();
    this.initFiltersColumns();
    this.watchForOrganizationStructure();
  }

  ngOnChanges(): void {
    this.invoicesFiltersService.setTabIndex(this.selectedTabId);
  }

  deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.formGroup, this.filterColumns);
    this.appliedFiltersAmount.emit(this.filteredItems.length);
    this.formGroup.markAsDirty();
  }

  clearAllFilters(eventEmmit = true): void {
    this.store.dispatch(new ClearPageFilters(this.getPageName()));
    this.formGroup.reset();
    this.filteredItems = [];
    this.appliedFiltersAmount.emit(this.filteredItems.length);

    if (eventEmmit) {
      this.resetFilters.emit();
    }
  }

  applyFilters(): void {
    if (this.formGroup.dirty) {
      this.updateTableByFilters.emit(InvoiceFiltersAdapter.prepareFilters(this.formGroup));
      this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns, this.datePipe);
      this.appliedFiltersAmount.emit(this.filteredItems.length);
      this.formGroup.markAsPristine();
    } else {
      this.store.dispatch(new ShowFilterDialog(false));
    }
    this.cdr.markForCheck();
  }

  initFiltersDataSources(): void {
    const orgIdStream = this.orgId$
    .pipe(
      filter((id) => !!id),
      distinctUntilChanged(),
    );

    const tabStream = this.invoicesFiltersService.getSelectedTabStream()
    .pipe(
      filter((id) => id !== null),
      distinctUntilChanged(),
    );

    combineLatest([orgIdStream, tabStream])
    .pipe(
      map((mergedData) => mergedData[0]),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((id) => {
      const orgId = this.isAgency ? null : id;

      if (this.selectedTabId === InvoicesOrgTabId.PendingInvoiceRecords) {
        this.store.dispatch(new Invoices.GetPendingRecordsFiltersDataSource());
      } else if (this.selectedTabId === InvoicesOrgTabId.ManualInvoicePending
        || this.selectedTabId === InvoicesAgencyTabId.ManualInvoicePending
      ) {
        this.initManualPendingFiltersDataSources(id);
      } else {
        this.store.dispatch(new Invoices.GetFiltersDataSource(orgId));
      }
    });
  }

  private initManualPendingFiltersDataSources(id: number): void {
    if (this.isAgency) {
      this.store.dispatch(new Invoices.GetManualInvoiceRecordFiltersDataSource(id));
    } else {
      this.store.dispatch(new Invoices.GetManualInvoiceRecordFiltersDataSource(null));
    }
  }

  private initFormGroup(): void {
    this.formGroup = this.invoicesFiltersService.createForm();
  }

  private setFormGroupValidators(): void {
    this.invoicesFiltersService.setupValidators(this.formGroup);
  }

  private startFormGroupWatching(): void {
    this.formGroup.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
      this.formGroup.updateValueAndValidity();
      this.cdr.detectChanges();
    });
  }

  private initFiltersColumns(): void {
    this.store
      .select(InvoicesState.invoiceFiltersColumns)
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      )
      .subscribe((filters: InvoiceFilterColumns) => {
        this.filterColumns = { ...filters };
        this.filterColumns.regionIds.dataSource = this.regions;
        this.initFormConfig();
        this.applyPreservedFilters();
        this.cdr.detectChanges();
      });
  }

  private initFormConfig(): void {
    this.filtersFormConfig = DetectFormConfigBySelectedType(this.selectedTabId, this.isAgency);
    this.cdr.detectChanges();
  }

  private watchForOrganizationStructure(): void {
    this.getOrganizationStructure()
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      )
      .subscribe((structure: OrganizationStructure) => {
        this.formGroup.reset();
        this.filteredItems = [];
        this.appliedFiltersAmount.emit(this.filteredItems.length);
        this.regions = structure.regions;
        this.filterColumns.regionIds.dataSource = [...this.regions];
        this.checkForNavigatedInvoice();
        this.cdr.markForCheck();
      });
  }

  private watchForControlsValueChanges(): void {
    this.formGroup.get('regionIds')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((val: number[]) => {
        this.filterColumns.locationIds.dataSource = [];

        if (val?.length) {
          const regionLocations: OrganizationLocation[] = [];
          const selectedRegions: OrganizationRegion[] = val.map((id) => {
            return this.regions.find((region) => region.id === id) as OrganizationRegion;
          });

          selectedRegions.forEach((region: OrganizationRegion) => {
            region?.locations?.forEach((location: OrganizationLocation) => {
              location.regionName = region.name;
            });
            regionLocations.push(...(region?.locations as []));
          });

          this.filterColumns.locationIds.dataSource = sortByField(regionLocations, 'name');
        } else {
          this.formGroup.get('locationIds')?.setValue([]);
          this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns, this.datePipe);
        }

        this.cdr.markForCheck();
      });

    this.formGroup.get('locationIds')?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((val: number[]) => {
        this.filterColumns.departmentIds.dataSource = [];

        if (val?.length) {
          const locationDepartments: OrganizationDepartment[] = [];
          const selectedLocations: OrganizationLocation[] = val.map((id) => {
            return (this.filterColumns.locationIds.dataSource as OrganizationLocation[])
              .find((location: OrganizationLocation) => location.id === id) as OrganizationLocation;
          });

          selectedLocations.forEach((location: OrganizationLocation) => {
            locationDepartments.push(...(location?.departments as []));
          });

          this.filterColumns.departmentIds.dataSource = sortByField(locationDepartments, 'name');
        } else {
          this.formGroup.get('departmentIds')?.setValue([]);
          this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns, this.datePipe);
        }

        this.cdr.markForCheck();
      });
  }

  private checkForNavigatedInvoice(): void {
    const param: string | undefined = this.route.snapshot.queryParams['invoiceId'];
    if (param) {
      this.formGroup.get('formattedInvoiceIds')?.patchValue(param);

      this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns, this.datePipe);
      this.appliedFiltersAmount.emit(this.filteredItems.length);
      this.removeQueryParams();
    }
  }

  private removeQueryParams(): void {
    if (this.route.snapshot.queryParams['invoiceId']) {
      this.invoicesService.removeQueryParams();
    }
  }

  private getOrganizationStructure(): Observable<OrganizationStructure | null> {
    return this.isAgency ? this.selectedOrgStructure$ : this.organizationStructure$;
  }

  private applyPreservedFilters(): void {
    this.getOrganizationStructure()
      .pipe(
        filter(Boolean),
        debounceTime(150),
        switchMap(() => this.preservedFiltersByPageName$),
        filter(({ dispatch }) => dispatch),
        take(1)
      )
      .subscribe(({ state }) => {
        const filter = this.filterService.composeFilterState(this.filtersFormConfig, state as Record<string, unknown>);
        this.formGroup.reset();
        this.invoicesFiltersService.patchFormValue(this.formGroup, filter);
        this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns, this.datePipe);
        this.appliedFiltersAmount.emit(this.filteredItems.length);
      });
  }

  private getPageName(): FilterPageName {
    if (this.isAgency) {
      return FilterPageName.InvoicesVMSAgency;
    } else {
      return FilterPageName.InvoicesVMSOrganization;
    }
  }
}
