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
      country: new FormControl(''),
      state: new FormControl(''),
      city: new FormControl('', [Validators.maxLength(20)]),
      zipCode: new FormControl('', [Validators.minLength(5), Validators.maxLength(6), Validators.pattern(/^[0-9]+$/)]),
      address: new FormControl('', [Validators.maxLength(100)]),
      phone1: new FormControl('', [Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]),
      phone2: new FormControl('', [Validators.pattern(/^\d{3}-\d{3}-\d{4}$/)]),
    });
  }
}
