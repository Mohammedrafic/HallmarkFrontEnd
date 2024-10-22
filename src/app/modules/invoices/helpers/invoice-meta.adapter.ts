import { DropdownOption } from '@core/interface';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { ManualInvoiceMeta } from '../interfaces';

export class InvoiceMetaAdapter {
  static createLocationsOptions(meta: OrganizationLocation[]): DropdownOption[] {
    const values: DropdownOption[] = [];

    meta.forEach((item) => {
      if (!values.find((option) => option.value === item.id)) {
        values.push({
          text: item.name,
          value: item.id,
        });
      }
    });

    return values;
  }

  static createDepartmentsOptions(meta: OrganizationDepartment[]): DropdownOption[] {
    const values: DropdownOption[] = [];

    meta.forEach((item) => {
      if (!values.find((value) => value.value === item.id)) {
        values.push({
          text: item.name,
          value: item.id,
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

  static createLocationsStructure(regions: OrganizationRegion[]): OrganizationLocation[] {
    const locationsData: OrganizationLocation[] = [];

    regions.forEach((region) => {
      const locations = region.locations as OrganizationLocation[];
      locations.forEach((location) => {
        locationsData.push(location);
      });
    });

    return locationsData;
  }
}
