import { RejectReason } from '@shared/models/reject-reason.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { Department } from '@shared/models/department.model';
import { ProjectSpecialData } from '@shared/models/project-special-data.model';
import {
  ContactDetailsUser,
  DataSourceContainer,
  JobDistribution,
  OrderFormInput,
  OrderFormsArrayConfig,
  OrderFormsConfig,
  SelectSystem,
  SpecialProjectStructure,
  StateList,
} from '@client/order-management/interfaces';
import { Order } from '@shared/models/order-management.model';
import { JobDistributionModel } from '@shared/models/job-distribution.model';
import { FieldType } from '@core/enums';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';
import {
  JobDistributionIrpOnly,
  JobDistributionIrpVms,
  TierInternal,
  TitleField,
} from '@client/order-management/components/irp-tabs/order-details/constants';
import { ButtonType } from '@client/order-management/components/irp-tabs/order-details/order-details-irp.enum';
import { IrpOrderJobDistribution } from '@shared/enums/job-distibution';
import { IrpOrderType } from '@shared/enums/order-type';

export const setDataSource = (fields: OrderFormInput[], fieldName: string, source: DataSourceContainer): void => {
  fields.forEach((fields: OrderFormInput) => {
    if (fields.field === fieldName) {
      fields.dataSource = source;
    }
  });
};

export const changeTypeField = (config: OrderFormInput[], field: string, fieldType: FieldType): void => {
  config.forEach((item: OrderFormInput) => {
    if (item.field === field) {
      item.type = fieldType;
    }
  });
};

export const getAgencyIdFiled = (config: OrderFormsConfig): OrderFormInput => {
  return config?.fields.find((control: OrderFormInput) => {
    return control.field === 'agencyId';
  }) as OrderFormInput;
};

export const mapDepartmentStructure = (departments: Department[]): Department[] => {
  return departments.map((department: Department) => ({
    ...department,
    id: department.departmentId,
    name: department.departmentName,
  }));
};


export const mapReasonsStructure = (reasons: RejectReason[]): RejectReason[] => {
  return reasons.map((reason: RejectReason) => ({
    ...reason,
    name: reason.reason,
  }));
};

export const mapStatesStructure = (states: StateList[]): StateList[] => {
  return states.map((state: StateList) => ({
    id: state.keyCode,
    name: state.title,
  }) as StateList);
};

export const mapAssociateAgencyStructure = (associateAgency: AssociateAgency[]): AssociateAgency[] => {
  return associateAgency.map((associate: AssociateAgency) => ({
    ...associate,
    id: associate.agencyId,
    name: associate.agencyName,
  }));
};

export const mapSpecialProjectStructure = (data: ProjectSpecialData): SpecialProjectStructure => {
  return {
    poNumbers: mapPonumbersToCorrectFormat(data.poNumbers, 'poNumber'),
    projectNames: mapProjectNameDataToCorrectFormat(data.projectNames.filter(f=>f.includeInIRP==true), 'projectName'),
    specialProjectCategories: mapSpecialProjectDataToCorrectFormat(data.specialProjectCategories.filter(f=>f.includeInIRP==true), 'projectType'),
  };
};

const mapSpecialProjectDataToCorrectFormat =
  <T extends {
    includeInIRP: boolean; id: number;includeInVMS: boolean 
}, U extends keyof T>(list: T[], key: U) => {
    return list.map((itm: T) => ({
      id: itm.id,
      name: itm[key],
      includeInIRP : itm.includeInIRP,
      includeInVMS : itm.includeInVMS
    }));
  };

  const mapProjectNameDataToCorrectFormat =
  <T extends {
    includeInIRP: boolean; id: number;includeInVMS: boolean ;projectTypeId?:number
}, U extends keyof T>(list: T[], key: U) => {
    return list.map((itm: T) => ({
      id: itm.id,
      name: itm[key],
      includeInIRP : itm.includeInIRP,
      includeInVMS : itm.includeInVMS,
      projectTypeId :itm.projectTypeId
    }));
  };

  const mapPonumbersToCorrectFormat =
  <T extends {
   id: number;
}, U extends keyof T>(list: T[], key: U) => {
    return list.map((itm: T) => ({
      id: itm.id,
      name: itm[key],
   }));
  };

