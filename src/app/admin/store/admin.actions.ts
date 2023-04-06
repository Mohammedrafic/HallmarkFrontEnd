import { Country } from 'src/app/shared/enums/states';
import { Organization, OrganizationFilter } from 'src/app/shared/models/organization.model';
import { SkillCategory } from 'src/app/shared/models/skill-category.model';
import { MasterSkillFilters, Skill } from 'src/app/shared/models/skill.model';
import { CredentialType } from '@shared/models/credential-type.model';
import { ExportPayload } from '@shared/models/export.model';

export class SetGeneralStatesByCountry {
  static readonly type = '[admin] Set General States By Country';
  constructor(public payload: Country) { }
}

export class SetBillingStatesByCountry {
  static readonly type = '[admin] Set Billing States By Country';
  constructor(public payload: Country) { }
}

export class SaveOrganization {
  static readonly type = '[admin] Save Organization';
  constructor(public payload: Organization) { }
}

export class SaveOrganizationSucceeded {
  static readonly type = '[admin] Save Organization Succeeded';
  constructor(public payload: Organization) { }
}

export class UploadOrganizationLogo {
  static readonly type = '[admin] Upload Organization Logo';
  constructor(public file: Blob, public businessUnitId: number) { }
}

export class GetOrganizationLogo {
  static readonly type = '[admin] Get Organization Logo';
  constructor(public payload: number) { }
}

export class RemoveOrganizationLogo {
  static readonly type = '[admin] Remove Organization Logo ';
  constructor(public payload: number) { }
}

export class GetOrganizationLogoSucceeded {
  static readonly type = '[admin] Get Organization Logo Succeeded';
  constructor(public payload: Blob) { }
}

export class GetOrganizationById {
  static readonly type = '[admin] Get Organization by ID';
  constructor(public payload: number) { }
}

export class GetOrganizationByIdSucceeded {
  static readonly type = '[admin] Get Organization by ID Succeeded';
  constructor(public payload: Organization) { }
}

export class GetOrganizationsByPage {
  static readonly type = '[admin] Get Organizations by Page';
  constructor(public pageNumber: number, public pageSize: number, public filters?: OrganizationFilter) { }
}

export class GetBusinessUnitList {
  static readonly type = '[admin] Get The List Of Business Units';
  constructor() { }
}

export class SetDirtyState {
  static readonly type = '[admin] Set Dirty State Of The Form';
  constructor(public payload: boolean) { }
}

export class SetImportFileDialogState {
  static readonly type = '[admin] Set Import file dialog State';
  constructor(public payload: boolean) { }
}

export class GetMasterSkillsByPage {
  static readonly type = '[admin] Get Master Skills by Page';
  constructor(public pageNumber: number, public pageSize: number, public filters: MasterSkillFilters) { }
}

export class GetSkillsCategoriesByPage {
  static readonly type = '[admin] Get Skills Categories by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class GetAllSkillsCategories {
  static readonly type = '[admin] Get All Skills Categories';
  constructor() { }
}

export class SaveSkillsCategory {
  static readonly type = '[admin] Save Skills Category';
  constructor(public payload: SkillCategory) { }
}

export class SaveSkillsCategorySucceeded {
  static readonly type = '[admin] Save Skills Category Succeeded';
  constructor(public payload: SkillCategory) { }
}

export class RemoveSkillsCategory {
  static readonly type = '[admin] Remove Skills Category';
  constructor(public payload: SkillCategory) { }
}

export class SaveMasterSkill {
  static readonly type = '[admin] Save Master Skill';
  constructor(public payload: Skill) { }
}

export class RemoveMasterSkill {
  static readonly type = '[admin] Remove Master Skill';
  constructor(public payload: Skill) { }
}

export class SaveMasterSkillSucceeded {
  static readonly type = '[admin] Save Master Skill Succeeded';
  constructor(public payload: Skill) { }
}

export class RemoveMasterSkillSucceeded {
  static readonly type = '[admin] Remove Master Skill by ID Succeeded';
  constructor() { }
}

export class RemoveSkillsCategorySucceeded {
  static readonly type = '[admin] Remove Skill Category by ID Succeeded';
  constructor() { }
}

export class GetAllSkills {
  static readonly type = '[admin] Get All Skills';
  constructor() {}
}

export class GetCredentialTypes {
  static readonly type = '[admin] Get Credential Types';
  constructor() { }
}

export class GetCredentialTypeById {
  static readonly type = '[admin] Get Credential Type by ID';
  constructor(public payload: CredentialType) { }
}

export class SaveCredentialType {
  static readonly type = '[admin] Save Credential Type';
  constructor(public payload: CredentialType) { }
}

export class RemoveCredentialType {
  static readonly type = '[admin] Remove Credential Type by ID';
  constructor(public payload: CredentialType) { }
}

export class UpdateCredentialType {
  static readonly type = '[admin] Update Credential Type';
  constructor(public payload: CredentialType) { }
}

export class ExportSkills {
  static readonly type = '[admin] Export Skill list';
  constructor(public payload: ExportPayload) { }
}

export class ExportSkillCategories {
  static readonly type = '[admin] Export Skill category list';

  constructor(public payload: ExportPayload) {
  }
}

export class ExportCredentialTypes {
  static readonly type = '[admin] Export Credential Types list';

  constructor(public payload: ExportPayload) {
  }
}

export class GetDBConnections {
  static readonly type = '[admin] Get list of DB connections';

  constructor() {
  }
}

export class ExportOrganizations {
  static readonly type = '[admin] Export Organization list';
  constructor(public payload: ExportPayload) { }
}

export class GetMasterSkillDataSources {
  static readonly type = '[admin] Get Master Skills Filtering Options';
  constructor() { }
}

export class GetOrganizationDataSources {
  static readonly type = '[admin] Get Organization Filtering Options';
  constructor() { }
}

export class ExportOrientation {
  static readonly type = '[admin] Export Orientation list';
  constructor(public payload: ExportPayload) { }
}
