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
  SimpleChanges,
  TrackByFunction,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';

import { Select, Store } from '@ngxs/store';
import { AutoCompleteComponent } from '@syncfusion/ej2-angular-dropdowns/src/auto-complete/autocomplete.component';
import { ItemModel } from '@syncfusion/ej2-splitbuttons/src/common/common-model';
import { FieldSettingsModel } from '@syncfusion/ej2-dropdowns/src/drop-down-base/drop-down-base-model';
import { FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { catchError, debounceTime, EMPTY, fromEvent, Observable, switchMap, take, takeUntil, tap } from 'rxjs';
import { filter } from 'rxjs/operators';

import { DatesRangeType, WeekDays } from '@shared/enums';
import { DateTimeHelper, Destroyable } from '@core/helpers';
import { DateWeekService } from '@core/services';
import { PreservedFiltersByPage } from '@core/interface';
import { FilterPageName } from '@core/enums';
import { GetOrganizationById } from '@organization-management/store/organization-management.actions';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED } from '@shared/constants';
import { CreateScheduleService, OpenPositionService, ScheduleApiService, ScheduleFiltersService } from '../../services';
import { UserState } from '../../../../store/user.state';
import { ScheduleGridAdapter } from '../../adapters';
import { DatesPeriods, MonthPeriod, PermissionRequired } from '../../constants';
import * as ScheduleInt from '../../interface';
import {
  CardClickEvent,
  DroppedEvent,
  OpenPositionsList,
  PositionDragEvent,
  RemovedSlot,
  ScheduleBook,
  ScheduleCandidatesPage,
  ScheduleModel,
  SelectedCells,
} from '../../interface';
import { GetMonthRange, GetScheduledShift } from '../../helpers';
import { ScheduleGridService } from './schedule-grid.service';
import { ShowToast } from '../../../../store/app.actions';
import { ScheduleItemsService } from '../../services/schedule-items.service';
import { GetPreservedFiltersByPage, ResetPageFilters } from 'src/app/store/preserved-filters.actions';
import { PreservedFiltersState } from 'src/app/store/preserved-filters.state';
import { ClearOrganizationStructure } from 'src/app/store/user.actions';
import { BookingsOverlapsResponse } from '../replacement-order-dialog/replacement-order.interface';

