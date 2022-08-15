import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Store, Actions, ofActionDispatched, Select } from '@ngxs/store';
import { Observable, map, distinctUntilChanged, takeUntil } from 'rxjs';

import { ShowFilterDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { WidgetTypeEnum } from '../enums/widget-type.enum';
import { WidgetOptionModel } from '../models/widget-option.model';
import { WidgetToggleModel } from '../models/widget-toggle.model';
import { DashboardState } from '../store/dashboard.state';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { FilteredItem } from '@shared/models/filter.model';
import { OrganizationStructure } from '@shared/models/organization.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { AllOrganizationsSkill } from '../models/all-organization-skill.model';
import { FilterName } from '../models/dashboard-filters.model';
import { FilterKeys } from '../constants/filter-keys';
import { FilterColumnTypeEnum } from '../enums/dashboard-filter-fields.enum';

@Component({
  selector: 'app-dashboard-control',
  templateUrl: './dashboard-control.component.html',
  styleUrls: ['./dashboard-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardControlComponent extends DestroyableDirective implements OnInit{
  @Input() public isLoading: boolean | null;
  @Input() public selectedWidgets: WidgetTypeEnum[] | null;
  @Input() public widgets: WidgetOptionModel[] | null;
  @Input() public hasOrderManagePermission: boolean;
  @Input() public hasWidgetPermission: boolean;
  @Input() public allOrganizations: Organisation[];
  @Input() public userIsAdmin: boolean;
  @Input() public skills: AllOrganizationsSkill[];

  @Output() public widgetToggleEmitter: EventEmitter<WidgetToggleModel> = new EventEmitter();

  @Select(DashboardState.filteredItems) public readonly filteredItems$: Observable<FilteredItem[]>;
  @Select(UserState.organizationStructure) public readonly organizationStructure$: Observable<OrganizationStructure>;

  public readonly isDialogOpened$: Observable<boolean> = this.isDialogOpened();
  public orderedFilters: Record<FilterName, FilteredItem[]>;

  constructor(
    private readonly actions: Actions,
    private readonly store: Store,
    private readonly router: Router
    ) {
    super();
  }

  public ngOnInit(): void {
    this.filteredItems$.pipe(takeUntil(this.destroy$)).subscribe((filters) => this.toPutInOrderFilters(filters));
  }

  private isDialogOpened(): Observable<boolean> {
    return this.actions.pipe(ofActionDispatched(ShowSideDialog)).pipe(
      map((payload: ShowSideDialog) => payload.isDialogShown),
      distinctUntilChanged()
    );
  }

  public toggleDialog(isDialogShown: boolean): void {
    this.store.dispatch(new ShowSideDialog(isDialogShown));
  }

  public showFilterDialog(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onCreateOrder(): void {
    this.router.navigateByUrl('/client/order-management/add');
  }

  private toPutInOrderFilters(filters: FilteredItem[]): void {
    this.orderedFilters = {} as Record<FilterName, FilteredItem[]>;
    filters.forEach((filter: FilteredItem) => {
      const filterKey: FilterName = FilterKeys[filter.column as FilterColumnTypeEnum];
      if (filterKey in this.orderedFilters) {
        this.orderedFilters[filterKey].push(filter);
      } else {
        this.orderedFilters[filterKey] = [filter];
      }
    });
  }
}
