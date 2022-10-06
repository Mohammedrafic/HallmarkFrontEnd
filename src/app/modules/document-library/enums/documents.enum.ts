export enum FileType {
  Folder='folder',
  File='file',
  Link='link'
}
export enum MoreMenuType {
  'Edit',
  'Delete',
  'Share',
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
  Comments ='comments'
}

export enum FormDailogTitle {
  AddNewFolder = 'Add New Folder',
  Upload = 'Upload'
}

export enum documentsColumnField {
  Id = 'id',
  Name = 'name',
  FileName = 'fileName',
  FolderId = 'folderId',
  FolderName = 'folderName',
  StartDate = 'startDate',
  EndDate = 'endDate',
  DocType = 'docType',
  DocTypeName = 'docTypeName',
  UploadedBy = 'uploadedBy',
  UploadedByName = 'uploadedByName',
  Tags = 'tags',
  Status = "status",
  Comments ='comments',
  OrganizationName = 'organization',
  RegionName = 'region',
  LocationName = 'location',
}

export enum documentsColumnHeaderText {
  Id = 'Document Id',
  Name = 'Document Name',
  FileName = 'File Name',
  FolderId = "Folder Id",
  FolderName = 'Folder Name',
  StartDate = 'Start Date',
  EndDate = 'End Date',
  DocType = 'DocType Id',
  DocTypeName = 'DocType Name',
  UploadedBy = 'Uploaded By',
  UploadedByName = 'Uploaded By Name',
  Tags = 'Tags',
  Status = 'Status',
  Comments = 'Comments',
  OrganizationName = 'Organization Name',
  RegionName = 'Region Name',
  LocationName = 'Location Name'
}
