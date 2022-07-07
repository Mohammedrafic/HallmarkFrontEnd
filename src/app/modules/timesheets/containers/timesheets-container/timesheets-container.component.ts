import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import { filter } from 'rxjs/operators';
import { Observable, takeUntil, throttleTime } from 'rxjs';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

import { BaseObservable, Destroyable } from '@core/helpers';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { User } from '@shared/models/user.model';

import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { TabConfig, Timesheet, TimesheetsFilterState, TimesheetsSelectedRowEvent } from '../../interface';
import { exportOptions, TAB_ADMIN_TIMESHEETS } from '../../constants';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { TimeSheetsPage } from '../../store/model/timesheets.model';
import { DialogAction, ExportType, TimesheetsTableColumns } from '../../enums';
import { IFilterColumns } from '../../interface';
import { TimesheetsService } from '../../services/timesheets.service';
import { filterOptionFields } from '../../constants';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { getTimesheetStatusFromIdx } from '../../helpers/functions';

@Component({
  selector: 'app-timesheets-container.ts',
  templateUrl: './timesheets-container.component.html',
  styleUrls: ['./timesheets-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsContainerComponent extends Destroyable implements OnInit {
  @Select(TimesheetsState.timesheets)
  timesheets$: Observable<TimeSheetsPage>;

  @Select(UserState.user)
  user$: Observable<User>;

  public tabConfig: TabConfig[] = TAB_ADMIN_TIMESHEETS;
  public formGroup: FormGroup;
  public exportOptions: ItemModel[] = exportOptions;
  public filterOptionFields = filterOptionFields;
  public filterColumns: IFilterColumns;
  public filteredItems: FilteredItem[] = [];
  public filters: TimesheetsFilterState;
  public currentSelectedTableRowIndex: Observable<number>
    = this.timesheetsService.getStream();
  public pageSize = 30;
  public currentTab = 0;

  public isAgency: boolean;

  private pageNumberSubj: BaseObservable<number> = new BaseObservable<number>(1);

  constructor(
    private store: Store,
    private filterService: FilterService,
    private timesheetsService: TimesheetsService,
    private cd: ChangeDetectorRef,
    private router: Router,
  ) {
    super();
    store.dispatch(new SetHeaderState({ iconName: 'clock', title: 'Timesheets' }));
    this.isAgency = this.router.url.includes('agency');
  }

  ngOnInit(): void {
    this.initFilterColumn();
    this.initFilterColumnDataSources();
    this.initFormGroup();
    this.initTabsCount();
    this.startPageStateWatching();
    this.calcTabsChips();
  }

  public handleChangeTab(tabIndex: number): void {
    this.currentTab = tabIndex;
    this.pageSize = 30;
    this.pageNumberSubj.set(1);
  }

  public handleChangePage(page: number): void {
    this.pageNumberSubj.set(page);
  }

  public handleChangePerPage(pageSize: number): void {
    this.pageSize = pageSize;
  }

  public exportSelected(event: any): void {
    if (event.item.properties.text === ExportType.Excel_file) {
    } else if (event.item.properties.text === ExportType.CSV_file) {
    } else if (event.item.properties.text === ExportType.Custom) {
    }
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.formGroup, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.formGroup.reset();
    this.filteredItems = [];
    this.pageNumberSubj.set(1);
  }

  public onFilterApply(): void {
    this.filters = this.formGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.formGroup, this.filterColumns);
    this.initTimesheets();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public rowSelected(selectedRow: TimesheetsSelectedRowEvent): void {
    this.timesheetsService.setCurrentSelectedIndexValue(selectedRow.rowIndex);
    this.store.dispatch(new Timesheets.ToggleCandidateDialog(DialogAction.Open, selectedRow.data.id));
    this.cd.markForCheck();
  }

  public onNextPreviousOrderEvent(next: boolean): void {
    this.timesheetsService.setNextValue(next);
    this.cd.markForCheck();
  }

  private startPageStateWatching(): void {
    this.pageNumberSubj.getStream()
      .pipe(throttleTime(100), takeUntil(this.componentDestroy())).subscribe(() => {
      this.initTimesheets();
    });
  }

  private initTimesheets(): void {
    this.store.dispatch(new Timesheets.GetAll(Object.assign(
      {},
      this.filters,
      {
        pageNumber: this.pageNumberSubj.get(),
        pageSize: this.pageSize,
        statusText: getTimesheetStatusFromIdx(this.currentTab),
    }), this.isAgency)).pipe(takeUntil(this.componentDestroy()));
  }

  private initFormGroup(): void {
    this.formGroup = this.timesheetsService.createForm();
  }

  private initFilterColumn(): void {
    this.filterColumns = this.timesheetsService.createFilterColumns();
  }

  private initFilterColumnDataSources(): void {
    this.filterColumns.statusText.dataSource = this.timesheetsService.setDataSources(TimesheetsTableColumns.StatusText);
    this.filterColumns.skillName.dataSource = this.timesheetsService.setDataSources(TimesheetsTableColumns.SkillName);
    this.filterColumns.departmentName.dataSource = this.timesheetsService.setDataSources(TimesheetsTableColumns.DepartmentName);
    this.filterColumns.agencyName.dataSource = this.timesheetsService.setDataSources(TimesheetsTableColumns.AgencyName);
  }

  private initTabsCount(): void {
    this.store.dispatch(new Timesheets.GetTabsCounts());
  }

  private calcTabsChips(): void {
    this.store.select(TimesheetsState.tabCounts).pipe(
      filter(Boolean),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((data) => {
      this.tabConfig[1].amount = data.pending;
      this.tabConfig[2].amount = data.missing;
      this.tabConfig[3].amount = data.rejected;
      this.cd.markForCheck();
    });
  }
}
