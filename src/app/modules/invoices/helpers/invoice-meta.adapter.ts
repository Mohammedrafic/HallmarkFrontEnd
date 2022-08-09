import { DropdownOption } from '@core/interface';
import { ManualInvoiceMeta } from '../interfaces';

export class InvoiceMetaAdapter {
  static createLocationsOptions(meta: ManualInvoiceMeta[]): DropdownOption[] {
    const values: DropdownOption[] = [];

    meta.forEach((item) => {
      if (!values.find((option) => option.value === item.locationId)) {
        values.push({
          text: item.locationName,
          value: item.locationId,
        });
      }
    });

    return values;
  }

  static createDepartmentsOptions(meta: ManualInvoiceMeta[]): DropdownOption[] {
    const values: DropdownOption[] = [];

    meta.forEach((item) => {
      if (!values.find((value) => value.value === item.departmentId)) {
        values.push({
          text: item.departmentName,
          value: item.departmentId,
        });
      }
    });
    return values;
  }

  static createAgencyOptions(meta: ManualInvoiceMeta[]): DropdownOption[] {
    const values: DropdownOption[] = [];

    meta.forEach((item) => {
      if (!values.find((option) => option.value === item.agencyId)) {
        values.push({
          text: item.agencyName,
          value: item.agencyId,
        });
      }
    });
    return values;
  }

  static createCandidateOptions(meta: ManualInvoiceMeta[]): DropdownOption[] {
    const values: DropdownOption[] = [];

    meta.forEach((item) => {
      if (!values.find((option) => option.value === item.candidateId)) {
        values.push({
          text: `${item.candidateFirstName} ${item.candidateLastName}`,
          value: item.candidateId,
        });
      }
    });
    return values;
  }

  static createOrgOptions(meta: ManualInvoiceMeta[]): DropdownOption[] {
    const values: DropdownOption[] = [];

    meta.forEach((item) => {
      if (!values.find((option) => option.value === item.agencyId)) {
        values.push({
          text: item.organizationName,
          value: item.organizationId,
        });
      }
    });
    return values;
  }
}
