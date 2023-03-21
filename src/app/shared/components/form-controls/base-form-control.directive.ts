import get from 'lodash/fp/get';

import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, FormGroup, ValidationErrors, Validator } from '@angular/forms';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';

@Directive()
export class BaseFormControlDirective
  extends DestroyableDirective
  implements ControlValueAccessor, Validator, OnChanges
{
  @Input() public controlName: string;
  @Input() public formGroupInstance: FormGroup;
  @Input() public id: string;
  @Input() public label: string;
  @Input() public tabindex: number = 0;
  @Input() public placeholder: string;
  @Input() public required: boolean;
  @Input() public disabled = false;
  @Input() public enabled = true;

  private value: any;

  public ngOnChanges(changes: SimpleChanges): void {
    const { disabled } = changes;

    if (disabled) {
      this.setDisableState(this.disabled);
    }
  }

  public registerOnChange(fn: any): void {}

  public registerOnTouched(fn: any): void {}

  public writeValue(value: any): void {
    this.value = value;
  }

  public get isValid(): boolean {
    const control: AbstractControl = this.getControl();
    return get('valid', control);
  }

  public getControl(): AbstractControl {
    return this.formGroupInstance && this.formGroupInstance.get(this.controlName)!;
  }

  public onBlur(): void {
    this.getControl().updateValueAndValidity();
  }

  public validate(c: FormControl): ValidationErrors | null {
    const validationErrors = { validationError: true };
    return this.isValid ? null : validationErrors;
  }

  protected getValue(): any {
    const control: AbstractControl = this.getControl();
    return get('value', control);
  }

  private setDisableState(isDisabled: boolean): void {
    this.getControl()?.[isDisabled ? 'disable' : 'enable']();
  }
}
