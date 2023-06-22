import { DatePipe } from '@angular/common';
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
import { ActivatedRoute } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, Observable, combineLatest, debounceTime, switchMap, takeUntil, tap } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { SkillFilterOptionFields, filterOptionFields } from '@core/constants/filters-helper.constant';
import { FilterPageName } from '@core/enums';
import { Destroyable } from '@core/helpers';
import { CustomFormGroup, DataSourceItem, PreservedFiltersByPage } from '@core/interface';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { FilteredItem } from '@shared/models/filter.model';
import {
  OrganizationDepartment, OrganizationLocation, OrganizationRegion,
  OrganizationStructure,
} from '@shared/models/organization.model';
import { PageOfCollections } from '@shared/models/page.model';
import { FilterService } from '@shared/services/filter.service';
import { ShowFilterDialog } from 'src/app/store/app.actions';
import { AppState } from 'src/app/store/app.state';
import { ClearPageFilters } from 'src/app/store/preserved-filters.actions';
import { GetOrganizationStructure } from 'src/app/store/user.actions';
import { UserState } from '../../../../store/user.state';
import { InvoiceFiltersAdapter } from '../../adapters';
import { DetectFormConfigBySelectedType } from '../../constants';
import { InvoicesAgencyTabId, InvoicesOrgTabId, InvoicesTableFiltersColumns } from '../../enums';
import {
  InvoiceFilterColumns, InvoiceFilterFieldConfig, InvoiceRecord,
  InvoiceTabId,
  InvoicesFilterState,
} from '../../interfaces';
import { InvoicesFiltersService, InvoicesService } from '../../services';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoicesModel } from '../../store/invoices.model';
import { InvoicesState } from '../../store/state/invoices.state';
import { PreservedFiltersState } from 'src/app/store/preserved-filters.state';

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

  @Select(InvoicesState.invoiceFiltersColumns)
  private readonly invoiceFiltersColumns$: Observable<InvoiceFilterColumns>;

  @Select(AppState.getMainContentElement)
  public readonly targetElement$: Observable<HTMLElement | null>;

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
  public targetElement: HTMLElement | null = null;

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
    this.initFormGroup();
  }

  trackByFn: TrackByFunction<InvoiceFilterFieldConfig>
    = (_: number, item: InvoiceFilterFieldConfig): InvoicesTableFiltersColumns => item.field;

  ngOnInit(): void {
    this.initFiltersDataSources();
    this.initFiltersColumns();
    this.watchForOrganizationStructure();
    this.watchForControlsValueChanges();
    this.setFormGroupValidators();
    this.startFormGroupWatching();
    this.getAgencyOrgStructure();
    this.getFilterTargetElement();
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

  private initFiltersDataSources(): void {
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
        let orgwidgetmanualinvoice = JSON.parse(localStorage.getItem('orgmanualinvoicewidget') || '""') as string;
        this.initManualPendingFiltersDataSources(id);
        if(orgwidgetmanualinvoice != ''){
          this.clearAllFilters(true)
        }
      } else {
        let orgwidgetpendinginvoice = JSON.parse(localStorage.getItem('pendingInvoiceApproval') || '""') as string;
        this.store.dispatch(new Invoices.GetFiltersDataSource(orgId));
        if(orgwidgetpendinginvoice != ''){
          this.clearAllFilters(true)
        }
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
    this.invoiceFiltersColumns$.pipe(
      filter((columns) => !!columns),
      tap((filters: InvoiceFilterColumns) => {
        this.filterColumns = { ...filters };
        this.filterColumns.regionIds.dataSource = this.regions;
        this.initFormConfig();
      }),
      switchMap(() => this.getOrganizationStructure()),
      filter((structure) => !!structure),
      switchMap(() => this.preservedFiltersByPageName$),
      filter((filters) => !!filters),
      debounceTime(200),

      takeUntil(this.componentDestroy())
    )
      .subscribe((filters) => {
        this.applyPreservedFilters(filters?.state || {});

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

  private applyPreservedFilters(filters: InvoicesFilterState): void {
    const filteredStructure = this.invoicesFiltersService.compareStructureWithFilter(
      filters,
      this.regions,
      this.isAgency
    );
    
    const filterState: Partial<InvoicesFilterState> = this.filterService.composeFilterState(
      this.filtersFormConfig,
      filteredStructure as Record<string, unknown>
    );

    this.formGroup.reset();
    this.invoicesFiltersService.setCurrentTimezone(filterState);

    this.formGroup.patchValue({
      ...JSON.parse(JSON.stringify(filterState)),
    });

    if (filterState.formattedInvoiceIds && Array.isArray(filterState.formattedInvoiceIds)) {
      this.formGroup.patchValue({
        formattedInvoiceIds: InvoiceFiltersAdapter.adaptFormatedIds(filterState.formattedInvoiceIds),
      });
    }

    this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns);
    this.appliedFiltersAmount.emit(this.filteredItems.length);
  }

  private getPageName(): FilterPageName {
    if (this.isAgency) {
      return FilterPageName.InvoicesVMSAgency;
    } else {
      return FilterPageName.InvoicesVMSOrganization;
    }
  }

  private getAgencyOrgStructure(): void {
    if (!this.isAgency) {
      this.store.dispatch(new GetOrganizationStructure());
    }
  }

  private getFilterTargetElement(): void {
    this.targetElement$
      .pipe(
        filter((el) => !!el),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((el: HTMLElement | null) => {
        this.targetElement = el;
        this.cdr.detectChanges();
      });
  }
}
