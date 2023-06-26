import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl } from '@angular/forms';

import { takeUntil } from 'rxjs';

import { DateTimeHelper, Destroyable } from '@core/helpers';

@Component({
  selector: 'app-date-range-week-picker',
  templateUrl: './date-range-week-picker.component.html',
  styleUrls: ['./date-range-week-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateWeekPickerComponent extends Destroyable implements OnInit {
  @Output() range: EventEmitter<string[]> = new EventEmitter<string[]>();

  public dateControl: FormControl = new FormControl('');

  public readonly maxDate = new Date(new Date().setHours(23, 59, 59));

  constructor(
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.startDatepickerWatching();
  }

  private startDatepickerWatching(): void {
    this.dateControl.valueChanges
    .pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe((value) => {
      if (value) {
        const from = value[0] as Date;
        const to = value[1] as Date;
        const correctedStart = DateTimeHelper.getFirstDayofWeek(from);
        const correctedEnd = this.datePipe.transform(to, 'MM/dd/yyyy') === this.datePipe
        .transform(this.maxDate, 'MM/dd/yyyy') ? to : DateTimeHelper.getLastDayOfWeek(to);

        this.dateControl.setValue([correctedStart, correctedEnd], { onlySelf: true, emitEvent: false });
        this.range.emit([
          DateTimeHelper.toUtcFormat(correctedStart),
          DateTimeHelper.toUtcFormat(correctedEnd)
        ]);
      } else {
        this.dateControl.reset(null, { onlySelf: true, emitEvent: false });
        this.range.emit([]);
      }
    });
  }
}
