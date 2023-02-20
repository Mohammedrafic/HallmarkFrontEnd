import { ControlTypes } from '@shared/enums/control-types.enum';
import { DepartmentFilterFieldConfig } from '../departments/departments.model';
import { DepartmentFiltersColumnsEnum } from '../enums';

export const DepartmentFilterFormConfig = (): DepartmentFilterFieldConfig[] => [
  {
    type: ControlTypes.Multiselect,
    title: 'Region ',
    field: DepartmentFiltersColumnsEnum.REGION,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Location ',
    field: DepartmentFiltersColumnsEnum.LOCATION,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Department',
    field: DepartmentFiltersColumnsEnum.DEPARTMENT,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Primary Skill',
    field: DepartmentFiltersColumnsEnum.PRIMARY_SKILLS,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Secondary Skill',
    field: DepartmentFiltersColumnsEnum.SECONDARY_SKILLS,
  },
  {
    type: ControlTypes.Date,
    title: 'Start Date',
    field: DepartmentFiltersColumnsEnum.START_DATE,
    isShort: true,
  },
  {
    type: ControlTypes.Date,
    title: 'End Date',
    field: DepartmentFiltersColumnsEnum.END_DATE,
    isShort: true,
  },
  {
    type: ControlTypes.Radio,
    title: 'Both',
    field: DepartmentFiltersColumnsEnum.BOTH,
    isShort: true,
  },
  {
    type: ControlTypes.Radio,
    title: 'Oriented',
    field: DepartmentFiltersColumnsEnum.ORIENTED,
    isShort: true,
  },
  {
    type: ControlTypes.Radio,
    title: 'Not Oriented',
    field: DepartmentFiltersColumnsEnum.NOT_ORIENTED,
    isShort: true,
  },
];
