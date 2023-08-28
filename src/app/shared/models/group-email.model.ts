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
    fileName:string | null,
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


export class DownloadDocumentDetail {
  id: number;
  extension: string;
  fileAsBase64: string;
  sasUrl: string;
  status: number;
  fromMail: string;
  sentOn: Date;
  subjectMail: string;
  bodyMail: string;
  toList: string;
  ccList: string;
  bccList: string;
  businessUnitId: number | null;
  sentBy : string;
  statusString : string;
  fileName: string;
  userType: any;
  businessUnitType: any;
  contentType:any;
}

export class DownloadPreviewDetail {
  id: number;
  extension: string;
  fileAsBase64: string;
  sasUrl: string;
  status: number;
  fromMail: string;
  sentOn: Date;
  subjectMail: string;
  bodyMail: string;
  toList: string;
  ccList: string;
  bccList: string;
  businessUnitId: number | null;
  sentBy : string;
  statusString : string;
  fileName: string;
  userType: any;
  businessUnitType: any;
  contentType: string;
}
