import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHideBeforeSyncfusionLoad]',
})
export class HideBeforeSyncfusionLoadDirective {
  constructor(private renderer: Renderer2, hostElement: ElementRef) {
    renderer.addClass(hostElement.nativeElement, 'hideBtn');
  }
}
