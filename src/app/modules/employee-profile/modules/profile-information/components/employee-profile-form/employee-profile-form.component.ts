import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldType } from '@core/enums';
import { CustomFormGroup } from '@core/interface';

import { ProfileInformationFormsKeys, ProfileInformationFormsSourceKeys } from '../../enums';
import { EmployeeProfileFormSourceMap, ProfileInformationConf } from '../../constants';
import {
  EmployeeDTO,
  ContactDetailsForm,
  DemographicsForm,
  EmployeeProfileData,
  ProfessionalDetailsForm,
  ProfileInformationConfig,
  EmployeeProfileFormSource,
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

  readonly formSourceMap: EmployeeProfileFormSource = EmployeeProfileFormSourceMap;
  readonly formsConfig: ProfileInformationConfig = ProfileInformationConf;
  readonly formsKeys = ProfileInformationFormsKeys;
  readonly fieldTypes = FieldType;
  readonly dropDownFields = { text: 'text', value: 'value' };
  readonly forms: Record<string, FormGroup> = {
    demographics: this.formService.createDemographicsForm(),
    professionalDetails: this.formService.createProfessionalDetailsForm(),
    contactDetails: this.formService.createContactDetailsForm(),
  };

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
    this.forms[ProfileInformationFormsKeys.Demographics].setValue({
      firstName: employeeDTO.firstName,
      middleName: employeeDTO.middleName,
      lastName: employeeDTO.lastName,
      dob: employeeDTO.dob,
    });
    this.forms[ProfileInformationFormsKeys.ProfessionalDetails].setValue({
      primarySkillId: employeeDTO.primarySkillId,
      secondarySkills: employeeDTO.secondarySkills,
      hireDate: employeeDTO.hireDate,
      employeeId: employeeDTO.employeeId,
    });
    this.forms[ProfileInformationFormsKeys.ContactDetails].setValue({
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
