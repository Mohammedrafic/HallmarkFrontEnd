import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AgencyContactDetails } from "src/app/shared/models/agency.model";

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

  static createFormGroup(contactDetails?: AgencyContactDetails): FormGroup {
    return new FormGroup({
      title: new FormControl(contactDetails ? contactDetails.title : '', [Validators.maxLength(100)]),
      contactPerson: new FormControl(contactDetails ? contactDetails.contactPerson : '', [Validators.required, Validators.maxLength(100)]),
      phone1: new FormControl(contactDetails ? contactDetails.phone1 : '', [Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]),
      email: new FormControl(contactDetails ? contactDetails.email : '', [Validators.email]),
    });
  }
}
