import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

import { DatesRangeType } from '@shared/enums';

@Directive({
  selector: '[weeksEnd]',
})
export class WeeksEndDirective implements OnChanges {
  @Input() date: string;
  @Input() weekStartDay: number;
  @Input() selectedPeriod: DatesRangeType;
  @Input() noBorder = true;

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngOnChanges(): void {
    if (this.date && this.selectedPeriod === DatesRangeType.TwoWeeks && !this.noBorder) {
      const dayIndex = new Date(`${this.date}T00:00:00`).getDay();
      
      this.setBorderStyle(dayIndex);
    }

    if (this.noBorder) {
      this.renderer.removeStyle(this.element.nativeElement, 'border-right');
    }
  }

  private setBorderStyle(dayIndex: number): void {
    if (dayIndex === this.weekStartDay) {
      this.addLeftBorder();
      return;
    }

    if (dayIndex === this.weekStartDay - 1) {
      this.addRightBorder();
      return;
    }
  }

  private addRightBorder(): void {
    this.renderer.setStyle(this.element.nativeElement, 'border-right', '1px solid #d1d6e2');
  }

  private addLeftBorder(): void {
    this.renderer.setStyle(this.element.nativeElement, 'border-left', '1px solid #d1d6e2');
    this.renderer.removeClass(this.element.nativeElement, 'left-border');
  }
}
