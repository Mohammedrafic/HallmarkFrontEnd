import { AbstractControl, FormGroup } from '@angular/forms';

import { ToastUtility } from '@syncfusion/ej2-notifications';

import { FieldName, OrderSystem } from '@client/order-management/enums';
import { FormArrayList } from '@client/order-management/containers/irp-container/irp-container.constant';
import { ErrorContentMessageForCredential, OrderDetailsValidationMessage } from '@client/order-management/constants';
import { IrpOrderJobDistribution } from '@shared/enums/job-distibution';
import { JobDistributionList, ListControls, ListOfKeyForms, SelectSystem } from '@client/order-management/interfaces';
import { Order } from '@shared/models/order-management.model';
import { IOrderCredentialItem } from '@order-credentials/types';
import { ButtonModel } from '@shared/models/buttons-group.model';
import { Organization } from '@shared/models/organization.model';

export const collectInvalidFieldsFromForm = (controls: { [key: string]: AbstractControl }, fields: string[]): void => {
  for (const name in controls) {
    if (controls[name].invalid) {
      fields.push(` \u2022 ${FieldName[name as keyof typeof FieldName]}`);
    }
  }
};

export const createJobDistributionList = (distributionForm: FormGroup): JobDistributionList[] => {
  return distributionForm.value.jobDistribution?.map((value: number) => {
    return {
      id: 0,
      jobDistributionOption: value,
      agencyId: value === IrpOrderJobDistribution.SelectedExternal ?
       distributionForm.value.agencyId : null,
    };
  });
};

export const getControlsList = (formGroups: FormGroup[]): ListControls[] => {
  const controlList = [];
  for (const form in formGroups) {
    controlList.push(formGroups[form].controls);
  }

  return controlList;
};

export const showInvalidFormControl = (controls: ListControls[]): void => {
  const fields = collectInvalidFields(controls).join(',\n');
  ToastUtility.show({
    title: OrderDetailsValidationMessage.title,
    content: OrderDetailsValidationMessage.content + fields,
    position: OrderDetailsValidationMessage.position,
    cssClass: OrderDetailsValidationMessage.cssClass,
  });
};

export const showMessageForInvalidCredentials = (): void => {
  ToastUtility.show({
    title: OrderDetailsValidationMessage.title,
    content: ErrorContentMessageForCredential,
    position: OrderDetailsValidationMessage.position,
    cssClass: OrderDetailsValidationMessage.cssClass,
  });
};

export const collectInvalidFields = (formControlList: ListControls[]): string[] => {
  const fields: string[] = [];
  formControlList.forEach((form: ListControls) => collectInvalidFieldsFromForm(form, fields));
  return fields;
};

export const isFormsValid = (forms: FormGroup[]): boolean => {
  return forms.map((form: FormGroup) => {
    return !form.invalid;
  }).every((valid: boolean) => valid);
};

export const getFormsList = (list: ListOfKeyForms): FormGroup[] => {
  const formList = [];
  for (const form in list) {
    if(FormArrayList.includes(form)) {
      (list[form as keyof ListOfKeyForms]! as FormGroup[]).forEach((item: FormGroup) => {
        formList.push(item);
      });
    } else {
      formList.push(list[form as keyof ListOfKeyForms]);
    }
  }

  return formList as FormGroup[];
};

export const createOrderDTO = (formState: ListOfKeyForms, credentials: IOrderCredentialItem[]) => ({
  ...formState.orderType.getRawValue(),
  ...formState.generalInformationForm.getRawValue(),
  ...formState.jobDescriptionForm.getRawValue(),
  ...formState.jobDistributionForm.getRawValue(),
  ...formState.specialProjectForm.getRawValue(),
  jobDistributions: createJobDistributionList(formState.jobDistributionForm),
  contactDetails: [],
  workLocations: [],
  credentials: [...credentials],
  isSubmit: true,
  isTemplate: false,
});

export const getValuesFromList = (formList: FormGroup[]): FormGroup[] => {
  return formList.map((form: FormGroup) => {
    return form.getRawValue();
  });
};

export const createFormData = (order: Order[], documents: Blob[]): FormData => {
  const formData = new FormData();
  const orderIds = order.map((order: Order) => order.id);
  documents.forEach((document: Blob) => formData.append('document', document));
  orderIds.forEach((id: number) => formData.append('orderIds', `${id}`));
  return formData;
};

export const updateSystemConfig = (config: ButtonModel[], activeSystem: OrderSystem): void => {
  config.forEach((config: ButtonModel) => {
    config.active = config.id === activeSystem;
  });
};

export const createSystem = (organization: Organization, isIRPFlag: boolean): SelectSystem => ({
  isIRP: !!organization.preferences.isIRPEnabled,
  isVMS: !!organization.preferences.isVMCEnabled,
  isIRPFlag,
});
