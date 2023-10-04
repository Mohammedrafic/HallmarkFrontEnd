import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Store } from '@ngxs/store';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import { FieldType, FilterPageName } from '@core/enums';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { ClearPageFilters, SaveFiltersByPageName } from 'src/app/store/preserved-filters.actions';
import { ShowFilterDialog } from 'src/app/store/app.actions';

import { FilterColumns, MyJobsConfig, OptionFields } from './constants/my-jobs-filter.constant';
import { MyJobsFilterService } from '../../services/my-jobs-filter.service';
import { FiltersColumnConfig, OpenJobFilter, OpenJobFilterConfig } from '../../interfaces';

@Component({
  selector: 'app-my-jobs-filter',
  templateUrl: './my-jobs-filter.component.html',
  styleUrls: ['./my-jobs-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyJobsFilterComponent implements OnInit {
  @Input() public countItems: number | undefined;

  @Output() readonly destroyFilterDialog: EventEmitter<void> = new EventEmitter<void>();
  @Output() readonly appliedFiltersAmount: EventEmitter<number> = new EventEmitter<number>();

  openJobFilterForm: FormGroup;
  filterColumns: FiltersColumnConfig = FilterColumns;
  filteredItems: FilteredItem[] = [];

  readonly optionFields: FieldSettingsModel = OptionFields;
  readonly openJobConfig: OpenJobFilterConfig[] = MyJobsConfig;
  readonly fieldTypes = FieldType;

  private filters: OpenJobFilter;

  constructor(
    private store: Store,
    private myJobsFilterService: MyJobsFilterService,
    private filterService: FilterService,
    private cdr: ChangeDetectorRef
  ) {
    this.initFilterForm();
  }

  ngOnInit(): void {
    this.watchForFilters();
  }

  deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.openJobFilterForm, this.filterColumns);
    this.cdr.markForCheck();
  }

  clearAllFilters(): void {
    this.store.dispatch(new ClearPageFilters(FilterPageName.EmployeeOpenJobs));
    this.openJobFilterForm.reset();
    this.filteredItems = [];
    this.filters = this.openJobFilterForm.getRawValue();
    this.setFilters();
    this.appliedFiltersAmount.emit(this.filteredItems.length);
  }

  applyFilter(): void {
    if (this.openJobFilterForm.valid) {
      this.setFilteredItems();
      this.setFilters();
      this.store.dispatch([
        new ShowFilterDialog(false),
        new SaveFiltersByPageName(FilterPageName.EmployeeMyJobs, this.filters),
      ]);
      this.destroyFilterDialog.next();
    } else {
      this.openJobFilterForm.markAllAsTouched();
    }
  }

  closeFilterDialog(): void {
    this.destroyFilterDialog.next();
  }

  private initFilterForm(): void {
    this.openJobFilterForm = this.myJobsFilterService.createFilterForm();
  }

  private watchForFilters(): void {
    const { orderType } = this.myJobsFilterService.getFilters();

    if (orderType !== undefined && orderType !== null) {
      this.openJobFilterForm.get('orderType')?.patchValue(orderType);
      this.setFilteredItems();
    }
  }

  private setFilteredItems(): void {
    this.filters = this.openJobFilterForm.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.openJobFilterForm, this.filterColumns);
    this.appliedFiltersAmount.emit(this.filteredItems.length);
  }

  private setFilters(): void {
    this.myJobsFilterService.setFilters(this.filters);
  }
}
