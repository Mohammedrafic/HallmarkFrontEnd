import { IntegrationFilterDto } from "../../shared/models/integrations.model";

const integrationsStatePrefix = '[integrations]';

export class GetLast12MonthIntegrationRuns {
  static readonly type = `${integrationsStatePrefix} Get Last 12 Months Run Integrations`;
  constructor(public payload: IntegrationFilterDto) { }
}
