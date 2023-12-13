import { DateTime } from "@syncfusion/ej2-angular-charts";

export class OrgInterface {
  id:                                   string;
  organizationId:                       number;
  etlprocessName:                       string;
  etlprocessNameFriendly:               null | string;
  description:                          null | string;
  fileNamePattern:                      string;
  fileExtension:                        string;
  columnDelimiter:                      string;
  hasHeader:                            boolean;
  hasDeleteFlag:                        null;
  importAllFilesIntheFolder:            boolean;
  processSameFileAgain:                 boolean | null;
  isEncryption:                         boolean;
  emailNotification:                    boolean;
  successNotification:                  boolean;
  fileNotFoundNotification:             boolean;
  sendMailSubject:                      string;
  sendMailFrom:                         string;
  emailRecipientsSuccess:               string;
  emailRecipientsCc:                    null | string;
  emailRecipientsError:                 string;
  notifyTo:                             null | string;
  ignoreLocationId:                     boolean | null;
  schemaName:                           string;
  tableName:                            string;
  container:                            string;
  blobPath:                             string;
  pathInput:                            null | string;
  pathOutput:                           null | string;
  pathArchive:                          string;
  fileNamePrefixEncrypted:              null | string;
  fileNamePrefixUnencrypted:            null | string;
  fileExtensionEncrypted:               null | string;
  fileExtensionUnencrypted:             null | string;
  masterStoredProcedureName:            null | string;
  inputFileFolder:                      null | string;
  inputFileSubFolder:                   null | string;
  inputFilePath:                        null | string;
  outputFilePath:                       null | string;
  lastUploadedDate:                     null;
  lastFileSucessfullyUploaded:          null | string;
  smtpserver:                           null | string;
  smtpport:                             number | null;
  credentialUserName:                   null | string;
  credentialPassword:                   null | string;
  sheetName:                            null | string;
  excelFilePath:                        null | string;
  includeColumnHeader:                  number;
  configuration:                        null | string;
  importHistoryData:                    boolean;
  enableSsl:                            boolean;
  dbname:                               string;
  retentionPeriodInDays:                number | null;
  regionId:                             number | null;
  regionName:                           null | string;
  regionSpecific:                       boolean | null;
  primaryId:                            null | string;
  departmentKeyId:                      null | string;
  process:                              boolean | null;
  allowapplicationofMultipleRules:      boolean | null;
  statisticsWidget:                     null | string;
  remaptoContractCostCenter:            boolean | null;
  importThroughSftp:                    boolean | null;
  considerTermDateAsEndMonth:           boolean | null;
  isValidationPayments:                 boolean | null;
  isReversalRequired:                   boolean | null;
  isSendAccrualFromPayroll:             boolean | null;
  cleanImport:                          boolean | null;
  basedOnRegcontractedHrs:              boolean | null;
  deptIdbasedOnContract:                boolean | null;
  isShowIndividualCreditRecordForDebit: boolean | null;
  isExport:                             boolean;
  modifiedBy:                           null;
  createdBy:                            null;
  createdDate:                          DateTime | null;
  modifiedDate:                         DateTime | null;
  activatedDate:                        null;
  activatedBy:                          null;
  isActive:                             boolean;
  isDeleted:                            boolean;
  discriminator:                        null | string;
  emailRecipientsBcc:                   null | string;
  configurationParameters:              any[];
  integrationConfigColumnMappings:      any[];
  createdAt:                            DateTime;
  lastModifiedAt:                       DateTime;
  lastModifiedBy:                       null;

}

export class OrgInterfacePage {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    items: OrgInterface[];
    pageNumber: number;
    totalCount: number;
    totalPages: number;
  }



  export class LogInterfacePage {
    items:           LogInterface[];
    pageNumber:      number;
    totalPages:      number;
    totalCount:      number;
    hasPreviousPage: boolean;
    hasNextPage:     boolean;
}

export class LogInterface {
    id:               string;
    configurationId:  string;
    organizationId:   number;
    runId:            string;
    originalFileName: string;
    processDate:      DateTime;
    status:           LogInterfaceStatus;
    totalRows:        number;
    insertedRecord:   number;
    updatedRecord:    number;
    failedRecord:     number;
    skippedRecord:    number;
}

export class InterfaceLogSummaryIRPPage {
  items:           InterfaceLogSummary[];
  pageNumber:      number;
  totalPages:      number;
  totalCount:      number;
  hasPreviousPage: boolean;
  hasNextPage:     boolean;
}

export class InterfaceLogSummary {
  id:               number;
  organizationId:   number;
  importType:       string;
  originalFileName:     string;
  createdAt:      DateTime;
  status:           string;
  totalRows:        number;
  insertedRecord:   number;
  updatedRecord:    number;
  failedRecord:     number;
  infaceLogSummaryId:string;
}

export class InterfaceLogSummaryIRPDetailsPage {
  items:           InterfaceLogSummaryDetails[];
  pageNumber:      number;
  totalPages:      number;
  totalCount:      number;
  hasPreviousPage: boolean;
  hasNextPage:     boolean;
}
export class InterfaceLogSummaryDetails{
  id: number;
  interfaceLogId: number;
  employeeID: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  dOB: string | null;
  primarySkill: string | null;
  secondarySkill: string | null;
  classification: string | null;
  hireDate: string | null;
  fTE: string | null;
  hRCompanyCode: string | null;
  internalTransferRecruitment: string | null;
  contract: string | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  address: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  zipCode: string | null;
  email: string | null;
  workEmail: string | null;
  cellphone: string | null;
  alternativePhone: string | null;
  professionalSummary: string | null;
  profileStatus: string | null;
  holdStartDate: string | null;
  holdEndDate: string | null;
  terminationDate: string | null;
  terminationReason: string | null;
  homeLocation: string | null;
  homeDepartment: string | null;
  errorDescriptions: string[];
  status: string | null;
}

export enum LogInterfaceStatus {
    CopyDataActivityFailed = "Copy Data Activity Failed",
    ImportedSuccessfully = "Imported Successfully",
}

export class LogTimeSheetHistoryPage {
  items:           LogTimeSheetHistory[];
  pageNumber:      number;
  totalPages:      number;
  totalCount:      number;
  hasPreviousPage: boolean;
  hasNextPage:     boolean;
}

export class LogTimeSheetHistory {
  id:               number;
  timesheetitemid:  number;
  employeeid:       string;
  fname:            null;
  mname:            null;
  lname:            null;
  locationId:       string;
  costcenterId:     string;
  workedlocationid: string;
  workedccid:       string;
  shiftType:        string;
  punchIndate:      string;
  punchIntime:      string;
  punchOutdate:     string;
  punchOuttime:     string;
  lunch:            string;
  totalHours:       string;
  jobcode:          string;
  deleted:          null;
  organizationId:   number;
  runId:            string;
  status:           number;
  failureReason:    string;
  jobId:            null;
  billRateConfigId: null;
  createdDate:      Date;
  weekStartDate:    null;
}

export class EmpGeneralNoteImportDetails{
  id: number;
  interfaceLogId: number;
  employeeID: string | null;
  date : string | null
  category : string | null
  note : string | null
  errorDescriptions: string[];
  status: string | null;
}

export class EmpGeneralNoteImportDetailsPage {
  items:           EmpGeneralNoteImportDetails[];
  pageNumber:      number;
  totalPages:      number;
  totalCount:      number;
  hasPreviousPage: boolean;
  hasNextPage:     boolean;
}