import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { Store, Actions, ofActionDispatched, Select } from '@ngxs/store';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { FilteredItem } from '@shared/models/filter.model';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { DeleteEventArgs } from '@syncfusion/ej2-angular-buttons';
import { isEqual } from 'lodash';
import { Observable, map, distinctUntilChanged, takeUntil, combineLatest, filter } from 'rxjs';
import { ShowFilterDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { FilterKeys } from '../constants/filter-keys';
import { WidgetTypeEnum } from '../enums/widget-type.enum';
import { DashboardFiltersModel, FilterColumn, FilterName } from '../models/dashboard-filters.model';
import { WidgetOptionModel } from '../models/widget-option.model';
import { WidgetToggleModel } from '../models/widget-toggle.model';
import { SetFilteredItems } from '../store/dashboard.actions';
import { DashboardState } from '../store/dashboard.state';
import { WidgetFilterComponent } from './components/widget-filter/widget-filter.component';

@Component({
  selector: 'app-dashboard-control',
  templateUrl: './dashboard-control.component.html',
  styleUrls: ['./dashboard-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardControlComponent extends DestroyableDirective implements OnInit {
  @Input() public isLoading: boolean | null;
  @Input() public selectedWidgets: WidgetTypeEnum[] | null;
  @Input() public widgets: WidgetOptionModel[] | null;
  @Input() public hasOrderManagePermission: boolean;
  @Input() public hasWidgetPermission: boolean;

  @Output() public widgetToggleEmitter: EventEmitter<WidgetToggleModel> = new EventEmitter();

  @ViewChild('filter') private readonly filter: WidgetFilterComponent; 

  @Select(DashboardState.filteredItems) public readonly filteredItems$: Observable<FilteredItem[]>;
  @Select(UserState.organizationStructure) private readonly organizationStructure$: Observable<OrganizationStructure>;
  @Select(DashboardState.dashboardFiltersState)
  private readonly dashboardFiltersState$: Observable<DashboardFiltersModel>;

  private regions: OrganizationRegion[] = [];
  private filteredItems: FilteredItem[];
  private filterState: DashboardFiltersModel;

  public readonly isDialogOpened$: Observable<boolean> = this.isDialogOpened();
  public appliedFilters: Record<FilterName, FilteredItem[]>;

  constructor(
    private readonly actions: Actions,
    private readonly store: Store,
    private readonly router: Router,
  ) {
    super();
  }

  ngOnInit(): void {
    this.toPutInOrderFilters();
    this.filterDataLoadHandler();
  }

  public toggleDialog(isDialogShown: boolean): void {
    this.store.dispatch(new ShowSideDialog(isDialogShown));
  }

  public showFilterDialog(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  private isDialogOpened(): Observable<boolean> {
    return this.actions.pipe(ofActionDispatched(ShowSideDialog)).pipe(
      map((payload: ShowSideDialog) => payload.isDialogShown),
      distinctUntilChanged()
    );
  }

  public onCreateOrder(): void {
    this.router.navigateByUrl('/client/order-management/add');
  }

  private toPutInOrderFilters(): void {
    this.filteredItems$.pipe(takeUntil(this.destroy$)).subscribe((filters) => {
      this.appliedFilters = {} as Record<FilterName, FilteredItem[]>;

      filters.forEach((filter: FilteredItem) => {
        const filterKey: FilterName = FilterKeys[filter.column as FilterColumn];
        if (filterKey in this.appliedFilters) {
          this.appliedFilters[filterKey].push(filter);
        } else {
          this.appliedFilters[filterKey] = [filter];
        }
      });
    });
  }

  public deleteChip(event: DeleteEventArgs): void {
    if(!this.filteredItems) return;

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
      const regions = this.regions.find((region) => region.locations?.find((location) => location.id === filteredItem.value));
      const location = regions?.locations?.find((location) => location.id === filteredItem.value);
      this.manageDashboardFilter('locationIds', location.id);

      location.departments.forEach((department: OrganizationDepartment) => this.manageDashboardFilter('departmentsIds', department.id));
    } else {
      this.filteredItems = this.filteredItems.filter((filter: FilteredItem) => !isEqual(filter, event.data));
    }
    this.store.dispatch(new SetFilteredItems(this.filteredItems));
    this.filter.getFilterState();
  }

  private filterDataLoadHandler(): void {
    combineLatest([this.filteredItems$, this.organizationStructure$, this.dashboardFiltersState$])
      .pipe(
        takeUntil(this.destroy$),
        filter(([items, orgs, filters]) => !!items && !!orgs&&!!filters),
        map(([items, orgs, filters]) => [items, orgs.regions, filters]),
        distinctUntilChanged((previous, current) => isEqual(previous, current))
      )
      .subscribe(([items, regions, filters]) => {
        this.filteredItems = items as FilteredItem[];
        this.regions = regions as OrganizationRegion[];
        this.filterState = filters as DashboardFiltersModel;
      });
  }

  private manageDashboardFilter(column: FilterColumn, id: number): void {
    if (this.filterState[column]?.includes(id)) {
      const filteredItem = this.filteredItems.find((item) => item.column === column && item.value === id);
      this.filteredItems = this.filteredItems.filter((item) => !isEqual(item, filteredItem));
    }
  }

  public onClearFilters(): void {
    this.store.dispatch(new SetFilteredItems([]));
    this.filter.getFilterState();
  }
}
