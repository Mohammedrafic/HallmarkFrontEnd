import { ValueFormatterParams } from '@ag-grid-community/core';
import { formatDate } from '@angular/common';
import { OrientationConfiguration } from '../models/orientation.model';
import { formatDate as formatDateString } from '@shared/constants/format-date';
import { OrientationGridActionRendererComponent } from '../components/orientation-grid/grid-action-renderer/grid-action-renderer.component';
import { SkillNameRendererComponent } from '../components/orientation-grid/skill-name-renderer/skill-name.component';
import { SkillCategoryRendererComponent } from '../components/orientation-grid/skill-category-renderer/skill-category.component';

export const OrientationColumnDef = (
  editCallback: (value: OrientationConfiguration) => void,
  deleteCallback: (value: OrientationConfiguration) => void
) => ([
  {
    field: '',
    headerName: '',
    cellRenderer: OrientationGridActionRendererComponent,
    maxWidth: 100,
    cellRendererParams: {
      edit: (value: OrientationConfiguration) => {
        editCallback(value);
      },
      delete: (value: OrientationConfiguration) => {
        deleteCallback(value);
      }
    }
  },
  {
    field: 'startDate',
    headerName: 'Start Date',
    valueFormatter: (params: ValueFormatterParams) =>
      formatDate(params.value, formatDateString, 'en-US', 'UTC'),
    maxWidth: 120,
  },
  {
    field: 'endDate',
    headerName: 'End Date',
    valueFormatter: (params: ValueFormatterParams) =>
      params.value && formatDate(params.value, formatDateString, 'en-US', 'UTC'),
    maxWidth: 120,
  },
  {
    field: 'regions',
    headerName: 'Region',
    valueFormatter: (params: ValueFormatterParams) =>
      params.value.length ? params.value.map((v: { name: string }) => v.name).join(', ') : 'All',
    flex: 1,
    minWidth: 185,
  },
  {
    field: 'locations',
    headerName: 'Location',
    valueFormatter: (params: ValueFormatterParams) =>
      params.value.length ? params.value.map((v: { name: string }) => v.name).join(', ') : 'All',
    flex: 1,
    minWidth: 185,
  },
  {
    field: 'departments',
    headerName: 'Department',
    valueFormatter: (params: ValueFormatterParams) =>
      params.value.length ? params.value.map((v: { departmentName: string }) => v.departmentName).join(', ') : 'All',
    flex: 1,
    minWidth: 185,
  },
  {
    field: 'skillCategories',
    headerName: 'Skill Category',
    cellRenderer: SkillCategoryRendererComponent,
    flex: 1,
    minWidth: 185,
  },
  {
    field: 'orientationConfigurationSkills',
    headerName: 'Skill',
    cellRenderer: SkillNameRendererComponent,
    flex: 1,
    minWidth: 160,
  },
  {
    field: 'completedOrientation',
    headerName: 'Complete Orient. In (Days)',
    flex: 1,
    minWidth: 230,
  },
  {
    field: 'removeOrientation',
    headerName: 'Remove Orient. (Days)',
    flex: 1,
    minWidth: 200,
  },
]);
