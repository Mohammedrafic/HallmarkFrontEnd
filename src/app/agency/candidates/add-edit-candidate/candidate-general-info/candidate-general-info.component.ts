import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: 'app-candidate-general-info',
  templateUrl: './candidate-general-info.component.html',
  styleUrls: ['./candidate-general-info.component.scss']
})
export class CandidateGeneralInfoComponent {
  @Input() formGroup: FormGroup;

  public optionFields = {
    text: 'text',
    value: 'id',
  };

  static createFormGroup(): FormGroup {
    return new FormGroup({
      agencyId: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      middleName: new FormControl('', [Validators.maxLength(10)]),
      lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(20)]),
      dob: new FormControl('', [Validators.maxLength(100)]),
      region: new FormControl(''),
      classification: new FormControl(''),
      candidateProfileSkills: new FormControl('', [Validators.required]),
      profileStatus: new FormControl('', [Validators.required]),
      candidateAgencyStatus: new FormControl('', [Validators.required]),
      ssn: new FormControl('', [Validators.required, Validators.minLength(9), Validators.pattern(/^[0-9\s\-]+$/)]),
    });
  }
}
