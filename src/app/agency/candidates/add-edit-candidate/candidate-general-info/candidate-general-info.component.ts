import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { filter, Observable, takeUntil } from 'rxjs';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { CheckBoxSelectionService } from '@syncfusion/ej2-angular-dropdowns';

import { MasterSkill, Skill } from '@shared/models/skill.model';
import { GetAllSkills } from 'src/app/agency/store/candidate.actions';
import { CandidateState } from 'src/app/agency/store/candidate.state';
import { JobDistributionMasterSkills } from '@shared/models/associate-organizations.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { GetRegionList } from '@shared/components/candidate-list/store/candidate-list.actions';
import { CandidateListState } from '@shared/components/candidate-list/store/candidate-list.state';
import { Classifications, DefaultOptionFields, SkillFields } from "./candidate-general-info.constants";
import { CandidateGeneralInfoService } from "./candidate-general-info.service";
import { ssnValidator } from '../../../../shared/validators/ssn.validator';

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
    this.statuses = this.candidateGeneralInfoService.getStatuses(false);
  }

  @Select(CandidateListState.listOfRegions)
  public regions$: Observable<string[]>;

  @Select(CandidateState.skills)
  private skills$: Observable<MasterSkill[]>;

  public skills: MasterSkill[];
  public statuses: { text: string, id: number }[];
  public enableStatusFields = false;

  public readonly limitDate: Date = new Date();
  public readonly optionFields = DefaultOptionFields;
  public readonly skillsFields = SkillFields;
  public readonly classifications = Classifications;

  constructor(private store: Store,
              private candidateGeneralInfoService: CandidateGeneralInfoService) {
    super();
  }

  ngOnInit(): void {
    this.getCandidateSkills();
    this.store.dispatch([new GetAllSkills(), new GetRegionList()]);
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
      ssn: new FormControl('', [ssnValidator()]),
    });
  }

  private getCandidateSkills(): void {
    this.skills$
      .pipe(
        filter((skills: MasterSkill[]) => !!skills?.length),
        takeUntil(this.destroy$)
      )
      .subscribe((skills: MasterSkill[]) => {
        this.skills = skills;
        const updatedSkills = this.selectedSkills?.map((skill: Skill) => skill.id);
        this.formGroup.get('candidateProfileSkills')?.patchValue(updatedSkills);
      });
  }
}
