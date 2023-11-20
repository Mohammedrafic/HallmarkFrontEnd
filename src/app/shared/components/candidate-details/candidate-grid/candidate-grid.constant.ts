import { GridHelper } from '@shared/helpers/grid.helper';
import { GridStatusRendererComponent } from '@shared/components/candidate-details/candidate-grid/grid-status-renderer/grid-status-renderer.component';
import { GridNameRendererComponent } from '@shared/components/candidate-details/candidate-grid/grid-name-renderer/grid-name-renderer.component';
import { GridPositionRendererComponent } from '@shared/components/candidate-details/candidate-grid/grid-position-renderer/grid-position-renderer.component';
import { CandidatesDetailsModel } from '@shared/components/candidate-details/models/candidate.model';
import { GridClassificationRendererComponent } from './grid-classification-renderer/grid-classification-renderer.component';
import { CandidateExportColumn } from './candidate-grid.interface';

const valueHelper = new GridHelper();
const customComparator = (valueA: string, valueB: string) => {
  return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
};
// eslint-disable-next-line max-lines-per-function
export const CandidatesColumnsDefinition = (isAgency: boolean) => {
  return [
    {
      field: 'lastName',
      headerName: 'NAME',
      width: 160,
      cellRenderer: GridNameRendererComponent,
      sortable: true,
      comparator: customComparator
    },
    {
      field: 'status',
      headerName: 'STATUS',
      width: 160,
      cellRenderer: GridStatusRendererComponent,
      sortable: true,
    },
    {
      field: 'classifications',
      headerName: 'CLASSIFICATION',
      width: 170,
      cellRenderer: GridClassificationRendererComponent,
      sortable: true,
    },
    {
      field: 'startDate',
      headerName: 'ACTUAL START DATE',
      width: 150,
      valueFormatter: (params: { data: CandidatesDetailsModel }) =>
        `${valueHelper.formatDate(params.data.startDate, 'MM/dd/yyyy')}`,
      sortable: true,
    },
    {
      field: 'endDate',
      headerName: 'ACTUAL END DATE',
      width: 140,
      valueFormatter: (params: { data: CandidatesDetailsModel }) =>
        `${valueHelper.formatDate(params.data.endDate, 'MM/dd/yyyy')}`,
      sortable: true,
    },
    {
      field: 'scheduledDate',
      headerName: 'SCHEDULED DATE',
      width: 180,
      valueFormatter: (params: { data: CandidatesDetailsModel }) =>
        `${valueHelper.formatDate(params.data.scheduledDate, 'MM/dd/yyyy')}`,
      sortable: true,
    },
    {
      field: 'region',
      headerName: 'REGION',
      width: 140,
      sortable: true,
    },
    {
      field: 'location',
      headerName: 'LOCATION/DEPARTMENT',
      width: 220,
      valueFormatter: (params: { data: CandidatesDetailsModel }) =>
        `${params.data.location}, ${params.data.department}`,
      sortable: true,
    },
    {
      field: 'initialRate',
      headerName: 'INITIAL RATE',
      type: 'rightAligned',
      width: 170,
      sortable: true,
    },
    {
      field: 'billRate',
      headerName: 'CURRENT CANDIDATE RATE',
      type: 'rightAligned',
      width: 140,
      sortable: true,
    },
    {
      field: 'positionId',
      headerName: 'POSITION ID',
      width: 150,
      cellRenderer: GridPositionRendererComponent,
      sortable: true,
    },
    {
      field: 'assignment',
      headerName: 'ASSIGNMENT',
      width: 160,
      sortable: true,
    },
    {
      field: 'businessUnitName',
      width: 170,
      headerValueGetter: () => (!isAgency ? 'AGENCY NAME' : 'ORGANIZATION NAME'),
      sortable: true,
    },
    {
      field: 'skill',
      headerName: 'SKILL',
      width: 160,
      sortable: true,
    },
    {
      field: 'guaranteedWorkWeek',
      headerName: 'Expected Work Week',
      width: 160,
      sortable: true,
    },
    {
      field: 'requestComment',
      headerName: 'Leave Request Comments',
      width: 160,
      sortable: true,
    },  
    {
      field: 'primaryContactName',
      headerName: 'Primary Contact',
      width: 160,
      sortable: true,
    },            
  ];
};
export const CandidateAgencyExportColumns: CandidateExportColumn[] = [
  { text: 'Name', column: 'Name' },
  { text: 'Status', column: 'Status' },
  { text: 'Classification', column: 'Classification' },
  { text: 'Actual Start Date', column: 'StartDate' },
  { text: 'Actual End Date', column: 'EndDate' },
  { text: 'Scheduled Date', column: 'ScheduledDate' },
  { text: 'Region', column: 'Region' },
  { text: 'Location/Department', column: 'LocationDepartment' },
  { text: 'Initial Rate', column: 'InitialRate' },
  { text: 'Current Candidate Rate', column: 'BillRate' },
  { text: 'Position ID', column: 'PositionId' },
  { text: 'Assignment', column: 'Assignment' },
  { text: 'Organization Name', column: 'Organizationname' },
  { text: 'Skill', column: 'Skill' },
  { text: 'Expected Work Week', column: 'ExpectedWorkWeek' },
  { text: 'Leave Request Comments', column: 'RequestComment' },
  { text: 'Primary Contact', column: 'PrimaryContactName' },
];

export const CandidateOrgExportColumns: CandidateExportColumn[] = [
  { text: 'Name', column: 'Name' },
  { text: 'Status', column: 'Status' },
  { text: 'Classification', column: 'Classification' },
  { text: 'Actual Start Date', column: 'StartDate' },
  { text: 'Actual End Date', column: 'EndDate' },
  { text: 'Scheduled Date', column: 'ScheduledDate' },
  { text: 'Region', column: 'Region' },
  { text: 'Location/Department', column: 'LocationDepartment' },
  { text: 'Initial Rate', column: 'InitialRate' },
  { text: 'Current Candidate Rate', column: 'BillRate' },
  { text: 'Position ID', column: 'PositionId' },
  { text: 'Assignment', column: 'Assignment' },
  { text: 'Agency Name', column: 'Agencyname' },
  { text: 'Skill', column: 'Skill' },
  { text: 'Expected Work Week', column: 'ExpectedWorkWeek' },
  { text: 'Leave Request Comments', column: 'RequestComment' },  
  { text: 'Primary Contact', column: 'PrimaryContactName' },
];

