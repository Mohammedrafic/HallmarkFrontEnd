import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, EventEmitter, Input, OnChanges,
  OnInit, Output, SimpleChanges
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { Observable, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';

import { FilteredItem } from '@shared/models/filter.model';
import { Destroyable, leftOnlyValidValues } from '@core/helpers';
import { PageOfCollections } from '@shared/models/page.model';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { FilterService } from '@shared/services/filter.service';
import { DataSourceItem } from '@core/interface';

import { InvoicesState } from '../../store/state/invoices.state';
import { InvoiceFilterColumns, InvoiceRecord, InvoicesFilterState } from '../../interfaces';
import { InvoicesService } from '../../services';
import { InvoicesTableFiltersColumns } from '../../enums/invoices.enum';
import { Invoices } from '../../store/actions/invoices.actions';
import { invoicesFilterOptionFields } from '../../constants';
import { findSelectedItems } from '../../helpers/functions.helper';

@Component({
  selector: 'app-invoices-filters-dialog',
  templateUrl: './invoices-filters-dialog.component.html',
  styleUrls: ['./invoices-filters-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesFiltersDialogComponent extends Destroyable implements OnInit, OnChanges {
  @Select(InvoicesState.invoicesData)
  public invoicesData$: Observable<PageOfCollections<InvoiceRecord> | null>;

  @Input() activeTabIdx: number;

  @Output() readonly updateTableByFilters: EventEmitter<InvoicesFilterState> = new EventEmitter<InvoicesFilterState>();
  @Output() readonly resetFilters: EventEmitter<void> = new EventEmitter<void>();
  @Output() readonly appliedFiltersAmount: EventEmitter<number> = new EventEmitter<number>();

  public allRegions: OrganizationRegion[] = [];
  public orgRegions: OrganizationRegion[] = [];
  public filteredItems: FilteredItem[] = [];
  public formGroup: FormGroup;
  public filterOptionFields = invoicesFilterOptionFields;
  public filterColumns: InvoiceFilterColumns;

  constructor(
    private filterService: FilterService,
    private invoicesService: InvoicesService,
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.initFiltersColumns();
    this.startRegionsWatching();
    this.startLocationsWatching();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['activeTabIdx'].firstChange) {
      this.clearAllFilters(false);
    }
  }

  public deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.formGroup, this.filterColumns);
    this.appliedFiltersAmount.emit(this.filteredItems.length);
  }

  public clearAllFilters(eventEmmit = true): void {
    this.formGroup.reset();
    this.filteredItems = [];
    this.appliedFiltersAmount.emit(this.filteredItems.length);
    if (eventEmmit) {
      this.resetFilters.emit();
    }
  }

  public applyFilters(): void {
    const filters: InvoicesFilterState = leftOnlyValidValues(this.formGroup);

    this.updateTableByFilters.emit(filters);
    this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns);
    this.appliedFiltersAmount.emit(this.filteredItems.length);
  }


  private initFiltersColumns(): void {
    this.store.select(InvoicesState.invoiceFiltersColumns)
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy()),
      ).subscribe((filters) => {
      this.orgRegions = filters.regionsIds?.dataSource || [];
      this.allRegions = [...this.orgRegions];
      this.filterColumns = filters;
      this.cdr.detectChanges();
    });
  }

  private startRegionsWatching(): void {
    this.formGroup.get(InvoicesTableFiltersColumns.RegionsIds)?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((val: number[]) => {
        if (val?.length) {
          const selectedRegions: OrganizationRegion[] = findSelectedItems(val, this.orgRegions);

          const res: OrganizationLocation[] = [];
          selectedRegions.forEach(region => {
            region.locations?.forEach(location => location.regionName = region.name);
            res.push(...region.locations as []);
          });
          this.setDataSourceByFormKey(InvoicesTableFiltersColumns.LocationIds, res);
        } else {
          this.resetDataSourceAndChips(InvoicesTableFiltersColumns.LocationIds);
        }
      });
  }

  private startLocationsWatching(): void {
    this.formGroup.get(InvoicesTableFiltersColumns.LocationIds)?.valueChanges
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((locationIds: number[]) => {
        if (locationIds?.length) {
          const res: OrganizationDepartment[] = [];
          locationIds.forEach(id => {
            const selectedLocation = this.filterColumns.locationIds.dataSource.find((location: OrganizationLocation) => location.id === id);
            res.push(...selectedLocation?.departments as []);
          });
          this.setDataSourceByFormKey(InvoicesTableFiltersColumns.DepartmentIds, res);
        } else {
          this.resetDataSourceAndChips(InvoicesTableFiltersColumns.DepartmentIds);
        }
      });
  }

  private setDataSourceByFormKey(
    key: InvoicesTableFiltersColumns,
    source: DataSourceItem[] | OrganizationRegion[]
  ): void {
    this.store.dispatch(new Invoices.SetFiltersDataSource(key, source));
  }

  private resetDataSourceAndChips(key: InvoicesTableFiltersColumns): void {
    this.setDataSourceByFormKey(key, []);
    this.formGroup.get(key)?.setValue([]);
    if (this.filteredItems.length) {
      this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns);
    }
    this.appliedFiltersAmount.emit(this.filteredItems.length);
  }

  private initFormGroup(): void {
    this.formGroup = this.invoicesService.createForm();
  }
}
