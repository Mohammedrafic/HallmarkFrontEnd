import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-details-group',
  templateUrl: './contact-details-group.component.html',
  styleUrls: ['./contact-details-group.component.scss'],
})
export class ContactDetailsGroupComponent {
  @Input() formGroup: FormGroup;
  @Input() isRemovable: boolean;
  @Output() deleteContactEvent = new EventEmitter<never>()

  public removeContact(): void {
    this.deleteContactEvent.emit();
  }

  static createFormGroup(): FormGroup {
    return new FormGroup({
      title: new FormControl('', [Validators.maxLength(100)]),
      contactPerson: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      phoneNumberExt: new FormControl('', [Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]),
      email: new FormControl('', [Validators.email]),
    });
  }
}
