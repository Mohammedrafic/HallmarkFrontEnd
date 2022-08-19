import { PageOfCollections } from "./page.model";

export type AlertsTemplate = {
    id?: number;
    alert: string;
    status: string;
  };
  
  export type AlertsTemplatePage = PageOfCollections<AlertsTemplate>;
  export type AlertsTemplateFilters = {
  };