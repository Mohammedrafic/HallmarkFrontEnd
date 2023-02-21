import { filterOptionFields, SkillFilterOptionFields } from '@core/constants/filters-helper.constant';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { SortOrder } from '@shared/enums/sort-order-dropdown.enum';
import { DepartmentFormFieldConfig, DepartmentFiltersColumns } from '../departments.model';
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
    title: 'Oriented',
    field: DepartmentFiltersColumnsEnum.ORIENTED,
  }
];

const commonColumnData = {
  type: ControlTypes.Multiselect,
  valueType: ValueType.Id,
  valueField: 'name',
  valueId: 'id',
};

export const FilterColumnConfig: DepartmentFiltersColumns = {
  regionIds: commonColumnData,
  locationIds: commonColumnData,
  departmentIds: commonColumnData,
  primarySkillIds: { ...commonColumnData, valueField: 'skillDescription' },
  secondarySkillIds: { ...commonColumnData, valueField: 'skillDescription' },
  startDate: { ...commonColumnData, type: ControlTypes.Date },
  endDate: { ...commonColumnData, type: ControlTypes.Date },
  oriented: { ...commonColumnData, type: ControlTypes.Radio },
};
