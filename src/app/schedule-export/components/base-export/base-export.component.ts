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
  public scheduleFilters;
  employeesTitle = 'Employee';
  public dateList: DatesByWeekday[][];
  scheduleSlotsWithDate: string[];
  @ViewChild('scrollArea', { static: true }) scrollArea: ElementRef;
  activePeriod = DatesRangeType.TwoWeeks;
  monthPeriod = DatesRangeType.Month;
  regions: string[] = [];
  locations: string[] = [];
  departments: string[] = [];
  public orgName:string = 'Hallmark Healthcare';
  startDate: Date;

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
                this.startDate = Schedule_storage.startDate;
              }
  }

  trackByDatesRange: TrackByFunction<ScheduleInt.DateRangeOption> =
  (_: number, date: ScheduleInt.DateRangeOption) => date.dateText;

  trackByweekDays: TrackByFunction<WeekDays> = (_: number, date: WeekDays) => date;

  ngOnInit(): void {
    this.checkOrgPreferences();
    this.getHeaderInfo();
  }

  public getHeaderInfo():void {
    if(this.scheduleFilters){
      for(let i=0; i<this.scheduleFilters.length; i++){
        if(this.scheduleFilters[i].groupTitle === 'Region'){
          this.regions = this.scheduleFilters[i].data.reduce((combinedObj: string, obj: { value: any; }) => {
            if (combinedObj !== '') {
              combinedObj += ',';
            }
            return combinedObj + obj;
          }, '');
        }
        if(this.scheduleFilters[i].groupTitle === 'Location'){
          this.locations = this.scheduleFilters[i].data.reduce((combinedObj: string, obj: { value: any; }) => {
            if (combinedObj !== '') {
              combinedObj += ',';
            }
            return combinedObj + obj;
          }, '');
        }
        if(this.scheduleFilters[i].groupTitle === 'Department'){
          this.departments = this.scheduleFilters[i].data.reduce((combinedObj: string, obj: { value: any; }) => {
            if (combinedObj !== '') {
              combinedObj += ',';
            }
            return combinedObj + obj;
          }, '');
        }
      }
    }
  }
  ngAfterViewInit(): void {
      window.print();   
      localStorage.removeItem('Schedule_Export');
  }

  private checkOrgPreferences(): void {
    const preferences = this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences;
    this.orgFirstDayOfWeek = preferences?.weekStartsOn as number;
    this.monthRangeDays = GetMonthRange(this.orgFirstDayOfWeek ?? 0);
    this.cdr.markForCheck();
  }

  private setScheduleTable(scheduleData: ScheduleExport[]):void {
    const empSchedule = {
      employeeId : 0,
      schedules : [],
      workHours : 0
    }
      for(let i=0; i<scheduleData.length; i++){
        if(scheduleData[i].employeeSchedules == null){
          scheduleData[i].employeeSchedules = empSchedule;
        }
      }
      this.scheduleData = scheduleData;
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
