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

export enum LogInterfaceStatus {
    CopyDataActivityFailed = "Copy Data Activity Failed",
    ImportedSuccessfully = "Imported Successfully",
}