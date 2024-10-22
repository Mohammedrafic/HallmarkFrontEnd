import { PageOfCollections } from "./page.model";

export class Region {
  id?: number;
  name: string;
}
export type regionsPage = PageOfCollections<Region>;
export class RegionMapping {
  id: number;
  name?: string;
}

export class regionFilter {
  ids?: number[];
  name?:string[];
  orderBy?: string;
  pageSize?: number;
  pageNumber?: number;
  getAll?:boolean;
}

export type ImportedRegion = {
  orgName: string;
  regionName: string;
}
