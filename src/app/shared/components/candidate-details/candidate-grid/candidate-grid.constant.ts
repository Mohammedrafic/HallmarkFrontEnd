import { GridHelper } from '@shared/helpers/grid.helper';
import { GridStatusRendererComponent } from '@shared/components/candidate-details/candidate-grid/grid-status-renderer/grid-status-renderer.component';
import { JobClassification } from '@shared/enums/job-classification';
import { GridNameRendererComponent } from '@shared/components/candidate-details/candidate-grid/grid-name-renderer/grid-name-renderer.component';
import { GridPositionRendererComponent } from '@shared/components/candidate-details/candidate-grid/grid-position-renderer/grid-position-renderer.component';
import { CandidatesDetailsModel } from '@shared/components/candidate-details/models/candidate.model';
import { GridClassificationRendererComponent } from './grid-classification-renderer/grid-classification-renderer.component';
import { CandidateExportColumn } from './candidate-grid.interface';

const valueHelper = new GridHelper();

export const CandidatesColumnsDefinition = (isAgency: boolean) => {
  return [
    {
      field: 'lastName',
      headerName: 'NAME',
      width: 160,
      cellRenderer: GridNameRendererComponent,
      sortable: true,
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
      headerName: 'START DATE',
      width: 150,
      valueFormatter: (params: { data: CandidatesDetailsModel }) =>
        `${valueHelper.formatDate(params.data.startDate, 'MM/dd/yyyy')}`,
      sortable: true,
    },
    {
      field: 'endDate',
      headerName: 'END DATE',
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
      width: 150,
      sortable: true,
    },
    {
      field: 'billRate',
      headerName: 'BILL RATE',
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
  ];
};
export const CandidateExportColumns : CandidateExportColumn[] = [
  { text: 'Name', column: 'Name' },
{ text: 'Status', column: 'Status' },
{ text: 'Classifications', column: 'Classifications' },
{text: 'StartDate',column:'StartDate'},
{text: 'EndDate',column:'EndDate'},
{ text: 'ScheduledDate', column: 'ScheduledDate' },
{ text: 'Region', column: 'Region' },
{ text: 'Location', column: 'Location' },
{ text: 'Department', column: 'Department' },
{ text: 'InitialRate', column: 'InitialRate' },
{ text: 'BillRate', column: 'BillRate' },
{ text: 'InitialRate', column: 'InitialRate' },
{ text: 'PositionId', column: 'PositionId' },
{ text: 'Assignment', column: 'Assignment' },
{ text: 'Agencyname', column: 'Agencyname' },
{ text: 'Skill', column: 'Skill' },
];
