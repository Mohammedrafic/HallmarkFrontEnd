import { GroupMailStatus } from "@admin/alerts/group-email.enum";
import { StringMap } from "@angular/compiler/src/compiler_facade_interface";
import { type } from "os";
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
    businessUnitId:number |null,
    sentBy:string,
    sentOn:string,
    statusString:string
  };
  export type GroupEmailRequest = {
    businessUnitId:number|null
  };
  export type GroupEmailByBusinessUnitIdPage = PageOfCollections<GroupEmail>;
  export type GroupEmailFilters = {
  };
  export type SendGroupEmailRequest = {  
    subjectMail:string,
    bodyMail:string,
    toList:string |null,
    cCList:string | null,
    bCCList:string | null,
    status:GroupMailStatus |null,
    fromMail:string | null,
    businessUnitId: number | null
    selectedFile?: Blob | null,
    businessUnitType: number | null,
    userType: number | null
  };

export type GroupEmailRole = {
  id:number,
  name:string
}
