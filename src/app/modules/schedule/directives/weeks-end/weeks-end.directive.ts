import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

import { WeekDays } from '@shared/enums';

@Directive({
  selector: '[weeksEnd]',
})
export class WeeksEndDirective implements OnInit {
  @Input() date: string;
  @Input() day: WeekDays;

  constructor(private element: ElementRef,
              private renderer: Renderer2) {}

  ngOnInit(): void {
    const saturday = 6;
    const sunday = 0;
    const dayIndex = new Date(`${this.date}T00:00:00`).getDay();

    if (this.day && this.day === WeekDays.Sat || dayIndex === saturday) {
      this.addRightBorder();
      return;
    }

    if (this.day && this.day === WeekDays.Sun || dayIndex === sunday) {
      this.addLeftBorder();
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
