import { ExportColumn } from '@shared/models/export.model';

export const DepartmentsExportCols = (isIRPEnabled: boolean, isInvoiceDepartmentIdFieldShow: boolean): ExportColumn[] => {
  const result = [
    { text:'Ext Department ID', column: 'ExtDepartmentId'},
    { text:'Department Name', column: 'DepartmentName'},
    { text:'Department Email', column: 'FacilityEmail'},
    { text:'Department Contact', column: 'FacilityContact'},
    { text:'Department Phone NO', column: 'FacilityPhoneNo'},
    { text:'Inactivate Date', column: 'InactiveDate'},
  ];

  if (isInvoiceDepartmentIdFieldShow) {
    result.splice(1, 0 , { text:'Invoice Department ID', column: 'InvoiceDepartmentId'});
  }

  if (isIRPEnabled) {
    result.push({ text:'Include in IRP', column: 'IncludeInIRPText' });
    result.push({ text:'Unit Description', column: 'UnitDescription' });
  }

  return result;
};
