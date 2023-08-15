import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
})
export class ErrorMessageComponent {
  @Input() control: AbstractControl | null;
}
