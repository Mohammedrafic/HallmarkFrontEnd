import { DataSourceItem } from './../../../core/interface/common.interface';
import { PageOfCollections } from '@shared/models/page.model';
import {DropdownOption} from '@core/interface';
import {InvoiceFilterColumns, InvoiceRecord, InvoicesFilterState, ManualInvoiceMeta, ManualInvoiceReason} from '../interfaces';
import { InvoicesTableFiltersColumns } from '../enums/invoices.enum';
import { OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';

export interface InvoicesModel {
  invoicesData: PageOfCollections<InvoiceRecord> | null;
  invoicesFilters: InvoicesFilterState | null;
  invoiceFiltersColumns: InvoiceFilterColumns;
  isInvoiceDetailDialogOpen: boolean;
  selectedInvoiceId: number | null;
  prevInvoiceId: string | null;
  nextInvoiceId: string | null;
  invoiceReasons: ManualInvoiceReason[];
  invoiceMeta: ManualInvoiceMeta[];
  organizations: DataSourceItem[];
  organizationLocations: OrganizationLocation[];
  selectedOrganizationId: number;
  regions: OrganizationRegion[];
}
