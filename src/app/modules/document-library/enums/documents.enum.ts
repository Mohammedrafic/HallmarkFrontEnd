export enum FileType {
  Folder='folder',
  File='file',
  Link='link'
}
export enum MoreMenuType {
  'Edit',
  'Print',
  'Delete',
}

export enum DocType {
  'Test1'=1,
  'Test2'=2,
  'Test3'=3
}

export enum StatusEnum {
  'Active',
  'In-Active'
}

export enum FormControlNames {
  FolderName = 'folderName',
  Agencies = 'agencies',
  Orgnizations = 'orgnizations',
  OrgnizationIds = 'organizationIds',
  RegionIds = 'regionIds',
  LocationIds = 'locationIds',
  DocumentName = 'documentName',
  TypeIds = 'typeIds',
  Tags = 'tags',
  StatusIds = 'statusIds',
  StartDate = 'startDate',
  EndDate = 'endDate',
}

export enum FormDailogTitle {
  AddNewFolder = 'Add New Folder',
  Upload = 'Upload'
}

export enum documentsColumnField {
  Id = 'docId',
  DocumentName = 'name',
  Organization = 'organization',
  Status = "status",
  Region = 'region',
  Location = 'location',
  Role='role',
  Type = 'type',
  Tags = 'tags',
  StartDate = 'startDate',
  EndDate = 'endDate',
  SharedWith = 'sharedWith',
  Comments='comments'
}

export enum documentsColumnHeaderText {
  Id = 'Document Id',
  DocumentName = 'Document Name',
  Organization = 'Organization',
  Status = "Status",
  Region = 'Region',
  Location = 'Location',
  Role = 'Role',
  Type = 'Type',
  Tags = 'Tags',
  StartDate = 'Start Date',
  EndDate = 'End Date',
  SharedWith = 'Shared With',
  Comments = 'Comments'
}
