import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { filter } from 'rxjs/operators';
import { Observable, of, switchMap, takeUntil, throttleTime } from 'rxjs';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';

import { Destroyable } from '@core/helpers';
import { User } from '@shared/models/user.model';
import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { TabConfig, TimesheetsFilterState, TimesheetsSelectedRowEvent } from '../../interface';
import { exportOptions, TAB_ADMIN_TIMESHEETS } from '../../constants';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { TimeSheetsPage } from '../../store/model/timesheets.model';
import { DialogAction, ExportType } from '../../enums';
import { TimesheetsService } from '../../services/timesheets.service';
import { Timesheets } from '../../store/actions/timesheets.actions';

@Component({
  selector: 'app-timesheets-container.ts',
  templateUrl: './timesheets-container.component.html',
  styleUrls: ['./timesheets-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetsContainerComponent extends Destroyable implements OnInit {
  @Select(TimesheetsState.timesheets)
  readonly timesheets$: Observable<TimeSheetsPage>;

  @Select(TimesheetsState.timesheetsFilters)
  readonly timesheetsFilters$!: Observable<TimesheetsFilterState>;

  @Select(UserState.user)
  readonly user$: Observable<User>;

  public readonly tabConfig: TabConfig[] = TAB_ADMIN_TIMESHEETS;
  public activeTabIdx = 0;
  public readonly exportOptions: ItemModel[] = exportOptions;
  public filters: TimesheetsFilterState | undefined;
  public readonly dateControl: FormControl = new FormControl(null);
  public readonly currentSelectedTableRowIndex: Observable<number>
    = this.timesheetsService.getStream();

  public isAgency: boolean;

  constructor(
    private store: Store,
    private timesheetsService: TimesheetsService,
    private cd: ChangeDetectorRef,
    private router: Router,
  ) {
    super();
    store.dispatch(new SetHeaderState({ iconName: 'clock', title: 'Timesheets' }));

    this.isAgency = this.router.url.includes('agency');
    this.store.dispatch(new Timesheets.UpdateFiltersState({ isAgency: this.isAgency }));
  }

  ngOnInit(): void {
    this.initTabsCount();
    this.startFiltersWatching();
    this.calcTabsChips();
  }

  public handleChangeTab(tabIndex: number): void {
    this.activeTabIdx = tabIndex;
    this.store.dispatch(new Timesheets.UpdateFiltersState({
      statusIds: this.tabConfig[tabIndex].value ?
        [`${this.tabConfig[tabIndex].value}`] :
        [],
    }));
  }

  public handleChangePage(page: number): void {
    this.store.dispatch(new Timesheets.UpdateFiltersState({ pageNumber: page }));
  }

  public handleChangePerPage(pageSize: number): void {
    this.store.dispatch(new Timesheets.UpdateFiltersState({ pageSize: pageSize }));
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

  public resetFilters(): void {
    this.store.dispatch(new Timesheets.UpdateFiltersState());
  }

  public updateTableByFilters(filters: any): void {
    this.store.dispatch(new Timesheets.UpdateFiltersState({ ...filters }));
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

  public sortHandler(event: string): void {
    this.store.dispatch(new Timesheets.UpdateFiltersState({ orderBy: event }));
  }

  private startFiltersWatching(): void {
    this.timesheetsFilters$.pipe(
      filter(Boolean),
      switchMap(() => this.store.dispatch(new Timesheets.GetAll())),
      takeUntil(this.componentDestroy()),
    ).subscribe();
  }

  private initTabsCount(): void {
    this.store.dispatch(new Timesheets.GetTabsCounts());
  }

  private calcTabsChips(): void {
    this.store.select(TimesheetsState.tabCounts)
    .pipe(
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
