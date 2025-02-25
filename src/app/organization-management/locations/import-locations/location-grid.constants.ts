import { ColDef } from "@ag-grid-community/core";

import { GetLocationsImportErrors, GetLocationsImportErrorsSucceeded,
  GetLocationsImportTemplate, GetLocationsImportTemplateSucceeded,
  SaveLocationsImportResult, SaveLocationsImportResultSucceeded,
  UploadLocationsFile, UploadLocationsFileSucceeded } from '@organization-management/store/organization-management.actions';

import { GridErroredCellComponent } from "@shared/components/import-dialog-content/grid-errored-cell/grid-errored-cell.component";

export const LocationsColumnsConfig: ColDef[] = [
  {
    field: 'orgName',
    width: 150,
    headerName: 'Organization',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'regionName',
    width: 150,
    headerName: 'Region',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'locationName',
    width: 200,
    headerName: 'Location Name',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'externalId',
    width: 200,
    headerName: 'Ext Location ID',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'invoiceId',
    width: 200,
    headerName: 'Invoice Location ID',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'businessLine',
    width: 200,
    headerName: 'Business Line',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'locationType',
    width: 200,
    headerName: 'Location Type',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'timeZone',
    width: 200,
    headerName: 'Time Zone',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'address1',
    width: 150,
    headerName: 'Address 1',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'address2',
    width: 150,
    headerName: 'Address 2',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'state',
    width: 150,
    headerName: 'State',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'city',
    width: 150,
    headerName: 'City',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'zip',
    width: 150,
    headerName: 'Zipcode',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'contactPerson',
    width: 200,
    headerName: 'Contact Person',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'contactEmail',
    width: 200,
    headerName: 'Contact Person Email',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'phoneNumber',
    width: 150,
    headerName: 'Phone Number',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'phoneType',
    width: 150,
    headerName: 'Phone Type',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'ext',
    width: 150,
    headerName: 'Ext',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'glNumber',
    width: 150,
    headerName: 'GL Number',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'invoiceNote',
    width: 150,
    headerName: 'Invoice Note',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'inactiveDate',
    width: 150,
    headerName: 'Inactive Date',
    cellRenderer: GridErroredCellComponent,
  },
];

export const LocationsIrpColumnsConfig: ColDef[] = [
  {
    field: 'includeInIRP',
    width: 100,
    headerName: 'Include in IRP',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'orgName',
    width: 150,
    headerName: 'Organization',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'regionName',
    width: 150,
    headerName: 'Region',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'locationName',
    width: 200,
    headerName: 'Location Name',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'externalId',
    width: 200,
    headerName: 'Ext Location ID',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'invoiceId',
    width: 200,
    headerName: 'Invoice Location ID',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'businessLine',
    width: 200,
    headerName: 'Business Line',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'timeZone',
    width: 200,
    headerName: 'Time Zone',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'address1',
    width: 150,
    headerName: 'Address 1',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'address2',
    width: 150,
    headerName: 'Address 2',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'state',
    width: 150,
    headerName: 'State',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'city',
    width: 150,
    headerName: 'City',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'zip',
    width: 150,
    headerName: 'Zipcode',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'contactPerson',
    width: 200,
    headerName: 'Contact Person',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'contactEmail',
    width: 200,
    headerName: 'Contact Person Email',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'phoneNumber',
    width: 150,
    headerName: 'Phone Number',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'phoneType',
    width: 150,
    headerName: 'Phone Type',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'ext',
    width: 150,
    headerName: 'Ext',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'glNumber',
    width: 150,
    headerName: 'GL Number',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'invoiceNote',
    width: 150,
    headerName: 'Invoice Note',
    cellRenderer: GridErroredCellComponent,
  },
  {
    field: 'inactiveDate',
    width: 150,
    headerName: 'Inactive Date',
    cellRenderer: GridErroredCellComponent,
  },
];

export const LocationsImportConfig = {
  importTemplate: GetLocationsImportTemplate,
  importError: GetLocationsImportErrors,
  uploadFile: UploadLocationsFile,
  saveImportResult: SaveLocationsImportResult,
  uploadFileSucceeded: { instance: UploadLocationsFileSucceeded, message: 'There are no records in the file' },
  importTemplateSucceeded: { instance: GetLocationsImportTemplateSucceeded, fileName: 'locations.xlsx' },
  importErrorsSucceeded: { instance: GetLocationsImportErrorsSucceeded, fileName: 'locations_errors.xlsx' },
  saveImportResultSucceeded: { instance: SaveLocationsImportResultSucceeded, message: 'Locations were imported' },
};
