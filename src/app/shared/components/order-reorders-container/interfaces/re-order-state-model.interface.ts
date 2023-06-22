import { ReOrderPage } from ".";

export interface ReorderStateModel {
  reOrderPage: ReOrderPage | null,
  pageSettings: PageSettings,
}

export interface PageSettings {
  pageNumber: number,
  pageSize: number,
  refreshPager: boolean,
}
