import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { delay, distinctUntilChanged, filter, Observable, takeUntil } from 'rxjs';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { CheckBoxSelectionService } from '@syncfusion/ej2-angular-dropdowns';

import { MasterSkill, Skill } from '@shared/models/skill.model';
import { CandidateState } from 'src/app/agency/store/candidate.state';
import { JobDistributionMasterSkills } from '@shared/models/associate-organizations.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { CandidateListState } from '@shared/components/candidate-list/store/candidate-list.state';
import { Classifications, DefaultOptionFields, SkillFields } from "./candidate-general-info.constants";
import { CandidateGeneralInfoService } from "./candidate-general-info.service";
import { ssnValidator } from '../../../../shared/validators/ssn.validator';
import { datepickerMask } from '@shared/constants';

@Component({
  selector: 'app-candidate-general-info',
  templateUrl: './candidate-general-info.component.html',
  styleUrls: ['./candidate-general-info.component.scss'],
  providers: [CheckBoxSelectionService, MaskedDateTimeService],
})
export class CandidateGeneralInfoComponent extends DestroyableDirective implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() selectedSkills: JobDistributionMasterSkills[] | undefined;
  @Output() changedSSN = new EventEmitter<string>();

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
  public readonly maskPlaceholder = datepickerMask;

  @Input() maskSSNPattern: string = '000-00-0000';
  @Input() maskedSSN: string = '';

  constructor(private store: Store,
              private candidateGeneralInfoService: CandidateGeneralInfoService) {
    super();
  }

  ngOnInit(): void {
    this.getCandidateSkills();
    this.formGroup.get('ssn')?.valueChanges.pipe(
      delay(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((ssnValue: any) => {
      if(ssnValue != null &&  ssnValue.indexOf('XXX-XX') == -1){
        this.maskedSSN = ssnValue;
      }
    });
  }


  public onSSNBlur(): void {
    if(this.maskedSSN != null &&  this.maskedSSN.trim().length > 0 && this.maskedSSN.trim().length >= 9){
      this.maskSSNPattern = "AAA-AA-0000";
      if(this.formGroup.controls['ssn'].valid){
        this.formGroup.controls['ssn'].clearValidators();
        this.formGroup.controls['ssn'].updateValueAndValidity({emitEvent : false});
        this.formGroup.controls['ssn'].markAsTouched();
        this.formGroup.get('ssn')?.setValue("XXX-XX-" + this.maskedSSN.slice(-4));
        this.changedSSN.emit(this.maskedSSN);
      }
    }else{
      this.changedSSN.emit('');
    }

  }

  public onSSNFocus(): void {
      this.maskSSNPattern = "000-00-0000";
      this.formGroup.get('ssn')?.setValue(this.maskedSSN);
      this.formGroup.controls['ssn'].addValidators([ssnValidator()]);
      this.formGroup.controls['ssn'].updateValueAndValidity({emitEvent : false});
      this.formGroup.controls['ssn']?.markAsTouched();
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
      ssn: new FormControl(''),
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
