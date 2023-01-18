import { GridActionsCellComponent, GridActionsCellConfig } from '@shared/components/grid/cell-renderers/grid-actions-cell';
import { ValueFormatterParams } from '@ag-grid-community/core';
import { OrientationCompletedComponent } from './cell-renderers/orientation-completed/orientation-completed.component';
import { SkillMatchComponent } from './cell-renderers/skill-match/skill-match.component';
import { SkillNameComponent } from './cell-renderers/skill-name/skill-name.component';

export interface ColumnDefParams {
  editHandler: () => void;
  deleteHandler: () => void;
  dateFormatter: (date: string) => string;
}

export const columnDef = (columnParams: ColumnDefParams) => [
  {
    field: '',
    headerName: '',
    maxWidth: 100,
    cellRenderer: GridActionsCellComponent,
    cellRendererParams: (): GridActionsCellConfig => {
      return {
        actionsConfig: [
          {
            action: columnParams.editHandler,
            iconName: 'edit',
            iconClass: 'color-primary-active-blue-10',
            disabled: true,
          },
          {
            action: columnParams.deleteHandler,
            iconName: 'trash-2',
            iconClass: 'color-supportive-red',
            disabled: true,
          },
        ],
      };
    },
  },
  {
    field: 'departmentName',
    headerName: 'Department',
    flex: 1,
  },
  {
    field: 'regionName',
    headerName: 'Region',
    flex: 1,
  },
  {
    field: 'locationName',
    headerName: 'Location',
    flex: 1,
  },
  {
    field: 'skillMatch',
    headerName: 'Skill Match',
    cellRenderer: SkillMatchComponent,
    width: 100,
    minWidth: 100,
  },
  {
    field: 'skillName',
    headerName: 'Skill Name',
    cellRenderer: SkillNameComponent,
    flex: 1,
  },
  {
    field: 'isOriented',
    headerName: 'Orientation completed',
    cellRenderer: OrientationCompletedComponent,
    width: 140,
    minWidth: 140,
  },
  {
    field: 'startDate',
    headerName: 'Start Date',
    valueFormatter: (params: ValueFormatterParams) => columnParams.dateFormatter(params.value),
    maxWidth: 140,
  },
  {
    field: 'endDate',
    headerName: 'End Date',
    valueFormatter: (params: ValueFormatterParams) => columnParams.dateFormatter(params.value),
    maxWidth: 140,
  },
];
