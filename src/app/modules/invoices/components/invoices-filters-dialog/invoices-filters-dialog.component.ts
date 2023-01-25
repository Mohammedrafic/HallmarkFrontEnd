import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TrackByFunction,
} from '@angular/core';
import { Router } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import { debounceTime, Observable, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Destroyable, LeftOnlyValidValues } from '@core/helpers';
import { CustomFormGroup } from '@core/interface';
import { filterOptionFields } from '@core/constants/filters-helper.constant';
import { PageOfCollections } from '@shared/models/page.model';
import { FilterService } from '@shared/services/filter.service';
import { FilteredItem } from '@shared/models/filter.model';
import { ControlTypes } from '@shared/enums/control-types.enum';

import { InvoicesState } from '../../store/state/invoices.state';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoicesFiltersService } from '../../services/invoices-filters.service';
import {
  InvoiceFilterColumns,
  InvoiceFilterFieldConfig,
  InvoiceRecord,
  InvoicesFilterState,
  InvoiceTabId,
} from '../../interfaces';
import { DetectFormConfigBySelectedType } from '../../constants';
import { InvoicesTableFiltersColumns } from '../../enums';

@Component({
  selector: 'app-invoices-filters-dialog',
  templateUrl: './invoices-filters-dialog.component.html',
  styleUrls: ['./invoices-filters-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesFiltersDialogComponent extends Destroyable implements OnInit, OnChanges {
  @Select(InvoicesState.invoicesData)
  public invoicesData$: Observable<PageOfCollections<InvoiceRecord> | null>;

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
  public isAgency = false;

  constructor(
    private filterService: FilterService,
    private cdr: ChangeDetectorRef,
    private invoicesFiltersService: InvoicesFiltersService,
    private store: Store,
    private router: Router,
  ) {
    super();

    this.isAgency = this.router.url.includes('agency');
  }

  trackByFn: TrackByFunction<InvoiceFilterFieldConfig>
    = (_: number, item: InvoiceFilterFieldConfig): InvoicesTableFiltersColumns => item.field;

  ngOnInit(): void {
    this.initFiltersDataSources();
    this.initFormGroup();
    this.setFormGroupValidators();
    this.startFormGroupWatching();
    this.initFiltersColumns();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['selectedTabId'].firstChange) {
      this.clearAllFilters(false);
      this.initFormConfig();
    }
  }

  deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.formGroup, this.filterColumns);
    this.appliedFiltersAmount.emit(this.filteredItems.length);
  }

  clearAllFilters(eventEmmit = true): void {
    this.formGroup.reset();
    this.filteredItems = [];
    this.appliedFiltersAmount.emit(this.filteredItems.length);

    if (eventEmmit) {
      this.resetFilters.emit();
    }
  }

  applyFilters(): void {
    const filters: InvoicesFilterState = LeftOnlyValidValues(this.formGroup);

    if (filters.formattedInvoiceIds) {
      filters.formattedInvoiceIds = [this.formGroup.getRawValue().formattedInvoiceIds];
    }

    this.updateTableByFilters.emit(filters);
    this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns);
    this.appliedFiltersAmount.emit(this.filteredItems.length);
    this.cdr.detectChanges();
  }

  public initFiltersDataSources(): void {
    this.store.dispatch(new Invoices.GetFiltersDataSource());
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
    this.store.select(InvoicesState.invoiceFiltersColumns).pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy()),
    ).subscribe((filters: InvoiceFilterColumns) => {
      this.filterColumns = filters;

      this.initFormConfig();
      this.cdr.detectChanges();
    });
  }

  private initFormConfig(): void {
    this.filtersFormConfig = DetectFormConfigBySelectedType(this.selectedTabId, this.isAgency);
    this.cdr.detectChanges();
  }
}