export const modifyJobDistribution = (selectedOrder: Order) => {
  const selectedDistribution = selectedOrder.jobDistributions.reduce(
    (acc: JobDistribution, distribution: JobDistributionModel): JobDistribution => {
    return {
      jobDistributionValue: [...acc.jobDistributionValue, distribution.jobDistributionOption],
      agencyId: [...acc.agencyId as number[], distribution.agencyId as number],
    };
  }, { jobDistributionValue: [], agencyId: [] });

  return {
    ...selectedDistribution,
    jobDistributionValue: selectedDistribution.jobDistributionValue?.filter((distribution, index) =>
      index === selectedDistribution.jobDistributionValue?.indexOf(distribution)),
  };
};

export const setDefaultPrimaryContact = (forms: FormGroup[]): void => {
  const isPrimarySelected = forms.map((currentForm: FormGroup) => {
    return currentForm.value.isPrimaryContact;
  }).some((value: boolean) => value);

  if (!isPrimarySelected) {
    forms[0].get('isPrimaryContact')?.patchValue(true);
  }
};

export const mapperForContactDetail = (contactDetails: Department): ContactDetailsUser => ({
  name: contactDetails.facilityContact,
  email: contactDetails.facilityEmail,
  mobilePhone: contactDetails.facilityPhoneNo,
});

export const getDataSourceForJobDistribution = (selectedSystem: SelectSystem, tieringLogicEnabled: boolean) => {
  if (selectedSystem.isIRP && selectedSystem.isVMS) {
    return JobDistributionIrpVms(tieringLogicEnabled);
  }

  return JobDistributionIrpOnly(tieringLogicEnabled);
};

export const showHideFormAction = (config: OrderFormsArrayConfig, list: FormGroup[]): void => {
  config.forms.forEach((form: OrderFormInput[]) => {
    form.forEach((field: OrderFormInput) => {
      if (
        (field.type === FieldType.Button || field.type === FieldType.RadioButton) && field.buttonType !== ButtonType.Edit
      ) {
        field.show = list.length > 1;
      }
    });
  });
};

export const removeFields = (config: OrderFormsArrayConfig, index: number, form: FormGroup[]): void => {
  config?.forms.splice(index, 1);
  form.splice(index, 1);

  if (form.length < 2) {
    showHideFormAction(config, form);
  }
};

export const changeTypeEditButton = (config: OrderFormsArrayConfig, index: number): void => {
  config?.forms[index].forEach((field: OrderFormInput) => {
    if (field.field === TitleField) {
      field.type = field.type === FieldType.Input ? FieldType.Dropdown : FieldType.Input;
    }
  });
};

export const getRateConfigControl = (config: OrderFormsConfig, form: FormGroup): OrderFormInput => {
  const orderType = form.get('orderType')?.value;
  const controlType = orderType === IrpOrderType.LongTermAssignment ? 'hourlyRate': 'billRate';

  return config?.fields.find((control: OrderFormInput) => {
    return control.field === controlType;
  }) as OrderFormInput;
};

export const updateJobDistributionForm =
  (value: number[], selectedConfig: OrderFormsConfig, orderTypeForm: FormGroup, agencyFormControl: AbstractControl): void => {
  const agencyConfigControl = getAgencyIdFiled(selectedConfig);
  const rateConfigControl = getRateConfigControl(selectedConfig, orderTypeForm);

  rateConfigControl.show = value.includes(IrpOrderJobDistribution.SelectedExternal) ||
    value.includes(IrpOrderJobDistribution.AllExternal) ||
    value.includes(IrpOrderJobDistribution.TieringLogicExternal);

  if(value.includes(IrpOrderJobDistribution.SelectedExternal)) {
    agencyConfigControl.show = true;
    agencyFormControl?.addValidators([Validators.required]);
    agencyConfigControl.required = true;
  } else {
    agencyConfigControl.show = false;
    agencyFormControl?.removeValidators(Validators.required);
    agencyFormControl?.reset();
    agencyConfigControl.required = false;
  }
};

export const isDistributionIncludeExternalOptions = (list: number[]): number[] => {
  return [
    IrpOrderJobDistribution.AllExternal,
    IrpOrderJobDistribution.SelectedExternal,
    IrpOrderJobDistribution.TieringLogicExternal,
  ].filter((distribution: number) => list?.includes(distribution));
};
