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