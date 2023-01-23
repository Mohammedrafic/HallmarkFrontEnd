import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import { CalendarComponent } from '@syncfusion/ej2-angular-calendars';

import { DatePickerLimitations } from '@shared/components/icon-multi-date-picker/icon-multi-date-picker.interface';
import { Destroyable } from '@core/helpers';

@Component({
  selector: 'app-icon-multi-date-picker',
  templateUrl: './icon-multi-date-picker.component.html',
  styleUrls: ['./icon-multi-date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconMultiDatePickerComponent extends Destroyable implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('inputWrapper') inputWrapper: ElementRef;

  @Input() dates: Date[] = [];
  @Input() datePickerLimitations: DatePickerLimitations;

  @Output() appliedDates: EventEmitter<Date[]> = new EventEmitter<Date[]>();

  isCalendarShown = false;
  datesValues: Date[] = [];

  private outerClickRemover: () => void;
  private applyListenerRemover: () => void;
  private cancelListenerRemover: () => void;

  constructor(private renderer2: Renderer2, private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dates']?.currentValue) {
      this.datesValues = [...changes['dates'].currentValue];
    }
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

    this.applyListenerRemover = this.renderer2.listen(applyBtn, 'click', this.applyDates.bind(this));
    this.cancelListenerRemover = this.renderer2.listen(cancelBtn, 'click', this.cancelChanges.bind(this));

    this.cdr.detectChanges();
  }

  private outerClickListener(event: MouseEvent): void {
    const clickedInside = this.inputWrapper.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.cancelChanges();
    }
  }

  private applyDates(): void {
    this.appliedDates.emit(this.datesValues);
    this.isCalendarShown = false;
    this.cdr.detectChanges();
  }

  private cancelChanges(): void {
    this.datesValues = [...this.dates];
    this.isCalendarShown = false;
    this.cdr.detectChanges();
  }
}
