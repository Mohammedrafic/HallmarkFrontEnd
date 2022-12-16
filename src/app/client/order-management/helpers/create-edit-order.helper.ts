import { AbstractControl, FormGroup } from '@angular/forms';

import { ToastUtility } from '@syncfusion/ej2-notifications';

import { FieldName } from '@client/order-management/enums';
import { FormArrayList } from '@client/order-management/containers/irp-container/irp-container.constant';
import { OrderDetailsValidationMessage } from '@client/order-management/constants';
import { IrpOrderJobDistribution } from '@shared/enums/job-distibution';
import { JobDistributionList, ListControls, ListOfKeyForms } from '@client/order-management/interfaces';

export const collectInvalidFieldsFromForm = (controls: { [key: string]: AbstractControl }, fields: string[]) => {
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
       distributionForm.value.agency : null,
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

export const collectInvalidFields = (formControlList: ListControls[]) => {
  const fields: string[] = [];
  formControlList.forEach((form: ListControls) => collectInvalidFieldsFromForm(form, fields));
  return fields;
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

export const isFormsValid = (forms: FormGroup[]): boolean => {
  return forms.map((form: FormGroup) => {
    return form.valid;
  }).every((valid: boolean) => valid);
};

//TODO: remove credential, after implementation
export const createOrderDTO = (formState: ListOfKeyForms) => ({
  ...formState.orderType.getRawValue(),
  ...formState.generalInformationForm.getRawValue(),
  ...formState.jobDescriptionForm.getRawValue(),
  ...formState.jobDistributionForm.getRawValue(),
  jobDistributions: createJobDistributionList(formState.jobDistributionForm),
  contactDetails: [],
  workLocations: [],
  credentials: [
    {
      comment: null,
      credentialId: 234,
      credentialName: "Color Vision Screening",
      credentialType: "Personal Health History",
      id: 0,
      optional: false,
      orderId: 0,
      reqForOnboard: false,
    },
  ],
  isSubmit: true,
  isTemplate: false,
});

export const getValuesFromList = (formList: FormGroup[]) => {
  return formList.map((form: FormGroup) => {
    return form.getRawValue();
  });
};
