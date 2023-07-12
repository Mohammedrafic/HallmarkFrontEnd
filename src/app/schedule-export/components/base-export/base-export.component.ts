import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, TrackByFunction, ElementRef, ViewChild, Renderer2, Inject } from '@angular/core';
import { DateTimeHelper } from '@core/helpers/date-time.helper';
import { Store } from '@ngxs/store';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { WeekDays } from '@shared/enums/week-days.enum';
import { GetMonthRange } from 'src/app/modules/schedule/helpers/schedule.helper';
import { ScheduleItemsService } from 'src/app/modules/schedule/services/schedule-items.service';
import * as ScheduleInt from 'src/app/modules/schedule/interface/index';
import { ScheduleGridService } from 'src/app/modules/schedule/components/schedule-grid/schedule-grid.service';
import { DatesRangeType } from '@shared/enums/week-range.enum';
import { DatesByWeekday, ScheduleExport } from 'src/app/modules/schedule/interface/index';
import { GlobalWindow } from '@core/tokens';

@Component({
  selector: 'app-base-export',
  templateUrl: './base-export.component.html',
  styleUrls: ['./base-export.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BaseExportComponent implements OnInit {
  scheduleData : ScheduleExport[];
  datesRanges: ScheduleInt.DateRangeOption[] = this.scheduleItemsService
  .createRangeOptions(DateTimeHelper.getDatesBetween());
  orgFirstDayOfWeek: number;
  monthRangeDays: WeekDays[] = [];
  scheduleFilters: ScheduleInt.ScheduleFilters;
  employeesTitle = 'Employee';
  public dateList: DatesByWeekday[][];
  scheduleSlotsWithDate: string[];
  @ViewChild('scrollArea', { static: true }) scrollArea: ElementRef;
  activePeriod = DatesRangeType.TwoWeeks;
  monthPeriod = DatesRangeType.Month;

  constructor(
              private store: Store,
              private scheduleGridService: ScheduleGridService,
              private scheduleItemsService: ScheduleItemsService,
              @Inject(GlobalWindow) protected readonly globalWindow : WindowProxy & typeof globalThis,
              private cdr : ChangeDetectorRef) { 
              const Schedule_storage = JSON.parse((this.globalWindow.localStorage.getItem('Schedule_Export') || ''));   
              if(Schedule_storage != ''){
                this.setScheduleTable(Schedule_storage.data);
                this.setDateSchedule(Schedule_storage.dateRange);
                this.scheduleFilters = Schedule_storage.scheduleFilters;
                this.activePeriod = Schedule_storage.activePeriod;
              }
  }

  trackByDatesRange: TrackByFunction<ScheduleInt.DateRangeOption> =
  (_: number, date: ScheduleInt.DateRangeOption) => date.dateText;

  trackByweekDays: TrackByFunction<WeekDays> = (_: number, date: WeekDays) => date;

  ngOnInit(): void {
    this.checkOrgPreferences();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      window.print();   
    },5000)
  }

  private checkOrgPreferences(): void {
    const preferences = this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences;
    this.orgFirstDayOfWeek = preferences?.weekStartsOn as number;
    this.monthRangeDays = GetMonthRange(this.orgFirstDayOfWeek ?? 0);
    this.cdr.markForCheck();
  }

  private setScheduleTable(scheduleData: ScheduleExport[]):void {
      this.scheduleData = scheduleData.filter(schedules => schedules.employeeSchedules && schedules.employeeSchedules !== null);
      this.employeesTitle = scheduleData?.length && scheduleData.length > 1 ? 'Employees' : 'Employee';
  
      if(scheduleData) {
        this.scheduleSlotsWithDate = this.scheduleGridService.getSlotsWithDateforExport(scheduleData);
      }
      this.cdr.markForCheck();
  }

  private setDateSchedule(dateRanges: ScheduleInt.DateRangeOption[]): void {
    this.datesRanges = dateRanges;
  }

}
