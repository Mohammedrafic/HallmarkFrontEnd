import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Select, Store } from '@ngxs/store';
import { MaskedDateTimeService } from "@syncfusion/ej2-angular-calendars";
import { CheckBoxSelectionService } from '@syncfusion/ej2-angular-dropdowns';
import { Observable } from 'rxjs';
import { GetAllSkills } from 'src/app/agency/store/candidate.actions';
import { CandidateState } from 'src/app/agency/store/candidate.state';
import { CandidateStatus, CreatedCandidateStatus } from "src/app/shared/enums/status";
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
  providers: [CheckBoxSelectionService, MaskedDateTimeService]
})
export class CandidateGeneralInfoComponent {
  @Input() formGroup: FormGroup;

  @Input() set isCandidateCreated(value: boolean | null) {
    this.enableStatusFields = value as boolean;
    this.statuses = Object.values(value ? CreatedCandidateStatus : CandidateStatus)
      .filter(valuesOnly)
      .map((text, id) => ({ text, id }));
  }

  @Select(CandidateState.skills)
  skills$: Observable<any>;

  public readonly limitDate: Date = new Date();

  public enableStatusFields = false;

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

  public statuses: any;

  public classifications = Object.values(Classification)
    .filter(valuesOnly)
    .map((text, id) => ({ text, id }));

  constructor(private store: Store) {
    store.dispatch(new GetAllSkills());
  }

  static createFormGroup(): FormGroup {
    return new FormGroup({
      firstName: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      middleName: new FormControl(null, [Validators.maxLength(10)]),
      lastName: new FormControl(null, [Validators.required, Validators.maxLength(50)]),
      dob: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
      classification: new FormControl(null),
      candidateProfileSkills: new FormControl(null, [Validators.required]),
      profileStatus: new FormControl(2, [Validators.required]),
      candidateAgencyStatus: new FormControl(2, [Validators.required]),
      ssn: new FormControl(null),
    });
  }
}
