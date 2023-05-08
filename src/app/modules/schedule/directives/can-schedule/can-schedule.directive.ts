import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

import { PositionDragEvent } from '../../interface';

@Directive({
  selector: '[canSchedule]',
})
export class CanScheduleDirective implements OnChanges {
  @Input() dragDate: string;
  @Input() dragEvent: PositionDragEvent | null;

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['dragEvent']?.currentValue?.action) {
      this.renderer.setStyle(this.element.nativeElement, 'opacity', '0.2');
      this.setClassForSelectedSlot();
    } else {
      this.renderer.setStyle(this.element.nativeElement, 'opacity', '1');
      this.renderer.removeClass(this.element.nativeElement, 'preview-drag-slots');
    }
  }

  private setClassForSelectedSlot(): void {
    const dragElementDate = this.dragDate.split('T')[0];

    if(dragElementDate === this.dragEvent?.date) {
      this.renderer.addClass(this.element.nativeElement, 'preview-drag-slots');
    }
  }
}
