import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[weeksEnd]',
})
export class WeeksEndDirective implements OnInit {
  @Input() date: string;

  constructor(private element: ElementRef,
              private renderer: Renderer2) {}

  ngOnInit(): void {
    const saturday = 6;
    const sunday = 0;
    const day = new Date(`${this.date}T00:00:00`).getDay();

    if (day === saturday) {
      this.renderer.setStyle(this.element.nativeElement, 'border-right', '1px solid #9198AC');
      return;
    }

    if (day === sunday) {
      this.renderer.setStyle(this.element.nativeElement, 'border-left', '1px solid #9198AC');
      return;
    }
  }
}
