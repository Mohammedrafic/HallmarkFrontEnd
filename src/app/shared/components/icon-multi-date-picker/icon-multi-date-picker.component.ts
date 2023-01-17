import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { CalendarComponent } from '@syncfusion/ej2-angular-calendars';

import { Destroyable } from '@core/helpers';

@Component({
  selector: 'app-icon-multi-date-picker',
  templateUrl: './icon-multi-date-picker.component.html',
  styleUrls: ['./icon-multi-date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconMultiDatePickerComponent extends Destroyable implements AfterViewInit, OnDestroy {
  @ViewChild('inputWrapper') inputWrapper: ElementRef;

  @Input() datesValues: Date[] = [];
  @Input() minDate: Date;
  @Input() maxDate: Date;

  @Output() appliedDates: EventEmitter<Date[]> = new EventEmitter<Date[]>();

  isCalendarShown = false;

  private appliedDatesValues: Date[] = [];
  private outerClickRemover: () => void;
  private applyListenerRemover: () => void;
  private cancelListenerRemover: () => void;

  constructor(private renderer2: Renderer2, private cdr: ChangeDetectorRef) {
    super();
  }

  ngAfterViewInit(): void {
    this.outerClickRemover = this.renderer2.listen('document', 'click', this.outerClickListener.bind(this));
  }

  override ngOnDestroy(): void {
    this.outerClickRemover();
  }

  openMenu(): void {
    this.isCalendarShown = !this.isCalendarShown;
  }

  calendarDestroyed(): void {
    this.applyListenerRemover();
    this.cancelListenerRemover();
  }

  datesValuesChange(event: Date[]): void {
    this.datesValues = event;
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

    this.applyListenerRemover = this.renderer2.listen(applyBtn, 'click', this.applyListener.bind(this));
    this.cancelListenerRemover = this.renderer2.listen(cancelBtn, 'click', this.cancelListener.bind(this));

    this.cdr.detectChanges();
  }

  private outerClickListener(event: MouseEvent): void {
    const clickedInside = this.inputWrapper.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.isCalendarShown = false;
      this.cdr.detectChanges();
    }
  }

  private applyListener(): void {
    this.appliedDatesValues = this.datesValues;
    this.appliedDates.emit(this.datesValues);
    this.isCalendarShown = false;
    this.cdr.detectChanges();
  }

  private cancelListener(): void {
    const appliedDatesHash = this.appliedDatesValues.reduce((acc: Record<string, Date>, date: Date) => {
      acc[date.toISOString()] = date;

      return acc;
    }, {});

    this.datesValues = this.datesValues.filter(el => appliedDatesHash[el.toISOString()]);

    this.isCalendarShown = false;
    this.cdr.detectChanges();
  }
}
