import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ChangeEventArgs } from '@syncfusion/ej2-buttons';
import { BaseFormControlDirective } from '@shared/components/form-controls/base-form-control.directive';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
})
export class ToggleComponent extends BaseFormControlDirective {
  @Input('value') public toggleChecked: boolean;
  @Output() public checked: EventEmitter<boolean> = new EventEmitter();

  constructor() {
    super();
  }

  public get toggleValue(): boolean {
    return this.getControl()?.value ?? this.toggleChecked;
  }

  public onChange({ checked }: ChangeEventArgs): void {
    this.checked.emit(checked);
    this.getControl()?.setValue(checked);
  }
}
