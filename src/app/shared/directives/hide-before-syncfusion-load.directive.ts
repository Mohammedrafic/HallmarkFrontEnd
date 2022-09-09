import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[hideBeforeSyncfusionLoad]',
})
export class HideBeforeSyncfusionLoadDirective {
  constructor(private renderer: Renderer2, hostElement: ElementRef) {
    renderer.addClass(hostElement.nativeElement, 'hideBtn');
  }
}
