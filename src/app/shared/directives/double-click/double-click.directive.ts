import { Directive, EventEmitter, HostListener, NgZone, Output } from '@angular/core';
import { OutsideZone } from '@core/decorators';

@Directive({
  selector: '[appDoubleClick]',
})
export class DoubleClickDirective {
  @Output() dbClick: EventEmitter<void> = new EventEmitter();
  @Output() singleClick: EventEmitter<void> = new EventEmitter();

  timer: ReturnType<typeof setTimeout>;
  stopClickEvent = false;

  private readonly delay = 250;

  constructor( private readonly ngZone: NgZone) {}

  @OutsideZone
  @HostListener('click') emitClick(): void {
    clearTimeout(this.timer);
    this.stopClickEvent = false;
    this.timer = setTimeout(() => {
      if (!this.stopClickEvent) {
        this.singleClick.emit();
      }
    }, this.delay);
  }

  @HostListener('dblclick') emitDbClick(): void {
    this.stopClickEvent = true;
    clearTimeout(this.timer);
    this.dbClick.emit();
  }
}
