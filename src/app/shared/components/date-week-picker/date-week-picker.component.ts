import {
  ChangeDetectionStrategy, Component, Input, OnInit, ViewChild,
  OnChanges, ChangeDetectorRef, Renderer2
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { debounceTime, distinctUntilChanged, of, takeUntil } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { RenderDayCellEventArgs } from '@syncfusion/ej2-angular-calendars';
import { DatePickerComponent } from '@syncfusion/ej2-angular-calendars/src/datepicker/datepicker.component';

import { DateTimeHelper, Destroyable } from '@core/helpers';
import { DateWeekService } from '@core/services';
import { ConfirmService } from '@shared/services/confirm.service';
import { ConfirmWeekChangeMessage, DatesMath } from './date-week.constant';
import { WorkWeek } from '../../../modules/timesheets/interface';

/**
 * DateWeekService has to provided in parent module.
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

  @Input() availibleDates: WorkWeek<Date>[];

  @Input() isAbleToChange = true;

  public maxDate: Date = new Date(new Date().setHours(23, 59, 59));

  public minDate: Date;

  public isPrevDisabled = false;

  public isNextDisabled = false;

  private startDateValue: string;

  private readonly datesMath = DatesMath;

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
    const weekStart = new Date(new Date(this.startDateValue).getTime() - this.datesMath);
    const dateRange = DateTimeHelper.getRange(weekStart);

    // this.startDateValue = weekStart.toDateString();
    this.changeRange(dateRange, weekStart);
  }

  public nextWeek(): void {
    const weekStart = new Date(new Date(this.startDateValue).getTime() + this.datesMath);
    const dateRange = DateTimeHelper.getRange(weekStart);

    // this.startDateValue = DateTimeHelper.getWeekStartEnd(dateRange)[0].toDateString();
    this.changeRange(dateRange, dateRange);
  }

  public clearControl(): void {
    this.dateControl.reset('');
    this.datePicker.hide();
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
          )
        }
        return of(value)
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
    }

    if (this.initDates) {
      this.startDateValue = this.initDates[0].toDateString();
      this.dateControl.patchValue(
        DateTimeHelper.getRange(this.initDates[0]),
        { emitEvent: false });
    }
    this.compareDates();
  }

  private setControlValue(value: string): void {
    const dateRange = DateTimeHelper.getRange(value);

    this.startDateValue = value;

    this.dateControl.patchValue(dateRange, { emitEvent: false });
    this.weekService.setRange([
      DateTimeHelper.toUtcFormat(DateTimeHelper.getWeekDate(value, true)),
      DateTimeHelper.toUtcFormat(DateTimeHelper.getWeekDate(value))
    ]);
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
    this.dateControl.setValue(range, { emitEvent: false });
    this.weekService.setRange([
      DateTimeHelper.toUtcFormat(new Date(this.startDateValue)),
      DateTimeHelper.toUtcFormat(DateTimeHelper.getWeekDate(this.startDateValue)),
    ]);
    this.compareDates();
  }

  private compareDates(): void {
    const compareDate = new Date(this.startDateValue || '');
    const prevSuggestDate = new Date(compareDate.getTime() - this.datesMath);
    const nextSuggestDate = new Date(compareDate.getTime() + this.datesMath);

    this.isPrevDisabled = this.minDate > prevSuggestDate;
    this.isNextDisabled = this.maxDate < nextSuggestDate;
    this.cdr.detectChanges();
  }
}
