import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';

import { RenderDayCellEventArgs } from '@syncfusion/ej2-angular-calendars';
import { Destroyable } from '@core/helpers';

@Component({
  selector: 'app-date-week-picker',
  templateUrl: './date-week-picker.component.html',
  styleUrls: ['./date-week-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateWeekPickerComponent extends Destroyable implements OnInit {
  @Input() dateControl: FormControl = new FormControl('');

  constructor(private datePipe: DatePipe) {
    super();
  }

  ngOnInit(): void {
    this.startDatepickerWatching();
  }

  public onRenderCell(args: RenderDayCellEventArgs): void {
    if (this.dateControl.value && typeof this.dateControl.value === 'string') {
      const splitValue = this.dateControl.value.split(' - ');
      const from = this.getWeekDate(splitValue[0], true);
      const to = this.getWeekDate(splitValue[1]);

      if ((args.date?.getTime() || 0) <= to.getTime() && (args.date?.getTime() || 0) >= from.getTime()) {
        args.element?.classList.add('e-highlightselectedrange');
      }
    }
  }

  private getWeekDate(date: string, isStart = false): Date {
    const curr = new Date(date); // get current date
    const first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
    const last = first + 6; // last day is the first day + 6

    return new Date(curr.setDate(isStart ? first : last));
  }

  private startDatepickerWatching(): void {
    this.dateControl.valueChanges.pipe(
      distinctUntilChanged(),
      filter(Boolean),
      debounceTime(1),
      takeUntil(this.componentDestroy()),
    ).subscribe((value) => {
      const startWeekDay = this.datePipe.transform(this.getWeekDate(value, true), 'MM/dd/YYYY');
      const endWeekDay = this.datePipe.transform(this.getWeekDate(value), 'MM/dd/YYYY');

      this.dateControl.setValue(`${startWeekDay} - ${endWeekDay}`, { emitEvent: false });
    });
  }
}
