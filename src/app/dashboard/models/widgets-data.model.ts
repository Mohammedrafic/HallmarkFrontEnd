import { WidgetTypeEnum } from '../enums/widget-type.enum';
import type { CandidatesByStateWidgetAggregatedDataModel } from './candidates-by-state-widget-aggregated-data.model';
import type { ChartAccumulation } from './chart-accumulation-widget.model';
import type { PositionsByTypeAggregatedModel } from './positions-by-type-aggregated.model';
import { CandidatesPositionDataModel } from './candidates-positions.model';
import { PositionTrend } from './position-trend.model';
import { OrgDetailsInfoModel } from './org-details-info.model';

export interface WidgetsDataModel {
  [WidgetTypeEnum.APPLICANTS_BY_REGION]: CandidatesByStateWidgetAggregatedDataModel;
  [WidgetTypeEnum.APPLICANTS_BY_POSITIONS]: CandidatesByStateWidgetAggregatedDataModel;
  [WidgetTypeEnum.CANDIDATES]: ChartAccumulation;
  [WidgetTypeEnum.POSITIONS_BY_TYPES]: PositionsByTypeAggregatedModel;
  [WidgetTypeEnum.IN_PROGRESS_POSITIONS]: CandidatesPositionDataModel;
  [WidgetTypeEnum.OPEN_POSITIONS]: CandidatesPositionDataModel;
  [WidgetTypeEnum.FILLED_POSITIONS]: CandidatesPositionDataModel;
  [WidgetTypeEnum.ACTIVE_POSITIONS]: ChartAccumulation;
  [WidgetTypeEnum.TASKS]: string;
  [WidgetTypeEnum.FILLED_POSITIONS_TREND]: PositionTrend;
  [WidgetTypeEnum.CHAT]: string;
  [WidgetTypeEnum.INVOICES]: string;
  [WidgetTypeEnum.OPEN_POSITIONS_TREND]: PositionTrend;
  [WidgetTypeEnum.IN_PROGRESS_POSITIONS_TREND]: PositionTrend;
  [WidgetTypeEnum.LTA_ORDER_ENDING]: CandidatesPositionDataModel;
  [WidgetTypeEnum.ORG]: OrgDetailsInfoModel;
}
