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
import { ClearPageFilters, SaveFiltersByPageName } from '../../../../store/preserved-filters.actions';
import { ShowFilterDialog } from '../../../../store/app.actions';
import { FiltersColumnConfig, OpenJobFilter, OpenJobFilterConfig } from '../../interfaces';
import { FilterColumns, OpenJobConfig, OptionFields } from './constants/job-filter.constant';
import { JobFilterService } from '../../services';

@Component({
  selector: 'app-job-filters',
  templateUrl: './job-filters.component.html',
  styleUrls: ['./job-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobFiltersComponent implements OnInit {
  @Input() public countItems: number | undefined;

  @Output() readonly destroyFilterDialog: EventEmitter<void> = new EventEmitter<void>();
  @Output() readonly appliedFiltersAmount: EventEmitter<number> = new EventEmitter<number>();

  public openJobFilterForm: FormGroup;
  public filterColumns: FiltersColumnConfig = FilterColumns;
  public filteredItems: FilteredItem[] = [];

  public readonly optionFields: FieldSettingsModel = OptionFields;
  public readonly openJobConfig: OpenJobFilterConfig[] = OpenJobConfig;
  public readonly fieldTypes = FieldType;

  private filters: OpenJobFilter;

  constructor(
    private store: Store,
    private jobFilterService: JobFilterService,
    private filterService: FilterService,
    private cdr: ChangeDetectorRef
  ) {
    this.initFilterForm();
  }

  ngOnInit(): void {
    this.watchForFilters();
  }

  public deleteFilter(event: FilteredItem): void {
    this.filterService.removeValue(event, this.openJobFilterForm, this.filterColumns);
    this.cdr.markForCheck();
  }

  public clearAllFilters(): void {
    this.store.dispatch(new ClearPageFilters(FilterPageName.EmployeeOpenJobs));
    this.openJobFilterForm.reset();
    this.filteredItems = [];
    this.filters = this.openJobFilterForm.getRawValue();
    this.setFilters();
    this.appliedFiltersAmount.emit(this.filteredItems.length);
  }

  public applyFilter(): void {
    if (this.openJobFilterForm.valid) {
      this.setFilteredItems();
      this.setFilters();
      this.store.dispatch([
        new ShowFilterDialog(false),
        new SaveFiltersByPageName(FilterPageName.EmployeeOpenJobs, this.filters),
      ]);
      this.destroyFilterDialog.next();
    } else {
      this.openJobFilterForm.markAllAsTouched();
    }
  }

  public closeFilterDialog(): void {
    this.destroyFilterDialog.next();
  }

  private initFilterForm(): void {
    this.openJobFilterForm = this.jobFilterService.createFilterForm();
  }

  private watchForFilters(): void {
    const { orderType } = this.jobFilterService.getFilters();

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
    this.jobFilterService.setFilters(this.filters);
  }
}
