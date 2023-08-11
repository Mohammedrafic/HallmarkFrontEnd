import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { CustomFormGroup } from '@core/interface';

import {
  ContactDetailsForm,
  DemographicsForm,
  EmployeeProfileData,
  ProfessionalDetailsForm,
  ProfileInformationConfig,
  ProfileInformationFormsFieldConfig,
} from '../../../interfaces/profile-information-form.interface';

@Injectable()
export class EmployeeProfileFormService {

  constructor(private fb: FormBuilder) {}

  createDemographicsForm(): CustomFormGroup<DemographicsForm> {
    return this.fb.group({
      firstName: [null, Validators.required],
      middleName: [null],
      lastName: [null, Validators.required],
      dob: [null],
    }) as CustomFormGroup<DemographicsForm>;
  }

  createProfessionalDetailsForm(): CustomFormGroup<ProfessionalDetailsForm> {
    return this.fb.group({
      primarySkillId: [null, Validators.required],
      secondarySkills: [null],
      hireDate: [null],
      employeeId: [null, Validators.required],
    }) as CustomFormGroup<ProfessionalDetailsForm>;
  }

  createContactDetailsForm(): CustomFormGroup<ContactDetailsForm> {
    return this.fb.group({
      country: [null, Validators.required],
      address1: [null],
      city: [null, Validators.required],
      state: [null, Validators.required],
      zipCode: [null, Validators.required],
      personalEmail: [null, Validators.required],
      workEmail: [null],
      phone1: [null, Validators.required],
      phone2: [null],
    }) as CustomFormGroup<ContactDetailsForm>;
  }

  setTooltips(data: EmployeeProfileData, formsConfig: ProfileInformationConfig) {
    const primarySkillField = this.getConfigField('primarySkillId', formsConfig);
    const secondarySkillsField = this.getConfigField('secondarySkills', formsConfig);
    const employeeIdField = this.getConfigField('employeeId', formsConfig);

    if (primarySkillField && primarySkillField.readonly) {
      primarySkillField.tooltipContent = data.skills
        .find((item) => item.value === data.employeeDTO.primarySkillId)?.text || '';
    }

    if (secondarySkillsField && secondarySkillsField.readonly) {
      secondarySkillsField.tooltipContent = this.getSecondarySkillsFieldTooltip(data);
    }

    if (employeeIdField && employeeIdField.readonly) {
      employeeIdField.tooltipContent = data.employeeDTO.employeeId || '';
    }
  }

  private getConfigField(
    field: string,
    formsConfig: ProfileInformationConfig
  ): ProfileInformationFormsFieldConfig | undefined {
    return formsConfig.professionalDetails.fields.find((item) => item.field === field);
  }

  private getSecondarySkillsFieldTooltip(data: EmployeeProfileData): string {
    const skills: string[] = data.employeeDTO.secondarySkills.map((skillId) => {
      return data.skills.find((item) => item.value === skillId)?.text || '';
    });

    if (!skills.length) {
      return '';
    }

    return `<pre class="schedule-custom-tooltip-container">${skills.join('<br>')}</pre>`;
  }
}
