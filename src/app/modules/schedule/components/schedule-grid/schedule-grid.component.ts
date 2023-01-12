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
import { auditTime, filter, skip } from 'rxjs/operators';

import { DateTimeHelper, Destroyable } from '@core/helpers';
import { DateWeekService } from '@core/services';
import { GetOrganizationById } from '@organization-management/store/organization-management.actions';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { DatesRangeType } from '@shared/enums';

import { UserState } from '../../../../store/user.state';
import { DatesPeriods } from '../../constants';
import * as ScheduleInt from '../../interface';
import { ScheduleGridAdapter } from '../../adapters';
import { ScheduleGridService } from '../../services';

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

  @Input() scheduleData: ScheduleInt.ScheduleModelPage | null;

  @Output() changeFilter: EventEmitter<ScheduleInt.ScheduleFilters> = new EventEmitter<ScheduleInt.ScheduleFilters>();
  @Output() loadMoreData: EventEmitter<number> = new EventEmitter<number>();
  @Output() selectedCells: EventEmitter<ScheduleInt.ScheduleSelectedSlots>
  = new EventEmitter<ScheduleInt.ScheduleSelectedSlots>();

  datesPeriods: ItemModel[] = DatesPeriods;

  activePeriod = DatesRangeType.TwoWeeks;

  weekPeriod: [Date, Date] = [new Date(), new Date()];

  datesRanges: string[] = DateTimeHelper.getDatesBetween();

  selectedCandidatesSlot: Map<number, ScheduleInt.ScheduleDateSlot>
  = new Map<number, ScheduleInt.ScheduleDateSlot>();

  orgFirstDayOfWeek: number;

  private itemsPerPage = 30;

  constructor(
    private store: Store,
    private weekService: DateWeekService,
    private scheduleGridService: ScheduleGridService,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  trackByPeriods: TrackByFunction<ItemModel> = (_: number, period: ItemModel) => period.text;

  trackByDatesRange: TrackByFunction<string> = (_: number, date: string) => date;

  trackByScheduleData: TrackByFunction<ScheduleInt.ScheduleModel>
  = (_: number, scheduleData: ScheduleInt.ScheduleModel) => scheduleData.id;

  ngOnInit(): void {
    this.startOrgIdWatching();
    this.watchForScroll();
    this.watchForCandidateSearch();
  }

  ngOnChanges(): void {
    this.selectedCandidatesSlot.clear();
  }

  changeActiveDatePeriod(selectedPeriod: string | undefined): void {
    this.activePeriod = selectedPeriod as DatesRangeType;
    this.cdr.detectChanges();
  }

  selectScheduleCard(schedule: ScheduleInt.ScheduleDateItem, candidate: ScheduleInt.ScheduleCandidate): void {}

  selectDateSlot(date: string, candidate: ScheduleInt.ScheduleCandidate): void {
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
    this.scheduleGridService.setSearch((event.target as HTMLInputElement).value);
  }

  private startOrgIdWatching(): void {
    this.organizationId$.pipe(
      filter(Boolean),
      switchMap((businessUnitId: number) => {
        return this.store.dispatch(new GetOrganizationById(businessUnitId));
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

  private watchForCandidateSearch(): void {
    this.scheduleGridService.getSearchStream()
    .pipe(
      auditTime(1500),
      skip(1),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((criteria) => {
      this.changeFilter.emit({ firstLastNameOrId: criteria });
      this.scrollArea.nativeElement.scrollTo(0, 0);
    });
  }
}
