import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Store, Actions, ofActionDispatched, Select } from '@ngxs/store';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { FilteredItem } from '@shared/models/filter.model';
import { Observable, map, distinctUntilChanged, takeUntil } from 'rxjs';
import { ShowFilterDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { FilterKeys } from '../constants/filter-keys';
import { WidgetTypeEnum } from '../enums/widget-type.enum';
import { FilterColumn, FilterName } from '../models/dashboard-filters.model';
import { WidgetOptionModel } from '../models/widget-option.model';
import { WidgetToggleModel } from '../models/widget-toggle.model';
import { DashboardState } from '../store/dashboard.state';

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

  @Output() public widgetToggleEmitter: EventEmitter<WidgetToggleModel> = new EventEmitter();

  @Select(DashboardState.filteredItems) public readonly filteredItems$: Observable<FilteredItem[]>;

  public readonly isDialogOpened$: Observable<boolean> = this.isDialogOpened();
  public appliedFilters: Record<string, FilteredItem[]>;

  constructor(private readonly actions: Actions, private readonly store: Store, private readonly router: Router) {
    super();
  }

  ngOnInit(): void {
    this.toPutInOrderFilters();
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
      this.appliedFilters = {};

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
}
