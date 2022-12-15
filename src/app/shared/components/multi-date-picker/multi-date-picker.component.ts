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

// TODO need to do:
//  design chips;
//  open calendar -> select dates -> press Cancel -> open again calendar -> dates MUST BE NOT selected;
@Component({
  selector: 'app-multi-date-picker',
  templateUrl: './multi-date-picker.component.html',
  styleUrls: ['./multi-date-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiDatePickerComponent extends Destroyable implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('inputWrapper') inputWrapper: ElementRef;

  @Input() datesControl: FormControl = new FormControl([]);
  @Input() title: string;
  @Input() set valueSetter(dates: Date[]) {
    this.datesControl.setValue(dates);
  }

  @Output() appliedDates: EventEmitter<Date[]> = new EventEmitter<Date[]>();

  isCalendarShow = false;
  datesValues: Date[] = [];

  private outerClickRemover: () => void;
  private applyListenerRemover: () => void;
  private cancelListenerRemover: () => void;

  constructor(private renderer2: Renderer2, private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.startDatesControlWatching();
  }

  ngAfterViewInit(): void {
    this.outerClickRemover = this.renderer2.listen('document', 'click', this.targetClickListener.bind(this));
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();

    this.outerClickRemover();
  }

  openMenu(): void {
    this.isCalendarShow = !this.isCalendarShow;
  }

  calendarCreated(ejCalendar: CalendarComponent): void {
    this.createCalendarButtons(ejCalendar);
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

  private targetClickListener(event: MouseEvent): void {
    const clickedInside = this.inputWrapper.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.isCalendarShow = false;
      this.cdr.detectChanges();
    }
  }

  private applyListener(): void {
    this.appliedDates.emit(this.datesValues);
    this.datesControl.setValue(this.datesValues);
    this.isCalendarShow = false;
    this.cdr.detectChanges();
  }

  private cancelListener(): void {
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

  private createCalendarButtons(ejCalendar: CalendarComponent): void {
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
}
