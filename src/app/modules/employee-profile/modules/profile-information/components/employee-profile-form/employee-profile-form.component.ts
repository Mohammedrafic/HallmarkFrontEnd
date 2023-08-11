import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { FieldType } from '@core/enums';
import { CustomFormGroup } from '@core/interface';

import { ProfileInformationFormsSourceKeys } from '../../enums';
import { EmployeeProfileFormSourceMap, ProfileInformationConf } from '../../constants';
import {
  EmployeeDTO,
  ContactDetailsForm,
  DemographicsForm,
  EmployeeProfileData,
  ProfessionalDetailsForm,
  ProfileInformationConfig,
} from '../../interfaces';
import { EmployeeProfileFormService } from './services/employee-profile-form.service';

@Component({
  selector: 'app-employee-profile-form',
  templateUrl: './employee-profile-form.component.html',
  styleUrls: ['./employee-profile-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeProfileFormComponent {
  @Input() set employeeProfileData(data: EmployeeProfileData) {
    this.setComponentData(data);
  }

  // TODO: find the better solution to replace any
  readonly formSourceMap: any = EmployeeProfileFormSourceMap; // we need any here to fix errors in the template
  readonly formsConfig: ProfileInformationConfig = ProfileInformationConf;
  readonly fieldTypes = FieldType;
  readonly dropDownFields = { text: 'text', value: 'value' };

  readonly demographicsForm: CustomFormGroup<DemographicsForm> =
    this.formService.createDemographicsForm();
  readonly professionalDetailsForm: CustomFormGroup<ProfessionalDetailsForm> =
    this.formService.createProfessionalDetailsForm();
  readonly contactDetailsForm: CustomFormGroup<ContactDetailsForm> =
    this.formService.createContactDetailsForm();

  constructor(private formService: EmployeeProfileFormService) { }

  private setComponentData(data: EmployeeProfileData) {
    if (data) {
      this.setFormSourceMap(data);
      this.setFormsValues(data.employeeDTO);
      this.formService.setTooltips(data, this.formsConfig);
    }
  }

  private setFormSourceMap(data: EmployeeProfileData): void {
    this.formSourceMap[ProfileInformationFormsSourceKeys.PrimarySkill] = data.skills;
    this.formSourceMap[ProfileInformationFormsSourceKeys.SecondarySkill] = data.skills;
    this.formSourceMap[ProfileInformationFormsSourceKeys.State] = data.states;
    this.formSourceMap[ProfileInformationFormsSourceKeys.Country] = data.countries;
  }

  private setFormsValues(employeeDTO: EmployeeDTO) {
    this.demographicsForm.setValue({
      firstName: employeeDTO.firstName,
      middleName: employeeDTO.middleName,
      lastName: employeeDTO.lastName,
      dob: employeeDTO.dob,
    });
    this.professionalDetailsForm.setValue({
      primarySkillId: employeeDTO.primarySkillId,
      secondarySkills: employeeDTO.secondarySkills,
      hireDate: employeeDTO.hireDate,
      employeeId: employeeDTO.employeeId,
    });
    this.contactDetailsForm.setValue({
      country: employeeDTO.country,
      address1: employeeDTO.address1,
      city: employeeDTO.city,
      state: employeeDTO.state,
      zipCode: employeeDTO.zipCode,
      personalEmail: employeeDTO.personalEmail,
      workEmail: employeeDTO.workEmail,
      phone1: employeeDTO.phone1,
      phone2: employeeDTO.phone2,
    });
  }
}
