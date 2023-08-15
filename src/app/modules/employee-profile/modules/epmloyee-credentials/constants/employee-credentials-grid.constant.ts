import { formatDate } from '@angular/common';

import { ColDef, ValueFormatterParams } from '@ag-grid-community/core';

import { CredentialStatusCellComponent } from '../components/credential-status-cell/credential-status-cell.component';
import { DepartmentMatchCellComponent } from '../components/department-match-cell/department-match-cell.component';
import { CredentialFileCellComponent } from '../components/credential-file-cell/credential-file-cell.component';
import { PageSettings } from '../interfaces';

export const CredentialsPageSettings: PageSettings = {
  pageNumber: 1,
  pageSize: 100,
};

const commonCell: ColDef = {
  resizable: true,
  sortable: false,
  minWidth: 80,
};

const certifiedDateFormatter = (params: ValueFormatterParams) => {
  if (!params.value) {
    return '';
  }

  return formatDate(params.value, 'MM/dd/yyy', 'en-US', 'UTC');
};

export const EmployeeCredentialsGridConfig: ColDef[] = [
  {
    ...commonCell,
    field: 'credential',
    headerName: 'Credential',
    width: 180,
    type: 'leftAligned',
  },
  {
    ...commonCell,
    field: 'departmentMatch',
    headerName: 'Department Match',
    width: 180,
    type: 'leftAligned',
    cellRenderer: DepartmentMatchCellComponent,
  },
  {
    ...commonCell,
    field: 'status',
    headerName: 'Status',
    width: 160,
    type: 'leftAligned',
    cellRenderer: CredentialStatusCellComponent,
  },
  {
    ...commonCell,
    field: 'credentialNumber',
    headerName: 'Credential #',
    width: 140,
    type: 'leftAligned',
  },
  {
    ...commonCell,
    field: 'certifiedOn',
    headerName: 'Certified On',
    width: 140,
    type: 'leftAligned',
    valueFormatter: certifiedDateFormatter,
  },
  {
    ...commonCell,
    field: 'certifiedUntil',
    headerName: 'Certified Until',
    width: 150,
    type: 'leftAligned',
    valueFormatter: certifiedDateFormatter,
  },
  {
    ...commonCell,
    field: 'files',
    headerName: 'File',
    width: 400,
    type: 'leftAligned',
    cellRenderer: CredentialFileCellComponent,
  },
];
