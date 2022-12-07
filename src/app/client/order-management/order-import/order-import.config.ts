import { SelectionSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { FieldSettingsModel } from '@syncfusion/ej2-dropdowns/src/drop-down-base/drop-down-base-model';
import {
  GetOrderImportErrors,
  GetOrderImportErrorsSucceeded,
  GetOrderImportTemplate,
  GetOrderImportTemplateSucceeded,
  SaveOrderImportResult,
  SaveOrderImportResultSucceeded,
  UploadOrderImportFile,
  UploadOrderImportFileSucceeded
} from '@client/store/order-managment-content.actions';

export const recordsListField: FieldSettingsModel = { text: 'name', value: 'id' };
export const selectionSettings: SelectionSettingsModel = { mode: 'Single' };

export const orderImportConfig = {
  importTemplate: GetOrderImportTemplate,
  importError: GetOrderImportErrors,
  uploadFile: UploadOrderImportFile,
  saveImportResult: SaveOrderImportResult,
  uploadFileSucceeded: { instance: UploadOrderImportFileSucceeded, message: 'There are no records in the file' },
  importTemplateSucceeded: { instance: GetOrderImportTemplateSucceeded, fileName: 'order.xlsx' },
  importErrorsSucceeded: { instance: GetOrderImportErrorsSucceeded, fileName: 'order_errors.xlsx' },
  saveImportResultSucceeded: {
    instance: SaveOrderImportResultSucceeded,
    message: 'The order importing is in progress. Please wait until all orders will be successfully submitted'
  },
};

export const columnDefs = {
  generalInfoTop: {
    organizationName: 'Organization',
    orderType: 'Order Type',
    region: 'Region',
    location: 'Location',
    department: 'Department',
    skill: 'Skill',
    numberOfOpenPositions: "# Open Positions",
  },
  generalInfoMiddle: {
    hourlyRate: 'Hourly Rate',
    minYrsReq: 'Min Yrs. Req.',
    joiningBonus: 'Joining Bonus',
    compBonus: 'Comp. Bonus',
    duration: 'Duration',
    jobStartDate: 'Job Start Date',
    jobEndDate: 'Job End Date',
  },
  generalInfoBottom: {
    shifts: 'Shift',
    shiftStartTime: 'Shift Start Time',
    shiftEndTime: 'Shift End Time',
    orderPlacementFee: 'Order Placement Fee (%)',
    annualSalaryRangeFrom: 'Annual Salary Range From',
    annualSalaryRangeTo: 'Annual Salary Range To',
  },
  jobDistribution: {
    jobDistribution: 'Job Distribution',
    agency: 'Agency',
    reasonForRequisition: 'Reason for Req.',
    classification: 'Classification',
    onCallRequired: 'On Call Req',
    asapStart: 'Asap Start',
    criticalOrder: 'Critical Order',
  },
  jobDescription: {
    jobDescription: 'Job Description',
    unitDescription: 'Unit Description',
  },
  contactDetails: {
    title: 'Title',
    contactPerson: 'Contact Person',
    mobilePhone: 'Mobile Phone',
    email: 'Email',
  },
  workLocation: {
    address: 'Address',
    state: 'State',
    city: 'City',
    zipCode: 'Zip Code',
  },
  specialProject: {
    specialProjectCategory: 'Special Project Category',
    projectName: 'Project Name',
    po: 'PO#',
  },
};

