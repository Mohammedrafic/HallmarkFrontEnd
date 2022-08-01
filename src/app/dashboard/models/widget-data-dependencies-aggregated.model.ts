import type { PanelModel } from '@syncfusion/ej2-angular-layouts';
import { TimeSelectionEnum } from '../enums/time-selection.enum';
import { DashboartFilterDto } from './dashboard-filter-dto.model';

export type WidgetDataDependenciesAggregatedModel = [PanelModel[], DashboartFilterDto, TimeSelectionEnum];
