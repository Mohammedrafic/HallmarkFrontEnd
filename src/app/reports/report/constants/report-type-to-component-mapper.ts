import { BaseReportDirective } from '../report-types/base-report.directive';
import { ReportTypeEnum } from '../enums/report-type.enum';
import { SingleComponentModuleModel } from '@shared/models/single-component-module.model';

export const reportTypeToComponentMapper: Record<
  ReportTypeEnum,
  () => Promise<SingleComponentModuleModel<BaseReportDirective<unknown>, unknown>>
> = {
  [ReportTypeEnum.CANDIDATES]: () => import('../report-types/candidates-report/candidates-report.component'),
  [ReportTypeEnum.FILL_RATES]: () => import('../report-types/fillrates-report/fillrates-report.component'),
};
