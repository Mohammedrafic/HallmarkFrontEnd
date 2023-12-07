import { IntegrationFilterDto, IntegraionFailFilterDto } from "../../shared/models/integrations.model";

const integrationsStatePrefix = '[integrations]';

export class GetLast12MonthIntegrationRuns {
  static readonly type = `${integrationsStatePrefix} Get Last 12 Months Run Integrations`;
  constructor(public payload: IntegrationFilterDto) { }
}

export class GetLast12MonthFailIntegrationRuns {
  static readonly type = `${integrationsStatePrefix} Get Last 12 Months Runs Failure Integrations`;
  constructor(public payload: IntegraionFailFilterDto) { }
}
