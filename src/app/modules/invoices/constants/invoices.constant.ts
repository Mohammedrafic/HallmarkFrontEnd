import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

import { InvoiceFilterColumns, } from '../interfaces';
import { FilteringOptionsFields } from '../../timesheets/enums';
import { InvoicesTableFiltersColumns } from '../enums/invoices.enum';
import { CustomTabItemModel } from '../interfaces/custom-tab-item-model.interface';

export const AGENCY_INVOICE_TABS: CustomTabItemModel[] = [
  {
    title: 'Manual Invoice Pending'
  },
  {
    title: 'All Invoices',
  }
];

export const ORGANIZATION_INVOICE_TABS: CustomTabItemModel[] = [
  {
    title: 'Manual Invoice Pending'
  },
  {
    title: 'Pending Invoice Records'
  },
  {
    title: 'Pending Approval'
  },
  {
    title: 'Pending Payment',
  },
  {
    title: 'Paid',
  },
  {
    title: 'All Invoices'
  },
];

// TODO: Rename, move to core module
export const DEFAULT_ALL_INVOICES = {
  items: [],
  pageNumber: 1,
  totalCount: 0,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

const defaultColumnMapping = {
  type: ControlTypes.Multiselect,
  valueType: ValueType.Id,
  valueField: 'name',
  valueId: 'id',
};

export const InvoiceDefaultFilterColumns: InvoiceFilterColumns = {
  [InvoicesTableFiltersColumns.OrderIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.SkillIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.DepartmentIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.AgencyIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.RegionsIds]: defaultColumnMapping,
  [InvoicesTableFiltersColumns.LocationIds]: defaultColumnMapping,
} as InvoiceFilterColumns;


export const InvoicesFilteringOptionsMapping: Map<FilteringOptionsFields, InvoicesTableFiltersColumns> = new Map()
  .set(FilteringOptionsFields.Agencies, InvoicesTableFiltersColumns.AgencyIds)
  .set(FilteringOptionsFields.Orders, InvoicesTableFiltersColumns.OrderIds)
  .set(FilteringOptionsFields.Regions, InvoicesTableFiltersColumns.RegionsIds)
  .set(FilteringOptionsFields.Skills, InvoicesTableFiltersColumns.SkillIds);
