import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { Store, Actions, ofActionDispatched, Select } from '@ngxs/store';
import { Observable, map, distinctUntilChanged } from 'rxjs';

import { ShowFilterDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { WidgetTypeEnum } from '../enums/widget-type.enum';
import { DashboardFiltersModel } from '../models/dashboard-filters.model';
import { WidgetOptionModel } from '../models/widget-option.model';
import { WidgetToggleModel } from '../models/widget-toggle.model';
import { DashboardState } from '../store/dashboard.state';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { FilteredItem } from '@shared/models/filter.model';
import { OrganizationStructure } from '@shared/models/organization.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { Skill } from '@shared/models/skill.model';

@Component({
  selector: 'app-dashboard-control',
  templateUrl: './dashboard-control.component.html',
  styleUrls: ['./dashboard-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardControlComponent extends DestroyableDirective {
  @Input() public isLoading: boolean | null;
  @Input() public selectedWidgets: WidgetTypeEnum[] | null;
  @Input() public widgets: WidgetOptionModel[] | null;
  @Input() public hasOrderManagePermission: boolean;
  @Input() public dashboardFiltersState: DashboardFiltersModel;
  @Input() public hasWidgetPermission: boolean;
  @Input() public allOrganizations: Organisation[];
  @Input() public userIsAdmin: boolean;
  @Input() public skills: Skill[];

  @Output() public widgetToggleEmitter: EventEmitter<WidgetToggleModel> = new EventEmitter();

  @Select(DashboardState.filteredItems) public readonly filteredItems$: Observable<FilteredItem[]>;
  @Select(UserState.organizationStructure) public readonly organizationStructure$: Observable<OrganizationStructure>;

  public readonly isDialogOpened$: Observable<boolean> = this.isDialogOpened();

  constructor(
    private readonly actions: Actions,
    private readonly store: Store,
    private readonly router: Router
    ) {
    super();
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
}
