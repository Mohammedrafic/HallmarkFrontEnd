import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { BaseFormControlDirective } from '@shared/components/form-controls/base-form-control.directive';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => TextareaComponent), multi: true },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TextareaComponent), multi: true }
  ]
})
export class TextareaComponent extends BaseFormControlDirective implements OnInit {
  @Input() public maxlength: number;
  @Input() public cssClass: string;
  @Input() public htmlAttributes: { [key: string]: string }[];

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

}
