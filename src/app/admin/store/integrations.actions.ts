import { IntegrationFilterDto, IntegraionFailFilterDto, ScheduledIntegrationsFilterDto } from "../../shared/models/integrations.model";

const integrationsStatePrefix = '[integrations]';

export class GetLast12MonthIntegrationRuns {
  static readonly type = `${integrationsStatePrefix} Get Last 12 Months Run Integrations`;
  constructor(public payload: IntegrationFilterDto) { }
}

export class GetLast12MonthFailIntegrationRuns {
  static readonly type = `${integrationsStatePrefix} Get Last 12 Months Runs Failure Integrations`;
  constructor(public payload: IntegraionFailFilterDto) { }
}

export class GetNewInterfaceList {
  static readonly type = `${integrationsStatePrefix} Get Latest Interface List`;
  constructor(public payload: IntegrationFilterDto) { }
}

export class GetRecentRunsList {
  static readonly type = `${integrationsStatePrefix} GetRecentRunsListQuery`;
  constructor(public payload: IntegrationFilterDto) { }
}

export class GetScheduledIntegrationsList{
  static readonly type = `${integrationsStatePrefix} Get Scheduled Run List`;
  constructor(public payload :  ScheduledIntegrationsFilterDto) {}
}