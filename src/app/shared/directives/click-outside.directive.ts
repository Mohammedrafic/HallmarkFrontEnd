import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
})
export class ClickOutsideDirective {
  @Input()
  public exclude: HTMLElement | HTMLElement[];

  @Output()
  public clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event.target'])
  public onClick(target: HTMLElement): void {
    const clickedInside = this.elementRef.nativeElement.contains(target);

    if (!clickedInside && !toArray(this.exclude).includes(target)) {
      this.clickOutside.emit();
    }
  }
}

function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}
