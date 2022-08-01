import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { Store } from '@ngxs/store';
import { isEqual } from 'lodash';
import { DeleteEventArgs } from '@syncfusion/ej2-angular-buttons';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { FilteredItem } from '@shared/models/filter.model';
import { OrganizationRegion } from '@shared/models/organization.model';
import { ResizeObserverModel, ResizeObserverService } from '@shared/services/resize-observer.service';
import { FilterKeys } from 'src/app/dashboard/constants/filter-keys';
import { DashboardFiltersModel, FilterName } from 'src/app/dashboard/models/dashboard-filters.model';
import { SetFilteredItems } from 'src/app/dashboard/store/dashboard.actions';
import { FilterColumnTypeEnum } from 'src/app/dashboard/enums/dashboard-filter-fields.enum';

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

  @ViewChild('resize', { static: true }) private resizeContainer: ElementRef<HTMLElement>;

  private filteredItems: FilteredItem[];
  private resizeObserver: ResizeObserverModel;

  public appliedFilters: Record<FilterName, FilteredItem[]>;
  public isCollapsed: boolean = false;
  public showMoreLessBtn: boolean = false;
  public chipList: any[] = [];

  constructor(private readonly store: Store, private readonly cdr: ChangeDetectorRef) {
    super();
  }

  public ngAfterViewInit(): void {
    this.resizeObserver = ResizeObserverService.init(this.resizeContainer.nativeElement);
    this.resizeObserver.resize$.subscribe((data) => {
      const lastElementPosition = data[0].target.lastElementChild?.getBoundingClientRect().top;
      this.cdr.markForCheck();
      if (lastElementPosition && lastElementPosition > 100) {
        this.showMoreLessBtn = true;
      } else {
        this.showMoreLessBtn = false;
        this.isCollapsed = false;
      }
    });
  }

  public onCollapseExpandList(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    changes['items'] && this.toPutInOrderFilters(this.items);
  }

  public deleteChip(event: DeleteEventArgs): void {
    const filteredItem = event.data as FilteredItem;
    this.cdr.markForCheck();

    if (filteredItem.column === FilterColumnTypeEnum.ORGANIZATION) {
      this.filteredItems = this.filteredItems.filter((item) => item.organizationId !== filteredItem.organizationId);
    } else if (filteredItem.column === FilterColumnTypeEnum.REGION) {
      this.filteredItems = this.filteredItems.filter(
        (item) => !(item.organizationId === filteredItem.organizationId && item.regionId === filteredItem.regionId));
    } else if (filteredItem.column === FilterColumnTypeEnum.LOCATION) {
      this.filteredItems = this.filteredItems.filter(
        (item) => !(item.organizationId === filteredItem.organizationId && item.locationId === filteredItem.locationId));
    } else {
      this.filteredItems = this.filteredItems.filter((filterItem: FilteredItem) => !isEqual(filterItem, filteredItem));
    }
    this.store.dispatch(new SetFilteredItems(this.filteredItems));
  }

  public onClearFilters(): void {
    this.store.dispatch(new SetFilteredItems([]));
  }

  private toPutInOrderFilters(filters: FilteredItem[]): void {
    this.appliedFilters = {} as Record<FilterName, FilteredItem[]>;
    this.filteredItems = filters;

    filters.forEach((filter: FilteredItem) => {
      const filterKey: FilterName = FilterKeys[filter.column as FilterColumnTypeEnum];
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
