import { GroupMailStatus } from "@admin/alerts/group-email.enum";
import { PageOfCollections } from "./page.model";

export type GroupEmail = {
    id:number,
    subjectMail:string,
    bodyMail:string,
    toList:string |null,
    cCList:string | null,
    bCCList:string | null,
    status:GroupMailStatus |null,
    fromMail:string | null,
    businessUnitId:number |null
  };
  export type GroupEmailRequest = {
    businessUnitId:number|null
  };
  export type GroupEmailByBusinessUnitIdPage = PageOfCollections<GroupEmail>;
  export type GroupEmailFilters = {
  };