@Component({
  selector: 'app-schedule-grid',
  templateUrl: './schedule-grid.component.html',
  styleUrls: ['./schedule-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleGridComponent extends Destroyable implements OnInit, OnChanges {
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  @Select(PreservedFiltersState.preservedFiltersByPageName)
  private readonly preservedFiltersByPageName$: Observable<PreservedFiltersByPage<ScheduleInt.ScheduleFilters>>;

  @ViewChild('scrollArea', { static: true }) scrollArea: ElementRef;
  @ViewChild('autoCompleteSearch') autoCompleteSearch: AutoCompleteComponent;

  @Input() set initScheduleData(scheduleData: ScheduleInt.ScheduleModelPage | null) {
    this.setScheduleData(scheduleData);
  }

  @Input() selectedFilters: ScheduleInt.ScheduleFilters;
  @Input() hasViewPermission = false;
  @Input() hasSchedulePermission = false;

  @Output() DateRange: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeFilter: EventEmitter<ScheduleInt.ScheduleFilters> = new EventEmitter<ScheduleInt.ScheduleFilters>();
  @Output() loadMoreData: EventEmitter<number> = new EventEmitter<number>();
  @Output() selectedCells: EventEmitter<SelectedCells> = new EventEmitter<SelectedCells>();
  @Output() selectCandidate: EventEmitter<ScheduleInt.ScheduleCandidate | null>
    = new EventEmitter<ScheduleInt.ScheduleCandidate | null>();
  @Output() editCell: EventEmitter<ScheduleInt.ScheduledItem> = new EventEmitter<ScheduleInt.ScheduledItem>();
  @Output() activeTimePeriod: EventEmitter<any> = new EventEmitter<any>();

  datesPeriods: ItemModel[] = DatesPeriods;

  scheduleData: ScheduleInt.ScheduleModelPage | null;

  scheduleSlotsWithDate: string[];

  activePeriod = DatesRangeType.TwoWeeks;

  monthPeriod = DatesRangeType.Month;

  weekPeriod: [Date, Date] = [DateTimeHelper.getCurrentDateWithoutOffset(), DateTimeHelper.getCurrentDateWithoutOffset()];

  datesRanges: ScheduleInt.DateRangeOption[] = this.scheduleItemsService
  .createRangeOptions(DateTimeHelper.getDatesBetween());

  monthRangeDays: WeekDays[] = [];

  selectedCandidatesSlot: Map<number, ScheduleInt.ScheduleDateSlot>
  = new Map<number, ScheduleInt.ScheduleDateSlot>();

  orgFirstDayOfWeek: number;

  searchControl = new FormControl();

  candidatesSuggestions: ScheduleInt.ScheduleCandidate[] = [];

  candidateNameFields: FieldSettingsModel = { text: 'fullName' };

  isEmployee = false;

  dragEvent: PositionDragEvent | null = null;

  replacementOrderDialogOpen = false;

  replacementOrderDialogData: BookingsOverlapsResponse[] = [];

  employeesTitle = 'Employee';

  private filteredByEmployee = false;

  private scheduleToBook: ScheduleBook | null;

  constructor(
    private store: Store,
    private weekService: DateWeekService,
    private scheduleApiService: ScheduleApiService,
    private cdr: ChangeDetectorRef,
    private createScheduleService: CreateScheduleService,
    private scheduleGridService: ScheduleGridService,
    private scheduleItemsService: ScheduleItemsService,
    private scheduleFiltersService: ScheduleFiltersService,
    private openPositionService: OpenPositionService,
  ) {
    super();
  }

  trackByPeriods: TrackByFunction<ItemModel> = (_: number, period: ItemModel) => period.text;

  trackByDatesRange: TrackByFunction<ScheduleInt.DateRangeOption> =
   (_: number, date: ScheduleInt.DateRangeOption) => date.dateText;

  trackByweekDays: TrackByFunction<WeekDays> = (_: number, date: WeekDays) => date;

  trackByScheduleData: TrackByFunction<ScheduleInt.ScheduleModel> = (_: number,
    scheduleData: ScheduleInt.ScheduleModel) => scheduleData.id;

  ngOnInit(): void {
    this.startOrgIdWatching();
    this.watchForScroll();
    this.watchForCandidateSearch();
    this.watchForSideBarAction();
    this.watchForDragEvent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.selectedCandidatesSlot.clear();
    if (changes['selectedFilters'] && !this.filteredByEmployee) {
      this.filterByEmployee();
    }
  }

   handleDroppedElement(event: CdkDragDrop<DroppedEvent>): void {
   this.openPositionService.dropElementToDropList(event).pipe(
   catchError((error: HttpErrorResponse) => this.createScheduleService.handleError(error)),
     switchMap((response: BookingsOverlapsResponse[]) => {
       this.scheduleToBook = this.openPositionService.createPositionBookDto(event);

       if (!response.length) {
         return this.scheduleApiService.createBookSchedule(this.scheduleToBook);
       } else {
         this.openReplacementOrderDialog(response);
         return EMPTY;
       }
     }),
     catchError((error: HttpErrorResponse) => this.createScheduleService.handleError(error)),
     switchMap(() => {
       return this.getOpenPositions();
     }),
     tap((positions: OpenPositionsList[]) => {
       this.openPositionService.setOpenPosition('initialPositions', positions);
     }),
     takeUntil(this.componentDestroy()),
   ).subscribe(() => {
     this.successSaveBooking();
   });
  }

  closeReplacementOrderDialog(): void {
    this.replacementOrderDialogOpen = false;
    this.cdr.markForCheck();
  }

  saveNewBooking(createOrder: boolean): void {
    if (this.scheduleToBook) {
      this.scheduleToBook.createOrder = createOrder;
      this.scheduleApiService.createBookSchedule(this.scheduleToBook).pipe(
        catchError((error: HttpErrorResponse) => this.createScheduleService.handleError(error)),
        switchMap(() => {
          return this.getOpenPositions();
        }),
        tap((positions: OpenPositionsList[]) => {
          this.openPositionService.setOpenPosition('initialPositions', positions);
        }),
        takeUntil(this.componentDestroy())
      ).subscribe(() => {
        this.successSaveBooking();
      });
    }
  }

  changeActiveDatePeriod(selectedPeriod: string | undefined): void {
    if (this.hasViewPermission) {
      this.activePeriod = selectedPeriod as DatesRangeType;
      this.cdr.detectChanges();
    }
  }

  selectCellSlots(
    date: string,
    candidate: ScheduleInt.ScheduleCandidate,
    schedule?: ScheduleInt.ScheduleDateItem): void {

    if (!this.hasSchedulePermission) {
      this.store.dispatch(new ShowToast(MessageTypes.Error, PermissionRequired));
      return;
    }

    if (schedule?.isOnHold) {
      return;
    }

    if (!schedule?.isDisabled) {
      this.selectDateSlot(date, candidate, schedule);
      this.processCellSelection(candidate, schedule);
    }
  }

  //TODO: refactor this method, avoid cyclomatic complexity
  selectDateSlot(date: string, candidate: ScheduleInt.ScheduleCandidate, schedule?: ScheduleInt.ScheduleDateItem): void {
    const candidateSelectedSlot = this.selectedCandidatesSlot.get(candidate.id);

    if (candidateSelectedSlot) {
      if (candidateSelectedSlot.dates.has(date)) {
        candidateSelectedSlot.dates.delete(date);
        candidateSelectedSlot.candidate.days =
          this.scheduleGridService.removeCandidateSlotDay(candidateSelectedSlot.candidate.days, date);

        if (!candidateSelectedSlot.dates.size) {
          this.selectedCandidatesSlot.delete(candidate.id);
        }
      } else {
        candidateSelectedSlot.dates.add(date);

        if(schedule) {
          candidateSelectedSlot.candidate.days =
            this.scheduleGridService.createDaysForSelectedSlots(candidate.days, schedule.daySchedules);
        }
      }
    } else {
      const selectedCandidateSlots =
        this.scheduleGridService.createSelectedCandidateSlotsWithDays(candidate, date, schedule);

      this.selectedCandidatesSlot.set(candidate.id, selectedCandidateSlots);
    }
  }

  filteringCandidates(eventArgs: FilteringEventArgs): void {
    this.searchControl.setValue(eventArgs);
  }

  autoSelectCandidate(candidate: ScheduleInt.ScheduleCandidate | null): void {
    this.emitSelectedCandidate(candidate);
  }

  emitSelectedCandidate(candidate: ScheduleInt.ScheduleCandidate | null): void {
    this.datesPeriods = candidate ? [...DatesPeriods, ...MonthPeriod] : DatesPeriods;
    this.activePeriod = this.datesPeriods.includes(MonthPeriod[0]) ? DatesRangeType.Month : DatesRangeType.TwoWeeks;
    this.selectCandidate.emit(candidate);
    this.activeTimePeriod.emit(this.activePeriod);
    this.cdr.markForCheck();
  }

  handleMonthClick({date, candidate, cellDate }: CardClickEvent): void {
    this.selectCellSlots(date, candidate, cellDate);
  }

  private processCellSelection(candidate: ScheduleInt.ScheduleCandidate, schedule?: ScheduleInt.ScheduleDateItem): void {
    const candidateId = this.selectedCandidatesSlot.size === 1
      ? Array.from(this.selectedCandidatesSlot.keys())[0]
      : candidate.id;
    const isEditSideBar = this.scheduleGridService.shouldShowEditSideBar(
      this.selectedCandidatesSlot,
      this.scheduleData?.items as ScheduleModel[],
      candidateId
    );

    if(isEditSideBar) {
      this.editCell.emit(GetScheduledShift(
        this.scheduleData as ScheduleInt.ScheduleModelPage,
        candidateId,
        this.scheduleGridService.getFirstSelectedDate(this.selectedCandidatesSlot),
      ));
    } else {
      this.selectedCells.emit({
        cells: ScheduleGridAdapter.prepareSelectedCells(this.selectedCandidatesSlot, schedule),
      });
    }
  }

  private openReplacementOrderDialog(replacementOrderDialogData: BookingsOverlapsResponse[]): void {
    this.replacementOrderDialogData = replacementOrderDialogData;
    this.replacementOrderDialogOpen = true;
    this.cdr.markForCheck();
  }

  private getOpenPositions(): Observable<OpenPositionsList[]> {
    return this.scheduleApiService.getOpenPositions(
      this.createScheduleService.createOpenPositionsParams([])
    );
  }

  private startOrgIdWatching(): void {
    let clearStructure = false;

    this.organizationId$.pipe(
      filter(Boolean),
      tap(() => {
        if (clearStructure) {
          this.store.dispatch([
            new ClearOrganizationStructure(),
            new ResetPageFilters(),
          ]);
        } else {
          clearStructure = true;
        }

        this.store.dispatch([
          new GetPreservedFiltersByPage(FilterPageName.SchedullerOrganization),
        ]);

        if (!this.isEmployee) {
          this.autoCompleteSearch?.clear();
        }
      }),
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

  private watchForSideBarAction(): void {
    this.createScheduleService.closeSideBarEvent.pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe(() => {
      this.selectedCandidatesSlot = new Map<number, ScheduleInt.ScheduleDateSlot>();
      this.cdr.markForCheck();
    });

    this.scheduleItemsService.removeCandidateItem.pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe((slot: RemovedSlot) => {
      const {date, candidate} = slot;

      if(slot.date) {
        this.selectCellSlots(date as string,candidate);
        this.selectedCells.emit({cells: ScheduleGridAdapter.prepareSelectedCells(this.selectedCandidatesSlot)});
      } else {
        this.selectedCandidatesSlot.delete(candidate.id);
        this.selectedCells.emit({
          cells: ScheduleGridAdapter.prepareSelectedCells(this.selectedCandidatesSlot),
          sideBarState: !!this.selectedCandidatesSlot.size,
        });
      }

      this.selectedCandidatesSlot = new Map(this.selectedCandidatesSlot);
    });
  }

  private checkOrgPreferences(): void {
    const preferences = this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences;
    this.orgFirstDayOfWeek = preferences?.weekStartsOn as number;
    this.monthRangeDays = GetMonthRange(this.orgFirstDayOfWeek ?? 0);

    this.cdr.markForCheck();
  }

  private watchForRangeChange(): Observable<[string, string]> {
    return this.weekService.getRangeStream().pipe(
      debounceTime(200),
      filter(([startDate, endDate]: [string, string]) => !!startDate && !!endDate),
      tap(([startDate, endDate]: [string, string]) => {
        this.datesRanges = this.scheduleItemsService.createRangeOptions(DateTimeHelper.getDatesBetween(startDate, endDate));
        this.DateRange.emit(this.datesRanges);
        this.changeFilter.emit({ startDate, endDate });
        this.scrollArea.nativeElement.scrollTo(0, 0);

        this.cdr.markForCheck();
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
        if (this.scheduleData) {
          const { pageNumber, totalPages } = this.scheduleData;
          this.loadMoreItemPerPage(pageNumber,totalPages);
        }
      });
  }

  private loadMoreItemPerPage(pageNumber: number, totalPages: number): void {
    if (this.scheduleData && (totalPages > pageNumber)) {
      this.loadMoreData.emit(pageNumber + 1);
    }
  }

  private watchForCandidateSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(1000),
      tap((filteringEventArgs: FilteringEventArgs) => {
        if (!filteringEventArgs?.text || !filteringEventArgs?.text.length) {
          this.candidatesSuggestions = [];
          filteringEventArgs.updateData([]);
        }
      }),
      switchMap((filteringEventArgs: FilteringEventArgs) => this.scheduleApiService.getScheduleEmployees({
        firstLastNameOrId: filteringEventArgs.text,
        startDate: this.selectedFilters.startDate,
        endDate: this.selectedFilters.endDate,
      }).pipe(
        tap((employeeDto) => {
          this.candidatesSuggestions = ScheduleGridAdapter.prepareCandidateFullName(employeeDto.items);
          filteringEventArgs.updateData(
            this.candidatesSuggestions as unknown as { [key: string]: ScheduleInt.ScheduleCandidate }[]
          );
        }),
      )),
      takeUntil(this.componentDestroy()),
    ).subscribe();
  }

  private filterByEmployee(): void {
    const user = this.store.selectSnapshot(UserState.user);
    this.isEmployee = user?.isEmployee || false;

    if (user?.isEmployee && this.selectedFilters.startDate && this.selectedFilters.endDate) {
      this.filteredByEmployee = true;
      this.autoCompleteSearch?.writeValue(user.fullName);
      this.scheduleApiService.getScheduleEmployees({
        firstLastNameOrId: user.fullName,
        startDate: this.selectedFilters.startDate,
        endDate: this.selectedFilters.endDate,
      })
        .pipe(take(1))
        .subscribe((page: ScheduleCandidatesPage) => {
          this.autoSelectCandidate(page.items[0]);
        });
    }
  }

  private watchForDragEvent(): void {
    this.openPositionService.getDragEventStream().pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe((event: PositionDragEvent) => {
      this.dragEvent = {
        ...event,
      };
      this.cdr.markForCheck();
    });
  }

  private successSaveBooking(): void {
    this.createScheduleService.closeSideBarEvent.next(false);
    this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
  }

  private setScheduleData(scheduleData: ScheduleInt.ScheduleModelPage | null): void {
    this.scheduleData = scheduleData;
    this.employeesTitle = scheduleData?.totalCount && scheduleData.totalCount > 1 ? 'Employees' : 'Employee';

    if(scheduleData) {
      this.scheduleSlotsWithDate = this.scheduleGridService.getSlotsWithDate(scheduleData);
    }

    this.cdr.markForCheck();
  }
}
