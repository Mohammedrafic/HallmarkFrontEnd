import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ListOfSkills, Skill } from '@shared/models/skill.model';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { CheckBoxSelectionService } from '@syncfusion/ej2-angular-dropdowns';
import { filter, Observable, takeUntil } from 'rxjs';
import { GetAllSkills } from 'src/app/agency/store/candidate.actions';
import { CandidateState } from 'src/app/agency/store/candidate.state';
import { CandidateStatus, CreatedCandidateStatus } from 'src/app/shared/enums/status';
import { valuesOnly } from 'src/app/shared/utils/enum.utils';
import { JobDistributionMasterSkills } from '@shared/models/associate-organizations.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { GetRegionList } from '@shared/components/candidate-list/store/candidate-list.actions';
import { CandidateListState } from '@shared/components/candidate-list/store/candidate-list.state';

enum Classification {
  Alumni = 0,
  International = 1,
  Interns = 2,
  Locums = 3,
  Students = 4,
  Volunteers = 5,
}
@Component({
  selector: 'app-candidate-general-info',
  templateUrl: './candidate-general-info.component.html',
  styleUrls: ['./candidate-general-info.component.scss'],
  providers: [CheckBoxSelectionService, MaskedDateTimeService],
})
export class CandidateGeneralInfoComponent extends DestroyableDirective implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() selectedSkills: JobDistributionMasterSkills[] | undefined;

  @Input() set isCandidateCreated(value: boolean | null) {
    this.enableStatusFields = value as boolean;
    this.statuses = Object.values(value ? CreatedCandidateStatus : CandidateStatus)
      .filter(valuesOnly)
      .map((text, id) => ({ text, id }));
  }

  @Select(CandidateState.skills)
  private skills$: Observable<ListOfSkills[]>;
  @Select(CandidateListState.listOfRegions)
  public regions$: Observable<string[]>;

  public skills: ListOfSkills[];
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
    text: 'name',
    value: 'id',
  };
  public statuses: any;
  public classifications = Object.values(Classification)
    .filter(valuesOnly)
    .map((text, id) => ({ text, id }));

  constructor(private store: Store) {
    super();

    store.dispatch(new GetAllSkills());
  }

  ngOnInit(): void {
    this.getCandidateSkills();
    this.getRegions();
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
      candidateProfileRegions: new FormControl(null, [Validators.required]),
      ssn: new FormControl(null, [Validators.minLength(9)]),
    });
  }

  private getCandidateSkills(): void {
    this.skills$
      .pipe(
        filter((skills: ListOfSkills[]) => skills?.length !== 0),
        takeUntil(this.destroy$)
      )
      .subscribe((skills: ListOfSkills[]) => {
        this.skills = skills;
        const updatedSkills = this.selectedSkills?.map((skill: Skill) => skill.id);
        this.formGroup.get('candidateProfileSkills')?.patchValue(updatedSkills);
      });
  }

  private getRegions(): void {
    this.store.dispatch(new GetRegionList());
  }
}
