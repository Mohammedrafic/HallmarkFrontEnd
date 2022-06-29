import { ORG_ID_STORAGE_KEY, AGENCY_ID_STORAGE_KEY } from './../../../../shared/constants/local-storage-keys';
import { BusinessUnitType } from './../../../../shared/enums/business-unit-type';
import { map, switchMap } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';

import { Observable, takeUntil, tap, throttleTime } from 'rxjs';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

import { BaseObservable, Destroyable } from '@core/helpers';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';

import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { ITabConfigInterface } from '../../interface';
import { exportOptions, TAB_ADMIN_TIMESHEETS } from '../../constants';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { TimeSheetsPage } from '../../store/model/timesheets.model';
import { DialogAction, ExportType, TimesheetsTableColumns } from '../../enums';
import { IFilterColumns, ITimesheetsFilter } from '../../interface';
import { TimesheetsService } from '../../services/timesheets.service';
import { filterOptionFields } from '../../constants';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { DemoService } from '../../services/demo.service';
import { UserState } from 'src/app/store/user.state';
import { User } from '@shared/models/user.model';
import { Router } from '@angular/router';

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

  public tabConfig: ITabConfigInterface[] = TAB_ADMIN_TIMESHEETS;
  public formGroup: FormGroup;
  public exportOptions: ItemModel[] = exportOptions;
  public filterOptionFields = filterOptionFields;
  public filterColumns: IFilterColumns;
  public filteredItems: FilteredItem[] = [];
  public filters: ITimesheetsFilter;
  public currentSelectedTableRowIndex: Observable<number>
    = this.timesheetsService.getStream();
  public pageSize = 30;

  private pageNumberSubj: BaseObservable<number> = new BaseObservable<number>(1);
  isAgency: boolean;

  constructor(
    private store: Store,
    private filterService: FilterService,
    private timesheetsService: TimesheetsService,
    private demoService: DemoService,
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
    this.startPageStateWatching();

    this.timesheets$.subscribe((data) => {
      console.log(data)
    })
  }

  public handleChangeTab(tabIndex: number): void {
    switch (tabIndex) {
      case 0: {
        this.pageSize = 30;
        this.pageNumberSubj.set(1);

        break;
      }
      case 1: {
        console.log(1);
        break;
      }
      case 2: {
        console.log(2);
        break;
      }
      case 3: {
        console.log(2);
        break;
      }
    }
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

  public rowSelected(rowIndex: number): void {
    this.timesheetsService.setCurrentSelectedIndexValue(rowIndex);
    this.store.dispatch(new Timesheets.ToggleProfileDialog(DialogAction.Open, 12));
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
    this.store.dispatch(new Timesheets.GetAll(Object.assign({}, this.filters, {
      pageNumber: this.pageNumberSubj.get(),
      pageSize: this.pageSize,
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
}
