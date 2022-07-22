import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { Store } from '@ngxs/store';
import { isEqual } from 'lodash';
import { DeleteEventArgs } from '@syncfusion/ej2-angular-buttons';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { FilteredItem } from '@shared/models/filter.model';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { ResizeObserverModel, ResizeObserverService } from '@shared/services/resize-observer.service';
import { FilterKeys } from 'src/app/dashboard/constants/filter-keys';
import { DashboardFiltersModel, FilterName, FilterColumn } from 'src/app/dashboard/models/dashboard-filters.model';
import { SetFilteredItems } from 'src/app/dashboard/store/dashboard.actions';

@Component({
  selector: 'app-filter-chip-list',
  templateUrl: './filter-chip-list.component.html',
  styleUrls: ['./filter-chip-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterChipListComponent extends DestroyableDirective implements AfterViewInit, OnChanges, OnDestroy {
  @Input() public items: FilteredItem[];
  @Input() public filterState: DashboardFiltersModel;
  @Input() public allRegions: OrganizationRegion[];

  @Output() private filterModified: EventEmitter<boolean> = new EventEmitter();

  @ViewChild('filterChips', { static: true }) private filterChipsContainer: ElementRef;
  @ViewChild('resize', { static: true }) private resizeContainer: ElementRef;

  private filteredItems: FilteredItem[];
  private regions: OrganizationRegion[] = [];
  private resizeObserver: ResizeObserverModel | null;

  public appliedFilters: Record<FilterName, FilteredItem[]>;
  public isCollapsed: boolean = false;
  public showMoreLessBtn: boolean = false;
  public chipList: any[] = [];

  constructor(private readonly store: Store, private readonly cdr: ChangeDetectorRef) {
    super();
  }

  ngAfterViewInit(): void {
    this.resizeObserver = ResizeObserverService.init(this.resizeContainer.nativeElement);
    this.resizeObserver.resize$.subscribe((data) => {
      const lastElementPosition = data[0].target.lastElementChild?.getBoundingClientRect().top;
      this.cdr.markForCheck();
      if (lastElementPosition && lastElementPosition === 142) {
        this.showMoreLessBtn = true;
      } else {
        this.showMoreLessBtn = false;
        this.isCollapsed = false;
        this.filterChipsContainer.nativeElement.style.height = '42px';
      }
    });
  }

  onCollapseExpandList(): void {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.filterChipsContainer.nativeElement.style.height = 'auto';
    } else {
      this.filterChipsContainer.nativeElement.style.height = '42px';
    }
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
        region.locations?.find((location: OrganizationLocation) => location.id === filteredItem.value)
      );
      const location = regions?.locations?.find((location: OrganizationLocation) => location.id === filteredItem.value);
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

    this.chipList = Object.entries(this.appliedFilters).flat(2);
  }

  public override ngOnDestroy(): void {
    this.resizeObserver?.detach();
  }
}
