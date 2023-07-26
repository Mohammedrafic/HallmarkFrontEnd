import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import { FieldType } from '@core/enums';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { FiltersColumnConfig, OpenJobFilterConfig, OrderTypeSource } from '../../../interfaces';
import { OrderJobType } from '../../../enums';
import { AllOrderTypeOption } from '../../../constants';

export const OrderTypeSources: OrderTypeSource[] = [
  {
    text: 'All',
    value: AllOrderTypeOption,
  },
  {
    text: 'Per Diem',
    value: OrderJobType.PerDiem,
  },
  {
    text: 'LTA',
    value: OrderJobType.LTA,
  },
];

export const OptionFields: FieldSettingsModel = { text: 'text', value: 'value' };

export const OpenJobConfig: OpenJobFilterConfig[] = [
  {
    field: 'orderType',
    title: 'Order Type',
    fieldType: FieldType.Dropdown,
    required: true,
    sources: OrderTypeSources,
  },
];

export const FilterColumns: FiltersColumnConfig = {
  orderType: {
    type: ControlTypes.Dropdown,
    valueType: ValueType.Id,
    dataSource: OrderTypeSources,
    valueField: 'text',
    valueId: 'value',
    filterTitle: 'Order Type',
  },
};
