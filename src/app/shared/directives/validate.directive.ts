import { Directive, ElementRef, OnInit, ViewContainerRef } from '@angular/core';
import { NgControl } from '@angular/forms';

import { ErrorMessageComponent } from '../components/error-message/error-message.component';

@Directive({
  selector: '[appValidateWithMessage]',
})
export class ValidateDirective implements OnInit {
  constructor(
    private control: NgControl,
    private element: ElementRef,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    const errorMessageComponent = this.viewContainerRef.createComponent(ErrorMessageComponent);
    errorMessageComponent.instance.control = this.control.control;

    const host = this.element.nativeElement.parentElement;
    host.insertBefore(errorMessageComponent.location.nativeElement, host.firstChild.nextSibling)
  }
}
