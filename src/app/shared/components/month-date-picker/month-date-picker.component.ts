import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs';
import { CalendarView } from '@syncfusion/ej2-angular-calendars';

import { DateTimeHelper, Destroyable } from '@core/helpers';
import { MonthPickerService } from '@shared/components/month-date-picker/month-picker.service';

@Component({
  selector: 'app-month-date-picker',
  templateUrl: './month-date-picker.component.html',
  styleUrls: ['./month-date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthDatePickerComponent extends Destroyable implements OnInit, OnChanges {
  @Input() disabled = false;
  @Input() firstDayOfWeek: number;

  public dateControl: FormControl = new FormControl('');

  public depthSetting: CalendarView = 'Year';
  public dateFormat = 'MMMM, yyyy';

  private currentDate: Date = DateTimeHelper.getCurrentDateWithoutOffset();
  private startDateValue: Date;

  constructor(
    private monthPickerService: MonthPickerService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.startDatepickerWatching();
  }

  ngOnChanges(): void {
    this.initDate();
  }

  public prevMonth(): void {
    const nextDate = new Date(
      this.startDateValue.getFullYear(),
      this.startDateValue.getMonth() - 1,
      this.startDateValue.getDate()
    );

    this.dateControl.patchValue(nextDate);
  }

  public nextMonth(): void {
    const nextDate = new Date(
      this.startDateValue.getFullYear(),
      this.startDateValue.getMonth() + 1,
      this.startDateValue.getDate()
    );

    this.dateControl.patchValue(nextDate);
  }

  private initDate(): void {
    this.dateControl.patchValue(this.currentDate, {emitEvent: false});
    this.startDateValue = new Date(this.currentDate);
    this.monthPickerService.setSelectedMonth(this.startDateValue);
    this.monthPickerService.setDates(this.currentDate, this.firstDayOfWeek);
  }

  private startDatepickerWatching(): void {
    this.dateControl.valueChanges.pipe(
      distinctUntilChanged(),
      filter(Boolean),
      debounceTime(1),
      takeUntil(this.componentDestroy()),
    ).subscribe((value: string) => {
      this.startDateValue = new Date(value);
      this.monthPickerService.setSelectedMonth(this.startDateValue);
      this.monthPickerService.setDates(this.startDateValue, this.firstDayOfWeek);
    });
  }
}
