import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TrackByFunction,
} from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { Observable, switchMap, takeUntil } from 'rxjs';

import { DateTimeHelper, Destroyable } from '@core/helpers';
import { DateWeekService } from '@core/services';
import { GetOrganizationById } from '@organization-management/store/organization-management.actions';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { DatesRangeType } from '@shared/enums';

import { UserState } from '../../../../store/user.state';
import { DatesPeriods } from '../../constants/schedule-grid.conts';
import {
  ScheduleDateItem,
  ScheduleFilters,
  ScheduleItem,
  ScheduleModel,
  ScheduleModelPage,
} from '../../interface/schedule.model';

@Component({
  selector: 'app-schedule-grid',
  templateUrl: './schedule-grid.component.html',
  styleUrls: ['./schedule-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleGridComponent extends Destroyable implements OnInit {
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  @Input() scheduleData: ScheduleModelPage | null;

  @Output() changeFilter: EventEmitter<ScheduleFilters> = new EventEmitter<ScheduleFilters>();

  datesPeriods: ItemModel[] = DatesPeriods;

  activePeriod = DatesRangeType.TwoWeeks;

  weekPeriod: [Date, Date] = [new Date(), new Date()];

  datesRanges: string[] = DateTimeHelper.getDatesBetween();

  selectedScheduleCard: ScheduleItem | null = null;

  selectedDateSlot: string | null = null;

  selectedCandidateId: number;

  orgFirstDayOfWeek: number;

  constructor(
    private store: Store,
    private weekService: DateWeekService,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  trackByPeriods: TrackByFunction<ItemModel> = (_: number, period: ItemModel) => period.text;

  trackByDatesRange: TrackByFunction<string> = (_: number, date: string) => date;

  trackByScheduleData: TrackByFunction<ScheduleModel> = (_: number, scheduleData: ScheduleModel) => scheduleData.id;

  ngOnInit(): void {
    this.startOrgIdWatching();
    this.watchForRangeChange();
  }

  changeActiveDatePeriod(selectedPeriod: string | undefined): void {
    this.activePeriod = selectedPeriod as DatesRangeType;
    this.cdr.detectChanges();
  }

  selectScheduleCard(schedule: ScheduleDateItem, candidateId: number): void {
    this.selectedScheduleCard = schedule.daySchedules[0];
    this.selectedCandidateId = candidateId;
    this.selectedDateSlot = null;
    this.cdr.detectChanges();
  }

  selectDateSlot(dateSlot: string, candidateId: number): void {
    this.selectedDateSlot = dateSlot;
    this.selectedCandidateId = candidateId;
    this.selectedScheduleCard = null;
    this.cdr.detectChanges();
  }

  searchCandidate(event: KeyboardEvent): void {
    this.changeFilter.emit({ firstLastNameOrId: (event.target as HTMLInputElement).value });
  }

  private startOrgIdWatching(): void {
    this.organizationId$.pipe(
      switchMap((businessUnitId: number) => {
        const id = businessUnitId || this.store.selectSnapshot(UserState.user)?.businessUnitId as number;

        return this.store.dispatch(new GetOrganizationById(id));
      }),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.checkOrgPreferences();
    });
  }

  private checkOrgPreferences(): void {
    const preferences = this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences;
    this.orgFirstDayOfWeek = preferences?.weekStartsOn as number;

    this.cdr.markForCheck();
  }

  private watchForRangeChange(): void {
    this.weekService.getRangeStream().pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe(([startDate, endDate]: [string, string]) => {
      console.log([startDate, endDate], '[startDate, endDate]');
      this.datesRanges = DateTimeHelper.getDatesBetween(startDate, endDate);
      this.changeFilter.emit({ startDate, endDate });

      this.cdr.detectChanges();
    });
  }
}
