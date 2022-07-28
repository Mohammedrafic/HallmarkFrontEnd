import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild,
  OnChanges, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';
import { RenderDayCellEventArgs } from '@syncfusion/ej2-angular-calendars';
import { DatePickerComponent } from '@syncfusion/ej2-angular-calendars/src/datepicker/datepicker.component';

import { DateTimeHelper, Destroyable } from '@core/helpers';

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

  @Output() readonly dateChanged: EventEmitter<[string, string]> = new EventEmitter();

  public readonly maxDate = new Date(new Date().setHours(23, 59, 59));

  private startDateValue: string;

  ngOnInit(): void {
    this.startDatepickerWatching();
  }

  ngOnChanges(): void {
    this.setInitDate();
  }

  public onRenderCell(args: RenderDayCellEventArgs): void {
    if (this.dateControl.value && typeof this.dateControl.value === 'string') {
      const [from, to] = DateTimeHelper.getWeekStartEnd(this.dateControl.value);

      if (DateTimeHelper.isDateBetween(args.date, from, to)) {
        args.element?.classList.add('e-highlightselectedrange');
      }
    } else {
      args.element?.classList.remove('e-highlightselectedrange');
    }
  }

  prevWeek(): void {
    const weekStart = new Date(new Date(this.startDateValue).getTime() - 7 * 24 * 60 * 60 * 1000);
    const dateRange = DateTimeHelper.getRange(weekStart);

    this.startDateValue = weekStart.toDateString();
    this.dateControl.patchValue(dateRange, { emitEvent: false });
  }

  nextWeek(): void {
    const weekStart = new Date(new Date(this.startDateValue).getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const dateRange = DateTimeHelper.getRange(weekStart);
    this.startDateValue = DateTimeHelper.getWeekStartEnd(dateRange)[0].toDateString();

    this.dateControl.patchValue(dateRange, { emitEvent: false });
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
      takeUntil(this.componentDestroy()),
    ).subscribe((value) => {
      this.setControlValue(value);
    });
  }

  private setInitDate(): void {
    this.startDateValue = this.initDates[0].toDateString();
    this.dateControl.patchValue(
      DateTimeHelper.getRange(this.initDates[0]),
      { emitEvent: false });
  }

  private setControlValue(value: string): void {
    const dateRange = DateTimeHelper.getRange(value);
    this.startDateValue = value;
    this.dateControl.patchValue(dateRange, { emitEvent: false });

    this.dateChanged.emit([
      DateTimeHelper.toUtcFormat(value),
      DateTimeHelper.toUtcFormat(DateTimeHelper.getWeekDate(value))
    ]);
  }
}
