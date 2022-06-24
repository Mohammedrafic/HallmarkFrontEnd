import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';

import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';

import { RenderDayCellEventArgs } from '@syncfusion/ej2-angular-calendars';
import { DatePickerComponent } from '@syncfusion/ej2-angular-calendars/src/datepicker/datepicker.component';
import { DateWeekPickerService } from '@shared/components/date-week-picker/date-week-picker.service';
import { Destroyable } from '@core/helpers';

@Component({
  selector: 'app-date-week-picker',
  templateUrl: './date-week-picker.component.html',
  styleUrls: ['./date-week-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateWeekPickerComponent extends Destroyable implements OnInit {
  @ViewChild('datePicker') datePicker: DatePickerComponent;

  @Input() dateControl: FormControl = new FormControl('');

  private previousRange = '';

  constructor(
    private dateWeekPickerService: DateWeekPickerService
  ) {
    super();
  }

  ngOnInit(): void {
    this.startDatepickerWatching();
  }

  public onRenderCell(args: RenderDayCellEventArgs): void {
    if (this.dateControl.value && typeof this.dateControl.value === 'string') {
      const [from, to] = this.dateWeekPickerService.getWeekStartEnd(this.dateControl.value);

      if (this.dateWeekPickerService.isDateBetween(args.date, from, to)) {
        args.element?.classList.add('e-highlightselectedrange');
      }
    } else {
      args.element?.classList.remove('e-highlightselectedrange');
    }
  }

  public clearControl(): void {
    this.dateControl.reset('');
    this.previousRange = '';
    this.datePicker.hide();
  }

  private startDatepickerWatching(): void {
    this.dateControl.valueChanges.pipe(
      distinctUntilChanged(),
      filter(Boolean),
      debounceTime(1),
      takeUntil(this.componentDestroy()),
    ).subscribe((value) => {
      const dateRange = this.previousRange ?
        this.dateWeekPickerService.getRange(value, this.previousRange) :
        this.dateWeekPickerService.getRange(value);

      this.dateControl.setValue(dateRange, { emitEvent: false });
      this.previousRange = dateRange;
    });
  }
}
