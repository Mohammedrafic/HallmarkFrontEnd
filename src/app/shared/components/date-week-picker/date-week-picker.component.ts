import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2,
  ViewChild} from '@angular/core';
import { FormControl } from '@angular/forms';

import { RenderDayCellEventArgs } from '@syncfusion/ej2-angular-calendars';
import { DatePickerComponent } from '@syncfusion/ej2-angular-calendars/src/datepicker/datepicker.component';
import { debounceTime, distinctUntilChanged, of, takeUntil } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';

import { DateTimeHelper, Destroyable } from '@core/helpers';
import { DateWeekService } from '@core/services';
import { DatesRangeType } from '@shared/enums';
import { ConfirmService } from '@shared/services/confirm.service';
import { WorkWeek } from '../../../modules/timesheets/interface';
import { ConfirmWeekChangeMessage, WeekRangeDimensions } from './date-week.constant';

/**
 * DateWeekService has to be provided in parent module.
 */
@Component({
  selector: 'app-date-week-picker',
  templateUrl: './date-week-picker.component.html',
  styleUrls: ['./date-week-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateWeekPickerComponent extends Destroyable implements OnInit, OnChanges {
  @ViewChild('datePicker') datePicker: DatePickerComponent;

  @Input() dateControl: FormControl = new FormControl('');

  @Input() initDates: [Date, Date];

  @Input() availibleDates: WorkWeek<Date>[] = [];

  @Input() isAbleToChange = true;

  @Input() overrideInitDates = false;

  @Input() rangeType = DatesRangeType.TwoWeeks;

  @Input() firstDayOfWeek: number;

  @Input() disabled = false;

  @Output() rangeChanged: EventEmitter<Date[]> = new EventEmitter<Date[]>();

  public maxDate: Date | null = new Date(new Date().setHours(23, 59, 59));

  public minDate: Date | null;

  public isPrevDisabled = false;

  public isNextDisabled = false;

  private startDateValue: string;

  private weekInMs: number;

  private startDate: Date;

  constructor(
    private weekService: DateWeekService,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef,
    private renderer2: Renderer2,
  ) {
    super();
  }

  ngOnInit(): void {
    this.startDatepickerWatching();
  }

  ngOnChanges(): void {
    this.setInitDate();
    this.weekInMs = WeekRangeDimensions[this.rangeType];
  }

  public renderCell(args: RenderDayCellEventArgs): void {
    if (this.dateControl.value && typeof this.dateControl.value === 'string') {
      const [from, to] = DateTimeHelper.getWeekStartEnd(this.dateControl.value);

      if (DateTimeHelper.isDateBetween(args.date, from, to)) {
        this.renderer2.addClass(args.element, 'e-highlightselectedrange');
      }
    } else {
      this.renderer2.removeClass(args.element, 'e-highlightselectedrange');
    }
  }

  public prevWeek(): void {
    const startDate = new Date(this.startDateValue);
    const dstCorrection = DateTimeHelper.getDSTCorrectionInMs(startDate);

    const weekStart = new Date(new Date(startDate.getTime() + dstCorrection - this.weekInMs));
    const dateRange = DateTimeHelper.getRange(weekStart, this.startDate, this.rangeType, this.firstDayOfWeek,
      !!this.maxDate);

    this.changeRange(dateRange, weekStart);
  }

  public nextWeek(): void {
    const startDate = new Date(this.startDateValue);
    const dstCorrection = DateTimeHelper.getDSTCorrectionInMs(startDate);

    const weekStart = new Date(startDate.getTime() + dstCorrection + this.weekInMs);
    const dateRange = DateTimeHelper.getRange(weekStart, this.startDate, this.rangeType, this.firstDayOfWeek,
      !!this.maxDate);

    this.changeRange(dateRange, weekStart);
  }

  public clearControl(): void {
    this.dateControl.reset('');
    this.datePicker.hide();
  }

  public navigateTo(): void {
    const [from] = DateTimeHelper.getWeekStartEnd(this.dateControl.value);

    if (from) {
      this.datePicker.navigateTo('Month', from);
    }
  }

  private startDatepickerWatching(): void {
    this.dateControl.valueChanges
    .pipe(
      distinctUntilChanged(),
      filter(Boolean),
      debounceTime(1),
      switchMap((value) => {
        if (!this.isAbleToChange) {
          return this.confirmService.confirm(ConfirmWeekChangeMessage, {
            title: 'Unsaved Progress',
            okButtonLabel: 'Proceed',
            okButtonClass: 'delete-button',
          })
          .pipe(
            take(1),
            filter((submited) => !!submited),
            map(() => value),
          );
        }
        return of(value);
      }),
      takeUntil(this.componentDestroy()),
    ).subscribe((value) => {
      this.setControlValue(value);
    });
  }

  private setInitDate(): void {
    if (this.availibleDates.length) {
      this.minDate = this.availibleDates[0].weekStartDate;
      const maxDateVal = this.availibleDates.slice(-1)[0].weekEndDate;
      this.maxDate = maxDateVal > new Date() ? new Date() : this.maxDate;
    } else {
      this.minDate = null;
      this.maxDate = null;
    }

    if (this.initDates) {
      this.startDateValue = this.initDates[0].toDateString();
      this.startDate = this.initDates[0];

      /**
       * TODO: make params as object
       */
      this.dateControl.patchValue(
        DateTimeHelper.getRange(this.initDates[0], this.startDate, this.rangeType, this.firstDayOfWeek, !!this.maxDate),
        { emitEvent: false });

      const firstDay = DateTimeHelper.getWeekDate(
        this.initDates[0],
        true,
        this.rangeType,
        this.firstDayOfWeek,
        !!this.maxDate,
      ).setHours(0, 0, 0);

      const lastDay = DateTimeHelper.getWeekDate(
        this.initDates[0],
        false,
        this.rangeType,
        this.firstDayOfWeek,
        !!this.maxDate,
      ).setHours(0, 0, 0);

      const utcStartDate = DateTimeHelper.toUtcFormat(new Date(firstDay));
      const utcLastDate = DateTimeHelper.toUtcFormat(new Date(lastDay));

      this.weekService.setRange([
        utcStartDate,
        utcLastDate,
      ]);
    }


    this.compareDates();
  }

  private setControlValue(value: string): void {
    const dateRange = DateTimeHelper.getRange(value, this.startDate, this.rangeType, this.firstDayOfWeek, !!this.maxDate);

    this.startDateValue = value;
    this.setRangeToService(dateRange, value);

    this.compareDates();
  }

  private changeRange(range: string, value: Date | string): void {
    if (!this.isAbleToChange) {
      this.confirmService.confirm(ConfirmWeekChangeMessage, {
        title: 'Unsaved Progress',
        okButtonLabel: 'Proceed',
        okButtonClass: 'delete-button',
      })
      .pipe(
        take(1),
        filter((submited) => !!submited),
        takeUntil(this.componentDestroy()),
      )
      .subscribe(() => {
        this.setWeekPeriod(range, value);
      });
    } else {
      this.setWeekPeriod(range, value);
    }
  }

  private setWeekPeriod(range: string, value: Date | string): void {
    this.startDateValue = typeof value === 'string' ? DateTimeHelper.getWeekStartEnd(value)[0].toDateString()
    : value.toDateString();

    this.setRangeToService(range, value);
    this.compareDates();
  }

  private setRangeToService(range: string, value: Date | string): void {
    this.dateControl.setValue(range, { emitEvent: false });
    const startRangeDate = DateTimeHelper.getDynamicWeekDate(value, true, this.startDate, this.rangeType,
      this.firstDayOfWeek, !!this.maxDate);

    this.weekService.setRange([
      DateTimeHelper.toUtcFormat(new Date(startRangeDate.setHours(0, 0, 0))),
      DateTimeHelper.toUtcFormat(new Date(DateTimeHelper.getDynamicWeekDate(value, false, this.startDate, this.rangeType,
        this.firstDayOfWeek, !!this.maxDate).setHours(0, 0, 0))),
    ]);

    if (this.overrideInitDates && this.initDates) {
      this.initDates = [
        startRangeDate,
        startRangeDate,
      ];
    }
  }

  private compareDates(): void {
    const compareDate = new Date(this.startDateValue || '');

    if (this.weekInMs) {
      const prevSuggestDate = new Date(compareDate.getTime() - this.weekInMs);
      const nextSuggestDate = new Date(compareDate.getTime() + this.weekInMs);

      this.isPrevDisabled = this.minDate ? this.minDate > prevSuggestDate : false;
      this.isNextDisabled = this.maxDate ? this.maxDate < nextSuggestDate : false;
      this.cdr.detectChanges();
    }
  }
}
