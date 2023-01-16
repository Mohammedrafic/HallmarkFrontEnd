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
import { FormControl } from '@angular/forms';

import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Select, Store } from '@ngxs/store';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { debounceTime, fromEvent, Observable, switchMap, takeUntil, tap } from 'rxjs';
import { filter } from 'rxjs/operators';

import { DateTimeHelper, Destroyable } from '@core/helpers';
import { DateWeekService } from '@core/services';
import { GetOrganizationById } from '@organization-management/store/organization-management.actions';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { DatesRangeType } from '@shared/enums';
import { ScheduleApiService } from '@shared/services/schedule-api.service';
import { UserState } from '../../../../store/user.state';
import { ScheduleGridAdapter } from '../../adapters';
import { DatesPeriods } from '../../constants';
import * as ScheduleInt from '../../interface';


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
  @ViewChild('automcomplete') autocomplete: MatAutocompleteTrigger;

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

  searchControl = new FormControl();

  candidatesSuggestions: ScheduleInt.ScheduleCandidate[] = [];

  private itemsPerPage = 30;

  constructor(
    private store: Store,
    private weekService: DateWeekService,
    private scheduleApiService: ScheduleApiService,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  trackByPeriods: TrackByFunction<ItemModel> = (_: number, period: ItemModel) => period.text;

  trackByDatesRange: TrackByFunction<string> = (_: number, date: string) => date;

  trackByScheduleData: TrackByFunction<ScheduleInt.ScheduleModel> = (_: number,
    scheduleData: ScheduleInt.ScheduleModel) => scheduleData.id;

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

  displayEmployee(item: ScheduleInt.ScheduleCandidate): string {
    return `${item.firstName} ${item.lastName}`;
  }

  trackById(index: number, item: ScheduleInt.ScheduleCandidate): number {
    return item.id;
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
    this.searchControl.valueChanges
    .pipe(
      debounceTime(1500),
      tap((value) => {
        if (!value || !value.length) {
          this.candidatesSuggestions = [];
          this.cdr.markForCheck();
        }
      }),
      filter((value) => value.length > 2),
      switchMap((value) => this.scheduleApiService.getScheduleEmployees({
        firstLastNameOrId: value,
      })),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((employeeDto) => {
      this.candidatesSuggestions = employeeDto.items;
      this.autocomplete.openPanel();
      this.cdr.markForCheck();
    });
  }
}
