import { WorkCommitmentDetails, WorkCommitmentGrid } from '../interfaces';
import { getCorrectLocationValue, getCorrectSkillsValue } from '../helpers';
import { WorkCommitmentButtonRenderer } from '../components/work-commitment-button-renderer/work-commitment-button-renderer';
import { ValueFormatterParams } from '@ag-grid-community/core';
import { formatDate } from '@angular/common';
import { formatDate as formatDateString } from '@shared/constants/format-date';

export const WorkCommitmentColumnsDefinition = (editCallback: (commitment: WorkCommitmentGrid) => void) => [
  {
    headerName: '',
    minWidth: 130,
    sortable: false,
    cellRenderer: WorkCommitmentButtonRenderer,
    rowDrag: false,
    cellRendererParams: {
      edit: (commitment: WorkCommitmentGrid) => {
        editCallback(commitment);
      },
    },
  },
  {
    field: 'masterWorkCommitmentName',
    headerName: 'NAME',
    minWidth: 200,
    sortable: true,
  },
  {
    field: 'regionName',
    headerName: 'REGION',
    minWidth: 140,
    sortable: true,
    valueGetter: (params: { data: WorkCommitmentGrid }) => getCorrectLocationValue(params.data.regionName),
  },
  {
    field: 'locationName',
    headerName: 'LOCATION',
    minWidth: 140,
    sortable: true,
    valueGetter: (params: { data: WorkCommitmentGrid }) => getCorrectLocationValue(params.data.locationName),
  },
  {
    field: 'skillNames',
    headerName: 'SKILL',
    minWidth: 140,
    sortable: true,
    valueGetter: (params: { data: WorkCommitmentGrid }) => getCorrectSkillsValue(params.data.skillNames),
  },
  {
    field: 'minimumWorkExperience',
    headerName: 'MIN WORK EXPERIENCE',
    minWidth: 185,
    sortable: true,
  },
  {
    field: 'availabilityRequirement',
    headerName: 'AVAILABILITY REQUIREMENT',
    minWidth: 215,
    sortable: true,
  },
  {
    field: 'schedulePeriod',
    headerName: 'SCHEDULE PERIOD',
    minWidth: 160,
    sortable: true,
  },
  {
    field: 'criticalOrder',
    headerName: 'CRITICAL ORDER',
    minWidth: 150,
    sortable: true,
  },
  {
    field: 'holiday',
    headerName: 'HOLIDAY',
    minWidth: 110,
    sortable: true,
  },
  {
    field: 'startDate',
    headerName: 'Start Date',
    minWidth: 120,
    sortable: true,
    valueFormatter: (params: ValueFormatterParams) =>
        params.value && formatDate(params.value, formatDateString, 'en-US', 'UTC'),
  },
  {
    field: 'endDate',
    headerName: 'End Date',
    minWidth: 120,
    sortable: true,
    valueFormatter: (params: ValueFormatterParams) =>
        params.value && formatDate(params.value, formatDateString, 'en-US', 'UTC'),
  },
  {
    field: 'jobCode',
    headerName: 'JOB CODE',
    minWidth: 120,
    sortable: true,
  },
  {
    field: 'comments',
    headerName: 'COMMENT',
    minWidth: 220,
    sortable: true,
  },
];
