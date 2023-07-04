import { WidgetTypeEnum } from '../enums/widget-type.enum';
import type { CandidatesByStateWidgetAggregatedDataModel } from './candidates-by-state-widget-aggregated-data.model';
import type { ChartAccumulation } from './chart-accumulation-widget.model';
import type { PositionsByTypeAggregatedModel } from './positions-by-type-aggregated.model';
import { CandidatesPositionDataModel } from './candidates-positions.model';
import { PositionTrend } from './position-trend.model';
import { CandidateStatusDataModel } from './candidate-status-dto.model';
import { OrgDetailsInfoModel } from './org-details-info.model';
import { AgencyPositionModel } from './agency-position.model';
import { RnUtilizationModel } from './rnutilization.model';
import { ExpiryDetailsModel } from './expiry.model';
import { AvailableEmployeeModel } from './available-employee.model';

export interface WidgetsDataModel {
  [WidgetTypeEnum.APPLICANTS_BY_REGION]: CandidatesByStateWidgetAggregatedDataModel;
  [WidgetTypeEnum.APPLICANTS_BY_POSITIONS]: CandidatesByStateWidgetAggregatedDataModel;
  [WidgetTypeEnum.CANDIDATES]: ChartAccumulation;
  [WidgetTypeEnum.AVERAGE_DAY_ACTIVE_POSITIONS]: ChartAccumulation;
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
  [WidgetTypeEnum.Candidate_Applied_In_Last_N_Days]: CandidateStatusDataModel;
  [WidgetTypeEnum.ORG]: OrgDetailsInfoModel;
  [WidgetTypeEnum.AGENCY_POSITION_COUNT]: AgencyPositionModel;
  [WidgetTypeEnum.RN_UTILIZATION]: RnUtilizationModel;
  [WidgetTypeEnum.ALREADY_EXPIRED_CREDS] : ExpiryDetailsModel[];
  [WidgetTypeEnum.UPCOMING_EXP_CREDS] : ExpiryDetailsModel[];
  [WidgetTypeEnum.AVAILABLE_EMPLOYEE] : AvailableEmployeeModel[];
}
