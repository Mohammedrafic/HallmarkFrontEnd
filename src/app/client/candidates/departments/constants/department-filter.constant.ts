import { filterOptionFields, SkillFilterOptionFields } from '@core/constants/filters-helper.constant';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { SortOrder } from '@shared/enums/sort-order-dropdown.enum';
import { DepartmentFormFieldConfig, DepartmentFiltersColumns } from '../departments.model';
import { DepartmentFiltersColumnsEnum } from '../../enums';

export const DepartmentFilterFormConfig = (): ReadonlyArray<
  DepartmentFormFieldConfig<DepartmentFiltersColumnsEnum>
> => [
  {
    type: ControlTypes.Multiselect,
    title: 'Region',
    field: DepartmentFiltersColumnsEnum.REGION,
    sortOrder: SortOrder.NONE,
    optionFields: filterOptionFields,
  },
  {
    type: ControlTypes.Multiselect,
    title: 'Location',
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
    title: 'Skill',
    field: DepartmentFiltersColumnsEnum.SKILLS,
    optionFields: SkillFilterOptionFields,
  },
  {
    type: ControlTypes.Radio,
    title: 'Oriented',
    field: DepartmentFiltersColumnsEnum.ORIENTED,
  },
];

const commonColumnData = {
  type: ControlTypes.Multiselect,
  valueType: ValueType.Id,
  valueField: 'name',
  valueId: 'id',
  dataSource: [],
};

export const FilterColumnConfig: DepartmentFiltersColumns = {
  regionIds: commonColumnData,
  locationIds: commonColumnData,
  departmentsIds: commonColumnData,
  skillIds: { ...commonColumnData, valueField: 'skillDescription' },
  isOriented: { ...commonColumnData, type: ControlTypes.Radio, dataSource: { 1: 'Oriented', 2: 'Not Oriented' } },
};

export const OrientedFilterPayload: (boolean | null)[] = [null, true, false];
