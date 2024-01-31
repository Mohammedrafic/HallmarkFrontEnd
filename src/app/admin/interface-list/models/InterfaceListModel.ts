import { PageOfCollections } from "../../../shared/models/page.model";

export interface InterfaceListModel {
  organizationId: string;
  integrationType: string;
  etlFileName: string;
  numberOfClients: number;
  failures: number;
  frequency: string;
} 

export type InterfaceListPage = PageOfCollections<InterfaceListModel>;
export class InterfaceListFilter {
  organizationId?: string[];
  integrationType?: string[];
  etlFileName?: string[];
  numberOfClients?: string[];
  failures?: number[];
  frequency?: string[];
  orderBy?: string;
  pageSize?: number;
  pageNumber?: number;
  getAll?: boolean;
}
