export interface IntegrationMonthReportModel {
  monthlyIntegrationRunsCount: number;
  monthName: string;
} 
export interface NewInterfaceListModel {
  organizationId: string;
  organizationName: string;
  interfaceId:string;
  interfaceName:string;
  integrationType:string;
}

export interface NewInterfaceListdata {
  id: string;
  title: string;
  interfacedata: NewInterfaceListModel[];
}

export interface ScheduledIntegrationsListModel {
  organizationId: string;
  organizationName: string;
  interfaceId:string;
  interfaceName:string;
  integrationType:string;
  runTime : Date;
}

export interface ScheduledIntegrationsListData {
  id: string;
  title: string;
  interfacedata: ScheduledIntegrationsListModel[];
}