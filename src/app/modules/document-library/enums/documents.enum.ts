export enum FileType {
  Folder = 'folder',
  File = 'file',
  Link = 'link'
}
export enum MoreMenuType {
  'Edit',
  'Delete',
  'Share',
  'UnShare'
}

export enum DocType {
  'Test1' = 1,
  'Test2' = 2,
  'Test3' = 3
}

export enum StatusEnum {
  'Active',
  'Inactive'
}

export enum FormControlNames {
  FolderName = 'folderName',
  Agencies = 'agencies',
  AllAgencies = 'allagencies',
  Orgnizations = 'orgnizations',
  AllOrgnizations = 'allorgnizations',
  OrgnizationIds = 'organizationIds',
  RegionIds = 'regionIds',
  LocationIds = 'locationIds',
  DocumentName = 'documentName',
  TypeIds = 'typeIds',
  Tags = 'tags',
  StatusIds = 'statusIds',
  StartDate = 'startDate',
  EndDate = 'endDate',
  Comments = 'comments',
  MSP = 'msp'
}

export enum FormDailogTitle {
  AddNewFolder = 'Add New Folder',
  Upload = 'Upload',
  EditDocument = 'Edit Document',
  Share = 'Share'
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
  Comments = 'comments',
  OrganizationName = 'businessUnitName',
  RegionName = 'regionName',
  LocationName = 'locationName',
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
  AgencyName = 'Agency Name',
  RegionName = 'Region Name',
  LocationName = 'Location Name'
}
