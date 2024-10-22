import { ImportedLocation } from './../../../shared/models/location.model';
import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DateTimeHelper } from '@core/helpers';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { Department, DepartmentFilter, ImportedDepartment } from '@shared/models/department.model';
import { FilterColumnsModel } from '@shared/models/filter.model';
import { ImportResult } from '@shared/models/import.model';
import { ImportedOrder } from '@shared/models/imported-order.model';

@Injectable()
export class DepartmentService {
  constructor(private fb: FormBuilder) {
  }

  createDepartmentDetailForm(isIRPFlagEnabled: boolean, isOrgUseIRPAndVMS: boolean): FormGroup {
    return this.fb.group({
      extDepartmentId: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      invoiceDepartmentId: isIRPFlagEnabled
        ? ['', [Validators.maxLength(50)]]
        : ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      departmentName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      facilityContact: ['', [Validators.minLength(1), Validators.maxLength(50)]],
      facilityEmail: ['', [Validators.email]],
      facilityPhoneNo: ['', [Validators.minLength(1), Validators.maxLength(10), Validators.pattern(/^\d+$/i)]],
      inactiveDate: [null],
      reactivateDate: [null],
      ...(isIRPFlagEnabled && {
        includeInIRP: [isOrgUseIRPAndVMS ? false : true],
        unitDescription: ['', [Validators.maxLength(2000)]],
        primarySkills: [null],
        secondarySkills: [null]
      })
    });
  }

  createDepartmentFilterForm(isIRPFlagEnabled: boolean): FormGroup {
    return this.fb.group({
      externalIds: new FormControl([]),
      invoiceIds: new FormControl([]),
      departmentNames: new FormControl([]),
      facilityContacts: new FormControl([]),
      facilityEmails: new FormControl([]),
      inactiveDate: new FormControl(null),
      ...(isIRPFlagEnabled && {
        includeInIRP: new FormControl([])
      }),
    });
  }

  initFilterColumns(isIRPFlagEnabled: boolean): FilterColumnsModel {
    return {
      externalIds: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      invoiceIds: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      departmentNames: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: []},
      facilityContacts: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      facilityEmails: { type: ControlTypes.Multiselect, valueType: ValueType.Text, dataSource: [] },
      inactiveDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      ...(isIRPFlagEnabled && {
        includeInIRP: { type: ControlTypes.Dropdown, valueType: ValueType.Text, dataSource: [] },
      }),
    };
  }

  populateDepartmentDetailsForm(formGroup: FormGroup, department: Department, isIRPFlagEnabled: boolean): void {
    formGroup.patchValue({
      extDepartmentId: department.extDepartmentId,
      departmentName: department.departmentName,
      facilityContact: department.facilityContact,
      facilityEmail: department.facilityEmail,
      facilityPhoneNo: department.facilityPhoneNo,
      inactiveDate: department.inactiveDate ? DateTimeHelper.setCurrentTimeZone(department.inactiveDate) : null,
      reactivateDate: department.reactivateDate ? DateTimeHelper.setCurrentTimeZone(department.reactivateDate) : null,
      ...(isIRPFlagEnabled && {
        includeInIRP: !!department.includeInIRP,
        unitDescription: department.unitDescription,
        primarySkills: department.primarySkills,
        secondarySkills: department.secondarySkills,
      })
    });

    formGroup.get('invoiceDepartmentId')?.setValue(department.invoiceDepartmentId);
  }

  populateFilterForm(formGroup: FormGroup, filters: DepartmentFilter, isIRPFlagEnabled: boolean): void {
    formGroup.setValue({
      externalIds: filters.externalIds || [],
      invoiceIds: filters.invoiceIds || [],
      departmentNames: filters.departmentNames || [],
      facilityContacts: filters.facilityContacts || [],
      facilityEmails: filters.facilityEmails || [],
      inactiveDate: filters.inactiveDate || null,
      ...(isIRPFlagEnabled && {
        includeInIRP: filters.includeInIRP || null
      }),
    });
  }

  populateDataSources(
    filterColumns: FilterColumnsModel,
    options: Record<string, string[]>,
    isIRPFlagEnabled: boolean
  ): void {
    const filterKeys = [
      'externalIds',
      'departmentNames',
      'facilityContacts',
      'facilityEmails',
    ];

    filterKeys.forEach((key: string) => {
      filterColumns[key].dataSource = options[key];
    });

    filterColumns['invoiceIds'].dataSource = options['ivnoiceIds'];

    if (isIRPFlagEnabled) {
      filterColumns['includeInIRP'].dataSource = options['includeInIRP'].map((item: any) => (
        { text: item.optionText, value: item.option }
      ));
    }
  }

  prepareImportRecordsWithSkills(data: ImportResult<ImportedLocation & ImportedDepartment & ImportedOrder>):
  ImportResult<ImportedLocation & ImportedDepartment & ImportedOrder> {
    this.createSkillsProps(data.succesfullRecords);
    this.createSkillsProps(data.errorRecords);

    return data;
  }

  // Create additional skills props for corresponding coldefs
  private createSkillsProps(data: ImportedDepartment[]): void {
    data.forEach((record) => {
      const skillFileds: string[] = [];
      if (record.primarySkills && record.primarySkills.length) {
        record.primarySkills.forEach((skillName, index) => {
          record[`primarySkill${index}`] = skillName;
          skillFileds.push(`primarySkill${index}`);
        });
      }

      if (record.secondarySkills && record.secondarySkills.length) {
        record.secondarySkills.forEach((skillName, index) => {
          record[`secondarySkill${index}`] = skillName;
          skillName && skillFileds.push(`secondarySkill${index}`);
        });
      }

      if (record.errorProperties.find(item => item === 'SecondarySkills' || item === 'PrimarySkills')) {
        record.errorProperties.push(...skillFileds);
      }
    });
  }
}
