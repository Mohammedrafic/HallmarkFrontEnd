import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { ExportColumn } from '@shared/models/export.model';

export const RateSetupFilters = {
    regionIds: {
      type: ControlTypes.Multiselect,
      valueType: ValueType.Id,
      dataSource: [],
      valueField: 'name',
      valueId: 'id',
    },
    locationIds: {
      type: ControlTypes.Multiselect,
      valueType: ValueType.Id,
      dataSource: [],
      valueField: 'name',
      valueId: 'id',
    },
    departmentIds: {
      type: ControlTypes.Multiselect,
      valueType: ValueType.Id,
      dataSource: [],
      valueField: 'name',
      valueId: 'id',
    },
    skillIds: {
      type: ControlTypes.Multiselect,
      valueType: ValueType.Id,
      dataSource: [],
      valueField: 'skillDescription',
      valueId: 'id',
    },
    billRateConfigIds: {
      type: ControlTypes.Multiselect,
      valueType: ValueType.Id,
      dataSource: [],
      valueField: 'title',
      valueId: 'id',
    },
    orderTypes: {
      type: ControlTypes.Multiselect,
      valueType: ValueType.Id,
      dataSource: [],
      valueField: 'name',
      valueId: 'id',
    },
    billRateCategories: {
      type: ControlTypes.Multiselect,
      valueType: ValueType.Id,
      dataSource: [],
      valueField: 'name',
      valueId: 'id',
    },
    billRateTypes: {
      type: ControlTypes.Multiselect,
      valueType: ValueType.Id,
      dataSource: [],
      valueField: 'name',
      valueId: 'id',
    },
    effectiveDate: { type: ControlTypes.Date, valueType: ValueType.Text },
    intervalMin: { type: ControlTypes.Text, valueType: ValueType.Text },
    intervalMax: { type: ControlTypes.Text, valueType: ValueType.Text },
    considerForWeeklyOt: {
      type: ControlTypes.Checkbox,
      valueType: ValueType.Text,
      checkBoxTitle: 'Consider for Weekly OT',
    },
    considerForDailyOt: {
      type: ControlTypes.Checkbox,
      valueType: ValueType.Text,
      checkBoxTitle: 'Consider for Daily OT',
    },
    considerFor7thDayOt: {
      type: ControlTypes.Checkbox,
      valueType: ValueType.Text,
      checkBoxTitle: 'Consider for 7th Day OT',
    },
    displayInJob: { type: ControlTypes.Checkbox, valueType: ValueType.Text, checkBoxTitle: 'Display in Job' },
  };

export const rateColumnsToExport: ExportColumn[] = [
    { text: 'Region', column: 'Region' },
    { text: 'Location', column: 'Location' },
    { text: 'Department', column: 'Department' },
    { text: 'Skill', column: 'Skill' },
    { text: 'Order Type', column: 'OrderType' },
    { text: 'Bill Rate Title', column: 'BillRateTitle' },
    { text: 'Bill Rate Category', column: 'BillRateCategory' },
    { text: 'Bill Rate Type', column: 'BillRateType' },
    { text: 'Effective Date', column: 'EffectiveDate' },
    { text: 'Bill Rate Value (Rate/Times)', column: 'BillRateValue' },
    { text: 'Interval Min', column: 'IntervalMin' },
    { text: 'Interval Max', column: 'IntervalMax' },
    { text: 'Consider For Weekly OT', column: 'ConsiderForWeeklyOT' },
    { text: 'Consider For Daily OT', column: 'ConsiderForDailyOT' },
    { text: 'Consider For 7th Day OT', column: 'ConsiderFor7thDayOT' },
    { text: 'Display In Job', column: 'DisplayInJob' },
];
