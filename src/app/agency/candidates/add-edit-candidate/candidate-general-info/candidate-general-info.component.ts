import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Select, Store } from '@ngxs/store';
import { CheckBoxSelectionService } from '@syncfusion/ej2-angular-dropdowns';
import { Observable } from 'rxjs';
import { GetAgencyByPage } from 'src/app/agency/store/agency.actions';
import { AgencyState } from 'src/app/agency/store/agency.state';
import { GetAllSkills } from 'src/app/agency/store/candidate.actions';
import { CandidateState } from 'src/app/agency/store/candidate.state';
import { CandidateStatus } from "src/app/shared/enums/status";
import { valuesOnly } from 'src/app/shared/utils/enum.utils';

enum Classification {
  Alumni = 0,
  International = 1,
  Interns = 2,
  Locums = 3,
  Students = 4,
  Volunteers = 5
}
@Component({
  selector: 'app-candidate-general-info',
  templateUrl: './candidate-general-info.component.html',
  styleUrls: ['./candidate-general-info.component.scss'],
  providers: [CheckBoxSelectionService]
})
export class CandidateGeneralInfoComponent {
  @Input() formGroup: FormGroup;

  @Select(AgencyState.agencies)
  agencies$: Observable<any>;

  @Select(CandidateState.skills)
  skills$: Observable<any>;

  public agencyFields = {
    text: 'createUnder.name',
    value: 'createUnder.id',
  };

  public optionFields = {
    text: 'text',
    value: 'id',
  };

  public skillsFields = {
    text: 'skillDescription',
    value: 'id',
  };

  public statuses = Object.values(CandidateStatus)
    .filter(valuesOnly)
    .map((text, id) => ({ text, id }));

  public classifications = Object.values(Classification)
    .filter(valuesOnly)
    .map((text, id) => ({ text, id }));

  constructor(private store: Store) {
    store.dispatch([new GetAgencyByPage(1, 100), new GetAllSkills()]); // TODO: needed until we dont have agency switcher in the header
  }

  static createFormGroup(): FormGroup {
    return new FormGroup({
      agencyId: new FormControl(null, [Validators.required]),
      firstName: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      middleName: new FormControl(null, [Validators.maxLength(10)]),
      lastName: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      email: new FormControl(null, [Validators.required, Validators.email, Validators.maxLength(20)]),
      dob: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
      classification: new FormControl(null),
      candidateProfileSkills: new FormControl(null, [Validators.required]),
      profileStatus: new FormControl(2, [Validators.required]),
      candidateAgencyStatus: new FormControl(2, [Validators.required]),
      ssn: new FormControl('', [Validators.required, Validators.minLength(9), Validators.pattern(/^[0-9\s\-]+$/)]),
    });
  }
}
