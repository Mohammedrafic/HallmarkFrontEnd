import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ChangeEventArgs } from "@syncfusion/ej2-angular-dropdowns";
import { Subject } from "rxjs";
import { CanadaStates, Country, UsaStates } from "src/app/shared/enums/states";

@Component({
  selector: 'app-candidate-contact-details',
  templateUrl: './candidate-contact-details.component.html',
  styleUrls: ['./candidate-contact-details.component.scss']
})
export class CandidateContactDetailsComponent {
  @Input() formGroup: FormGroup;

  public optionFields = {
    text: 'text',
    value: 'id',
  };
  public countries = [
    { id: Country.USA, text: Country[0] },
    { id: Country.Canada, text: Country[1] },
  ];
  public states$ = new Subject();

  public onCountryChange(event: ChangeEventArgs): void {
    this.states$.next(event.value === Country.USA ? UsaStates : CanadaStates);
  }

  static createFormGroup(): FormGroup {
    return new FormGroup({
      email: new FormControl(null, [Validators.email, Validators.maxLength(200), Validators.pattern(/\S+@\S+\.com/)]),
      country: new FormControl(null),
      state: new FormControl(null),
      city: new FormControl(null, [Validators.maxLength(20)]),
      zip: new FormControl(null, [Validators.minLength(5), Validators.maxLength(6), Validators.pattern(/^[0-9]+$/)]),
      address1: new FormControl(null, [Validators.maxLength(100)]),
      address2: new FormControl(null, [Validators.maxLength(100)]),
      phone1: new FormControl(null, [Validators.minLength(10), Validators.pattern(/^[0-9]+$/)]),
      phone2: new FormControl(null, [Validators.minLength(10), Validators.pattern(/^[0-9]+$/)]),
    });
  }
}
