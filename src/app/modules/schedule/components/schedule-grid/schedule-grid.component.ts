import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  TrackByFunction,
  ViewChild,
} from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { debounceTime, fromEvent, Observable, switchMap, takeUntil, tap } from 'rxjs';
import { filter } from 'rxjs/operators';

import { DateTimeHelper, Destroyable } from '@core/helpers';
import { DateWeekService } from '@core/services';
import { GetOrganizationById } from '@organization-management/store/organization-management.actions';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { DatesRangeType } from '@shared/enums';

import { UserState } from '../../../../store/user.state';
import { DatesPeriods } from '../../constants/schedule-grid.conts';
import {
  ScheduleCandidate,
  ScheduleDateItem,
  ScheduleDateSlot,
  ScheduleFilters,
  ScheduleModel,
  ScheduleModelPage,
  ScheduleSelectedSlots,
} from '../../interface/schedule.model';
import { ScheduleGridAdapter } from '../../adapters/shedule-grid.adapter';

@Component({
  selector: 'app-schedule-grid',
  templateUrl: './schedule-grid.component.html',
  styleUrls: ['./schedule-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleGridComponent extends Destroyable implements OnInit, OnChanges {
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  @ViewChild('scrollArea', { static: true }) scrollArea: ElementRef;

  @Input() scheduleData: ScheduleModelPage | null;

  @Output() changeFilter: EventEmitter<ScheduleFilters> = new EventEmitter<ScheduleFilters>();
  @Output() loadMoreData: EventEmitter<number> = new EventEmitter<number>();
  @Output() selectedCells: EventEmitter<ScheduleSelectedSlots> = new EventEmitter<ScheduleSelectedSlots>();

  datesPeriods: ItemModel[] = DatesPeriods;

  activePeriod = DatesRangeType.TwoWeeks;

  weekPeriod: [Date, Date] = [new Date(), new Date()];

  datesRanges: string[] = DateTimeHelper.getDatesBetween();

  selectedCandidatesSlot: Map<number, ScheduleDateSlot> = new Map<number, ScheduleDateSlot>();

  orgFirstDayOfWeek: number;

  private itemsPerPage = 30;

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
    this.watchForScroll();
  }

  ngOnChanges(): void {
    this.selectedCandidatesSlot.clear();
  }

  changeActiveDatePeriod(selectedPeriod: string | undefined): void {
    this.activePeriod = selectedPeriod as DatesRangeType;
    this.cdr.detectChanges();
  }

  selectScheduleCard(schedule: ScheduleDateItem, candidate: ScheduleCandidate): void {}

  selectDateSlot(date: string, candidate: ScheduleCandidate): void {
    const candidateSelectedSlot = this.selectedCandidatesSlot.get(candidate.id);

    if (candidateSelectedSlot) {
      if (candidateSelectedSlot.dates.has(date)) {
        candidateSelectedSlot.dates.delete(date);
      } else {
        candidateSelectedSlot.dates.add(date);
      }
    } else {
      this.selectedCandidatesSlot.set(candidate.id, { candidate, dates: new Set<string>().add(date) });
    }

    this.selectedCells.emit(ScheduleGridAdapter.prepareSelectedCells(this.selectedCandidatesSlot));

    this.cdr.detectChanges();
  }

  searchCandidate(event: KeyboardEvent): void {
    this.changeFilter.emit({ firstLastNameOrId: (event.target as HTMLInputElement).value });
    this.scrollArea.nativeElement.scrollTo(0, 0);
  }

  private startOrgIdWatching(): void {
    this.organizationId$.pipe(
      switchMap((businessUnitId: number) => {
        const id = businessUnitId || this.store.selectSnapshot(UserState.user)?.businessUnitId as number;

        return this.store.dispatch(new GetOrganizationById(id));
      }),
      switchMap(() => {
        this.checkOrgPreferences();

        return this.watchForRangeChange();
      }),
      takeUntil(this.componentDestroy()),
    ).subscribe();
  }

  private checkOrgPreferences(): void {
    const preferences = this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences;
    this.orgFirstDayOfWeek = preferences?.weekStartsOn as number;

    this.cdr.markForCheck();
  }

  private watchForRangeChange(): Observable<[string, string]> {
    return this.weekService.getRangeStream().pipe(
      debounceTime(200),
      filter(([startDate, endDate]: [string, string]) => !!startDate && !!endDate),
      tap(([startDate, endDate]: [string, string]) => {
        this.datesRanges = DateTimeHelper.getDatesBetween(startDate, endDate);
        this.changeFilter.emit({ startDate, endDate });
        this.scrollArea.nativeElement.scrollTo(0, 0);

        this.cdr.detectChanges();
      }),
    );
  }

  private watchForScroll(): void {
    fromEvent(this.scrollArea.nativeElement, 'scroll')
      .pipe(
        debounceTime(500),
        filter(() => {
          const { scrollTop, scrollHeight, offsetHeight } = this.scrollArea.nativeElement;

          return scrollTop + offsetHeight >= scrollHeight;
        }),
        takeUntil(this.componentDestroy()),
      )
      .subscribe(() => {
        const { items, totalCount } = this.scheduleData || {};

        if ((items?.length || 0) < (totalCount || 0)) {
          this.loadMoreData.emit(Math.ceil((items?.length || 1) / this.itemsPerPage));
        }
      });
  }
}
