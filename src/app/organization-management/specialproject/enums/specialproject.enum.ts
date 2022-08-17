
export enum PurchaseOrderTableColumns {
  Id = 'id',
  OrganizationId ="organizationId",
  POName = 'poName',
  PONumber = 'poNumber',
  RegionId = 'regionId',
  Region = 'regionName',
  LocationId = 'locationId',
  Location = 'locationName',
  DepartmentId = 'departmentId',
  Department = 'departmentName',
  SkillId = 'skillId',
  SkillName = 'skillName',
  ProjectBudget = 'projectBudget',
  StartDate = 'startDate',
  EndDate = 'endDate',
  IsDeleted = 'isDeleted'
}

export enum PurchaseOrderHeaderText {
  Id = 'Id',
  OrganizationId = 'Organization Id',
  POName = 'PO Name',
  PONumber = 'PO Number',
  RegionId = 'Region Id',
  Region = 'Region Name',
  LocationId = 'Location Id',
  Location = 'Location Name',
  DepartmentId = 'Department Id',
  Department = 'Department Name',
  SkillId = 'Skill Id',
  SkillName = 'Skill Name',
  ProjectBudget = 'Project Budget',
  StartDate = 'Start Date',
  EndDate = 'End Date',
  IsDeleted = 'IsDeleted'
}

export enum SpecialProjectTableColumns {
  Id = 'id',
  Name = 'name',
  OrganizationId = 'organizationId',
  ProjectTypeName = 'specialProjectCategory',
  RegionId = 'regionId',
  Region = 'regionName',
  LocationId = 'locationId',
  Location = 'locationName',
  DepartmentId = 'departmentId',
  Department = 'departmentName',
  SkillId = 'skillId',
  SkillName = 'skillName',
  ProjectBudget = 'projectBudget',
  StartDate = 'startDate',
  EndDate = 'endDate',
  IsDeleted = 'isDeleted'
}

export enum SpecialProjectHeaderText {
  Id = 'Id',
  Name = 'Name',
  OrganizationId = 'Organization Id',
  ProjectTypeName = 'ProjectType Name',
  RegionId = 'Region Id',
  Region = 'Region Name',
  LocationId = 'Location Id',
  Location = 'Location Name',
  DepartmentId = 'Department Id',
  Department = 'Department Name',
  SkillId = 'Skill Id',
  SkillName = 'Skill Name',
  ProjectBudget = 'Project Budget',
  StartDate = 'Start Date',
  EndDate = 'End Date',
  IsDeleted = 'IsDeleted',
}

export enum SpecilaProjectCategoryTableColumns {
  Id = 'id',
  OrganizationId = "organizationId",
  Name = 'specialProjectCategory',
  IsDeleted = 'isDeleted'
}

export enum SpecilaProjectCategoryHeaderText {
  Id = 'Id',
  OrganizationId = 'Organization Id',
  Name = 'Category',
  IsDeleted = 'IsDeleted'
}

export enum FormControlNames {
  ProjectCategory = 'projectCategory',
  ProjectName = 'projectName',
  RegionIds = 'regionIds',
  LocationIds = 'locationIds',
  DepartmentsIds = 'departmentsIds',
  SkillIds = 'skillIds',
  AllowOnOrderCreation = 'allowOnOrderCreation',
  StartDate = 'startDate',
  EndDate = 'endDate',
  ProjectBudget = 'projectBudget',
  PoName = 'poName',
  PoDescription = 'poDescription',
  SpecialProjectCategoryName = 'SpecialProjectCategoryName',
  projectNameMapping = "projectNameMapping",
  projectCategoryMapping ="projectCategoryMapping"
}

export enum SpecilaProjectMappingTableColumns {
  Id = 'id',
  BusinessUnitId = "businessUnitId",
  RegionId = 'regionId',
  RegionName = 'regionName',
  LocationId = 'locationId',
  LocationName = 'locationName',
  DepartmentId = 'departmentId',
  DepartmentName = 'departmentName',
  Skills = 'skills',
  OrderProjectName = "orderProjectName",
  OrderSpecialProjectCategoryId = "orderSpecialProjectCategoryId",
  OrderSpecialProjectCategoryName = "orderSpecialProjectCategoryName",
  OrderSpecialProjectId ="orderSpecialProjectId",
}
export enum SpecilaProjectMappingHeaderText {
  Id = 'Id',
  OrganizationId = 'Organization Id',
  ProjectName = 'Project Name',
  CategoryName = "Category",
  RegionName = 'Region',
  LocationName = 'Location',
  DepartmentName = 'Department',
  SkillName = 'Skill',
}
