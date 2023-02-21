import { filterOptionFields, SkillFilterOptionFields } from '@core/constants/filters-helper.constant';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { SortOrder } from '@shared/enums/sort-order-dropdown.enum';
import { DepartmentFormFieldConfig } from '../departments.model';
import { DepartmentFiltersColumnsEnum } from '../../enums';

export const DepartmentFilterFormConfig = (): DepartmentFormFieldConfig<DepartmentFiltersColumnsEnum>[] => [
  {
    type: ControlTypes.Multiselect,
    title: 'Region ',
    field: DepartmentFiltersColumnsEnum.REGION,
    sortOrder: SortOrder.NONE,
    optionFields: filterOptionFields,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Location ',
    field: DepartmentFiltersColumnsEnum.LOCATION,
    sortOrder: SortOrder.ASCENDING,
    optionFields: filterOptionFields,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Department',
    field: DepartmentFiltersColumnsEnum.DEPARTMENT,
    sortOrder: SortOrder.ASCENDING,
    optionFields: filterOptionFields,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Primary Skill',
    field: DepartmentFiltersColumnsEnum.PRIMARY_SKILLS,
    optionFields: SkillFilterOptionFields,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Secondary Skill',
    field: DepartmentFiltersColumnsEnum.SECONDARY_SKILLS,
    optionFields: SkillFilterOptionFields,
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
