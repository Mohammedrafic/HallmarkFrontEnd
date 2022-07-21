import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Store } from '@ngxs/store';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { FilteredItem } from '@shared/models/filter.model';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { DeleteEventArgs } from '@syncfusion/ej2-angular-buttons';
import { isEqual } from 'lodash';
import { FilterKeys } from 'src/app/dashboard/constants/filter-keys';
import { DashboardFiltersModel, FilterName, FilterColumn } from 'src/app/dashboard/models/dashboard-filters.model';
import { SetFilteredItems } from 'src/app/dashboard/store/dashboard.actions';

@Component({
  selector: 'app-filter-chip-list',
  templateUrl: './filter-chip-list.component.html',
  styleUrls: ['./filter-chip-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterChipListComponent extends DestroyableDirective implements OnChanges {
  @Input() public items: FilteredItem[];
  @Input() public filterState: DashboardFiltersModel;
  @Input() public allRegions: OrganizationRegion[];

  @Output() private filterModified: EventEmitter<boolean> = new EventEmitter();

  private filteredItems: FilteredItem[];
  private regions: OrganizationRegion[] = [];

  public appliedFilters: Record<FilterName, FilteredItem[]>;

  constructor(private readonly store: Store) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    changes['items'] && this.toPutInOrderFilters(this.items);
    this.regions = this.allRegions;
    this.filteredItems = this.items;
  }

  public deleteChip(event: DeleteEventArgs): void {
    if (!this.filteredItems) return;

    const filteredItem = event.data as FilteredItem;

    if (filteredItem.column === 'regionIds') {
      const regions = [];
      regions.push(this.regions.find((region: OrganizationRegion) => region.id === filteredItem.value));

      regions.forEach((region: OrganizationRegion | undefined) => {
        if (region?.id && region.id === filteredItem.value) {
          this.manageDashboardFilter('regionIds', region.id);

          region.locations?.forEach((location: OrganizationLocation) => {
            this.manageDashboardFilter('locationIds', location.id);

            location.departments.forEach((department: OrganizationDepartment) => {
              this.manageDashboardFilter('departmentsIds', department.id);
            });
          });
        }
      });
    } else if (filteredItem.column === 'locationIds') {
      const regions = this.regions.find((region) =>
        region.locations?.find((location) => location.id === filteredItem.value)
      );
      const location = regions?.locations?.find((location) => location.id === filteredItem.value);
      this.manageDashboardFilter('locationIds', location.id);

      location.departments.forEach((department: OrganizationDepartment) =>
        this.manageDashboardFilter('departmentsIds', department.id)
      );
    } else {
      this.filteredItems = this.filteredItems.filter((filter: FilteredItem) => !isEqual(filter, event.data));
    }
    this.store.dispatch(new SetFilteredItems(this.filteredItems));
    this.filterModified.emit(true);
  }

  private manageDashboardFilter(column: FilterColumn, id: number): void {
    if (this.filterState[column]?.includes(id)) {
      const filteredItem = this.filteredItems.find((item) => item.column === column && item.value === id);
      this.filteredItems = this.filteredItems.filter((item) => !isEqual(item, filteredItem));
    }
  }

  public onClearFilters(): void {
    this.store.dispatch(new SetFilteredItems([]));
    this.filterModified.emit(true);
  }

  private toPutInOrderFilters(filters: FilteredItem[]): void {
    this.appliedFilters = {} as Record<FilterName, FilteredItem[]>;

    filters.forEach((filter: FilteredItem) => {
      const filterKey: FilterName = FilterKeys[filter.column as FilterColumn];
      if (filterKey in this.appliedFilters) {
        this.appliedFilters[filterKey].push(filter);
      } else {
        this.appliedFilters[filterKey] = [filter];
      }
    });
  }
}
