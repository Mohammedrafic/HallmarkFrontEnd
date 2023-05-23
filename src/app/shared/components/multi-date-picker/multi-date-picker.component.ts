import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { Destroyable } from '@core/helpers';
import { CalendarComponent } from '@syncfusion/ej2-angular-calendars';

@Component({
  selector: 'app-multi-date-picker',
  templateUrl: './multi-date-picker.component.html',
  styleUrls: ['./multi-date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiDatePickerComponent extends Destroyable implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('inputWrapper') inputWrapper: ElementRef;

  @Input() showChipsBelowControl = false;
  @Input() datesControl: FormControl = new FormControl([]);
  @Input() set valueSetter(dates: Date[]) {
    this.datesControl.setValue(dates);
  }
  // Temporary solution
  @Input() hasError = false;

  @Output() appliedDates: EventEmitter<Date[]> = new EventEmitter<Date[]>();

  isCalendarShow = false;
  datesValues: Date[] = [];

  private appliedDatesValues: Date[] = [];
  private outerClickRemover: () => void;
  private applyListenerRemover: () => void;
  private cancelListenerRemover: () => void;
  public lastdatevalue: Date;
  constructor(private renderer2: Renderer2, private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.startDatesControlWatching();
  }

  ngAfterViewInit(): void {
    this.outerClickRemover = this.renderer2.listen('document', 'click', this.outerClickListener.bind(this));
  }

  override ngOnDestroy(): void {
    this.outerClickRemover();
  }

  openMenu(): void {
    this.isCalendarShow = !this.isCalendarShow;
  }

  calendarDestroyed(): void {
    this.applyListenerRemover();
    this.cancelListenerRemover();
  }

  datesValuesChange(event: Date[]): void {
    this.datesValues = event;
    this.cdr.detectChanges();
  }

  removeChip(dateIndex: number) {
    this.datesValues = this.datesValues.filter((el, idx) => idx !== dateIndex);
    this.appliedDates.emit(this.datesValues);
    this.datesControl.setValue(this.datesValues);
    this.cdr.detectChanges();
  }

  createCalendarButtons(ejCalendar: CalendarComponent): void {
    const applyBtn: HTMLElement = this.renderer2.createElement('button');
    const cancelBtn: HTMLElement = this.renderer2.createElement('button');
    const calendarFooterElement = this.renderer2.createElement('div');

    calendarFooterElement.className = 'e-footer-container';
    cancelBtn.className = 'e-btn e-flat e-cancel';
    cancelBtn.textContent = 'Cancel';
    applyBtn.className = 'e-btn e-flat e-apply e-primary';
    applyBtn.textContent = 'Apply';

    this.renderer2.appendChild(calendarFooterElement, cancelBtn);
    this.renderer2.appendChild(calendarFooterElement, applyBtn);

    ejCalendar.element.appendChild(calendarFooterElement);

    this.applyListenerRemover =
      this.renderer2.listen(applyBtn, 'click', this.applyListener.bind(this));
    this.cancelListenerRemover =
      this.renderer2.listen(cancelBtn, 'click', this.cancelListener.bind(this));

    this.cdr.detectChanges();
  }

  private outerClickListener(event: MouseEvent): void {
    const clickedInside = this.inputWrapper.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.isCalendarShow = false;
      this.cdr.detectChanges();
    }
  }

  private applyListener(): void {
    this.appliedDatesValues = this.datesValues;
    this.appliedDates.emit(this.datesValues);
    this.datesControl.setValue(this.datesValues);
    this.lastdatevalue = new Date(this.datesValues[this.datesValues.length - 1]);
    this.isCalendarShow = false;
    this.cdr.detectChanges();
  }

  private cancelListener(): void {
    const appliedDatesHash = this.appliedDatesValues.reduce((acc: Record<string, Date>, date) => {
      acc[date.toISOString()] = date;

      return acc;
    }, {});

    this.datesValues = this.datesValues.filter(el => appliedDatesHash[el.toISOString()]);

    this.isCalendarShow = false;
    this.cdr.detectChanges();
  }

  private startDatesControlWatching(): void {
    this.datesControl.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value) => {
      this.datesValues = value;
      this.cdr.detectChanges();
    });
  }
}
