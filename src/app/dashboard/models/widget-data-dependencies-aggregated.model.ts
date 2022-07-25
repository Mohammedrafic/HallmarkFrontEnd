import type { PanelModel } from '@syncfusion/ej2-angular-layouts';
import { TimeSelectionEnum } from '../enums/time-selection.enum';
import type { DashboardFiltersModel } from './dashboard-filters.model';

export type WidgetDataDependenciesAggregatedModel = [PanelModel[], DashboardFiltersModel, TimeSelectionEnum];
