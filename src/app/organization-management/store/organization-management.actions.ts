import { ImportResult } from '@shared/models/import.model';
import { Country } from 'src/app/shared/enums/states';
import { Organization } from 'src/app/shared/models/organization.model';
import { SkillCategory } from 'src/app/shared/models/skill-category.model';
import { Skill, SkillFilters } from 'src/app/shared/models/skill.model';
import { Department, DepartmentFilter, ImportedDepartment } from '@shared/models/department.model';
import { ImportedRegion, Region, regionFilter } from '@shared/models/region.model';
import { ImportedLocation, Location, LocationFilter } from '@shared/models/location.model';
import { CredentialType } from '@shared/models/credential-type.model';
import { Credential, CredentialFilter } from '@shared/models/credential.model';
import { CredentialSkillGroup } from '@shared/models/skill-group.model';
import { OrganizationSettingFilter, OrganizationSettingsPost } from '@shared/models/organization-settings.model';
import { ExportPayload } from '@shared/models/export.model';
import { ImportedBillRate } from '@shared/models';
import { SkillParams } from '@client/order-management/interfaces';

export class SetGeneralStatesByCountry {
  static readonly type = '[organizationManagement] Set General States By Country';
  constructor(public payload: Country) {}
}

export class SetBillingStatesByCountry {
  static readonly type = '[organizationManagement] Set Billing States By Country';
  constructor(public payload: Country) {}
}

export class SaveOrganization {
  static readonly type = '[organizationManagement] Save Organization';
  constructor(public payload: Organization) {}
}

export class SaveOrganizationSucceeded {
  static readonly type = '[organizationManagement] Save Organization Succeeded';
  constructor(public payload: Organization) {}
}

export class UploadOrganizationLogo {
  static readonly type = '[organizationManagement] Upload Organization Logo';
  constructor(public file: Blob, public businessUnitId: number) {}
}

export class GetOrganizationLogo {
  static readonly type = '[organizationManagement] Get Organization Logo';
  constructor(public payload: number) {}
}

export class GetOrganizationLogoSucceeded {
  static readonly type = '[organizationManagement] Get Organization Logo Succeeded';
  constructor(public payload: Blob) {}
}

export class GetOrganizationById {
  static readonly type = '[organizationManagement] Get Organization by ID';
  constructor(public payload: number) {}
}

export class GetOrganizationByIdSucceeded {
  static readonly type = '[organizationManagement] Get Organization by ID Succeeded';
  constructor(public payload: Organization) {}
}

export class SaveDepartment {
  static readonly type = '[organizationManagement] Create Department';
  constructor(public payload: Department, public filters?: DepartmentFilter) {}
}

export class SaveDepartmentSucceeded {
  static readonly type = '[organizationManagement] Save/Update Department Succeeded';
  constructor() {}
}

export class SaveDepartmentConfirm {
  static readonly type = '[organizationManagement] Show Save/Update Location Confirmation PopUp';
  constructor() {}
}

export class GetDepartmentsByLocationId {
  static readonly type = '[organizationManagement] Get The List Of Departments by locationId';
  constructor(public locationId?: number, public filters?: DepartmentFilter, public activeOnly?: boolean, public preservedId?: number) {}
}

export class UpdateDepartment {
  static readonly type = '[organizationManagement] Update Department';
  constructor(public department: Department, public filters?: DepartmentFilter, public ignoreWarning?: boolean) {}
}

export class DeleteDepartmentById {
  static readonly type = '[organizationManagement] Delete Department by id';
  constructor(public department: Department, public filters?: DepartmentFilter) {}
}

export class GetRegions {
  static readonly type = '[organizationManagement] Get The List Of Regions';
  constructor(public filter?: regionFilter) {}
}

export class GetRegionsPage {
  static readonly type = '[organizationManagement] Get The Regions Page List';
  constructor(public filter?: regionFilter) { }
}

export class GetMasterRegions {
  static readonly type = '[organizationManagement] Get The List Of Regions';
  constructor() {}
}

export class SaveRegion {
  static readonly type = '[organizationManagement] Create Region';
  constructor(public region: Region) {}
}

export class UpdateRegion {
  static readonly type = '[organizationManagement] Update Region';
  constructor(public region: Region) {}
}

export class DeleteRegionById {
  static readonly type = '[organizationManagement] Delete Region by id';
  constructor(public regionId: number) {}
}

export class GetLocationsByOrganizationId {
  static readonly type = '[organizationManagement] Get The List Of Locations by organizationId';
  constructor(public organizationId: number) {}
}

export class GetLocationsByRegionId {
  static readonly type = '[organizationManagement] Get The List Of Locations by regionId';
  constructor(public regionId: number, public filters?: LocationFilter, public activeOnly?: boolean, public preservedId?: number) {}
}

export class GetLocationById {
  static readonly type = '[organizationManagement] Get The Location by id';
  constructor(public locationId: number) {}
}

export class SaveLocation {
  static readonly type = '[organizationManagement] Create Location';
  constructor(public location: Location, public regionId: number, public filters?: LocationFilter) {}
}

export class UpdateLocation {
  static readonly type = '[organizationManagement] Update Location';
  constructor(public location: Location, public regionId: number, public filters?: LocationFilter, public ignoreWarning?: boolean) {}
}

export class SaveLocationSucceeded {
  static readonly type = '[organizationManagement] Save/Update Location Succeeded';
  constructor() {}
}

export class SaveLocationConfirm {
  static readonly type = '[organizationManagement] Show Save/Update Location Confirmation PopUp';
  constructor() {}
}

export class DeleteLocationById {
  static readonly type = '[organizationManagement] Delete Location by id';
  constructor(public locationId: number, public regionId: number, public filters?: LocationFilter) {}
}

export class GetBusinessUnitList {
  static readonly type = '[organizationManagement] Get The List Of Business Units';
  constructor() {}
}

export class SetDirtyState {
  static readonly type = '[organizationManagement] Set Dirty State Of The Form';
  constructor(public payload: boolean) {}
}

export class SetImportFileDialogState {
  static readonly type = '[organizationManagement] Set Import file dialog State';
  constructor(public payload: boolean) {}
}

export class GetMasterSkillsByPage {
  static readonly type = '[organizationManagement] Get Master Skills by Page';
  constructor(public pageNumber: number, public pageSize: number) {}
}

export class GetSkillsCategoriesByPage {
  static readonly type = '[organizationManagement] Get Skills Categories by Page';
  constructor(public pageNumber: number, public pageSize: number) {}
}

export class GetMasterSkillsByOrganization {
  static readonly type = '[organizationManagement] Get Master Skills by Organization';
  constructor() {}
}

export class GetAssignedSkillsByOrganization {
  static readonly type = '[organizationManagement] Get Assigned Skills by Organization';
  constructor(public params?: SkillParams) {}
}

export class GetFilteringAssignedSkillsByOrganization {
  static readonly type = '[organizationManagement] Get Filtering Assigned Skills by Organization';
  constructor(public params?: SkillParams) {}
}

export class ClearAssignedSkillsByOrganization {
  static readonly type = '[organizationManagement] Clear Assigned Skills by Organization';
  constructor() {}
}

export class GetAllSkillsCategories {
  static readonly type = '[organizationManagement] Get All Skills Categories';
  constructor(public params?: SkillParams) {}
}

export class SaveSkillsCategory {
  static readonly type = '[organizationManagement] Save Skills Category';
  constructor(public payload: SkillCategory) {}
}

export class SaveSkillsCategorySucceeded {
  static readonly type = '[organizationManagement] Save Skills Category Succeeded';
  constructor(public payload: SkillCategory) {}
}

export class RemoveSkillsCategory {
  static readonly type = '[organizationManagement] Remove Skills Category';
  constructor(public payload: SkillCategory) {}
}

export class SaveMasterSkill {
  static readonly type = '[organizationManagement] Save Master Skill';
  constructor(public payload: Skill) {}
}

export class RemoveMasterSkill {
  static readonly type = '[organizationManagement] Remove Master Skill';
  constructor(public payload: Skill) {}
}

export class SaveMasterSkillSucceeded {
  static readonly type = '[organizationManagement] Save Master Skill Succeeded';
  constructor(public payload: Skill) {}
}

export class RemoveMasterSkillSucceeded {
  static readonly type = '[organizationManagement] Remove Master Skill by ID Succeeded';
  constructor() {}
}

export class RemoveSkillsCategorySucceeded {
  static readonly type = '[organizationManagement] Remove Skill Category by ID Succeeded';
  constructor() {}
}

export class GetAssignedSkillsByPage {
  static readonly type = '[organizationManagement] Get Assigned Skills by Page';
  constructor(public pageNumber: number, public pageSize: number, public filters: SkillFilters) {}
}

export class SaveAssignedSkill {
  static readonly type = '[organizationManagement] Save Assigned Skill';
  constructor(public payload: Skill) {}
}

export class SaveAssignedSkillSucceeded {
  static readonly type = '[organizationManagement] Save Assigned Skill Succeeded';
  constructor(public payload: Skill) {}
}

export class RemoveAssignedSkill {
  static readonly type = '[organizationManagement] Remove Assigned Skill';
  constructor(public payload: Skill) {}
}

export class RemoveAssignedSkillSucceeded {
  static readonly type = '[organizationManagement] Remove Assigned Skill by ID Succeeded';
  constructor() {}
}

export class GetCredentialTypes {
  static readonly type = '[organizationManagement] Get Credential Types';
  constructor() {}
}

export class GetCredentialTypeById {
  static readonly type = '[organizationManagement] Get Credential Type by ID';
  constructor(public payload: CredentialType) {}
}

export class SaveCredentialType {
  static readonly type = '[organizationManagement] Save Credential Type';
  constructor(public payload: CredentialType) {}
}

export class RemoveCredentialType {
  static readonly type = '[organizationManagement] Remove Credential Type by ID';
  constructor(public payload: CredentialType) {}
}

export class UpdateCredentialType {
  static readonly type = '[organizationManagement] Update Credential Type';
  constructor(public payload: CredentialType) {}
}

export class GetCredential {
  static readonly type = '[organizationManagement] Get Credential list';
  constructor(public payload?: CredentialFilter) {}
}

export class GetCredentialForSettings {
  static readonly type = '[organizationManagement] Get Credential list for Settings';
  constructor(public filters: CredentialFilter) {}
}

export class GetCredentialById {
  static readonly type = '[organizationManagement] Get Credential by ID';
  constructor(public payload: Credential) {}
}

export class SaveCredential {
  static readonly type = '[organizationManagement] Save Credential';
  constructor(public payload: Credential) {}
}

export class SaveCredentialSucceeded {
  static readonly type = '[organizationManagement] Save Credential Succeeded';
  constructor(public payload: Credential) {}
}

export class RemoveCredential {
  static readonly type = '[organizationManagement] Remove Credential by ID';
  constructor(
    public readonly payload: Credential,
  ) {}
}

export class RemoveCredentialSuccess {
  static readonly type = '[organizationManagement] Remove Credential Success';
}

export class GetAllSkills {
  static readonly type = '[organizationManagement] Get All Skills';
  constructor() {}
}

export class GetCredentialSkillGroup {
  static readonly type = '[organizationManagement] Get Credential Skill Group';
  constructor(public pageNumber: number, public pageSize: number) {}
}

export class SaveUpdateCredentialSkillGroup {
  static readonly type = '[organizationManagement] Save/Update Credential Skill Group';
  constructor(public payload: CredentialSkillGroup, public pageNumber: number, public pageSize: number) {}
}

export class RemoveCredentialSkillGroup {
  static readonly type = '[organizationManagement] Remove Credential Skill Group';
  constructor(public payload: CredentialSkillGroup, public pageNumber: number, public pageSize: number) {}
}

export class GetOrganizationSettings {
  static readonly type = '[organizationManagement] Get Organization Settings';
  constructor(public filters?: OrganizationSettingFilter, public lastSelectedBusinessUnitId?: number) {}
}

export class SaveOrganizationSettings {
  static readonly type = '[organizationManagement] Save Organization Settings';
  constructor(public organizationSettings: OrganizationSettingsPost) {}
}

export class ClearDepartmentList {
  static readonly type = '[organizationManagement] Clear Department list';
  constructor() {}
}

export class ClearLocationList {
  static readonly type = '[organizationManagement] Clear Location list';
  constructor() {}
}

export class ExportLocations {
  static readonly type = '[organizationManagement] Export Location list';
  constructor(public payload: ExportPayload) {}
}
export class ExportRegions {
  static readonly type = '[organizationManagement] Export Region list';
  constructor(public payload: ExportPayload) {}
}

export class ExportDepartments {
  static readonly type = '[organizationManagement] Export Department list';
  constructor(public payload: ExportPayload) {}
}

export class ExportSkills {
  static readonly type = '[organizationManagement] Export Skill list';
  constructor(public payload: ExportPayload) {}
}

export class GetSkillDataSources {
  static readonly type = '[organizationManagement] Get Skill Data Sources';
  constructor() {}
}

export class GetAllOrganizationSkills {
  static readonly type = '[organizationManagement] Get All Organization Skills';
  constructor() {}
}

export class GetLocationFilterOptions {
  static readonly type = '[organizationManagement] Get Location Filter Options';
  constructor(public payload: number) {}
}

export class GetRegionFilterOptions {
  static readonly type = '[organizationManagement] Get region Filter Options';
  constructor(public payload: any) {}
}

export class GetDepartmentFilterOptions {
  static readonly type = '[organizationManagement] Get Department Filter Options';
  constructor(public payload: number) {}
}

export class GetOrganizationSettingsFilterOptions {
  static readonly type = '[organizationManagement] Get Organization Settings Filter Options';
  constructor() {}
}

export class GetLocationTypes {
  static readonly type = '[organizationManagement] Get Location Types';
  constructor() {}
}
export class GetUSCanadaTimeZoneIds {
  static readonly type = '[organizationManagement] Get US Canada TimeZoneIds';
  constructor() {}
}

export class GetLocationsImportTemplate {
  static readonly type = '[organizationManagement] Get Locations Import Template';
  constructor(public payload: ImportedLocation[]) {}
}

export class GetLocationsImportTemplateSucceeded {
  static readonly type = '[organizationManagement] Get Locations Import Template Succeeded';
  constructor(public payload: Blob) {}
}

export class GetLocationsImportErrors {
  static readonly type = '[organizationManagement] Get Locations Import Errors';
  constructor(public payload: ImportedLocation[]) {}
}

export class GetLocationsImportErrorsSucceeded {
  static readonly type = '[organizationManagement] Get Locations Import Errors Succeeded';
  constructor(public payload: Blob) {}
}

export class UploadLocationsFile {
  static readonly type = '[organizationManagement] Upload Locations File';
  constructor(public payload: Blob) {}
}

export class UploadLocationsFileSucceeded {
  static readonly type = '[organizationManagement] Upload Locations File Succeeded';
  constructor(public payload: ImportResult<ImportedLocation>) {}
}

export class SaveLocationsImportResult {
  static readonly type = '[candidate] Save Locations Import Result';
  constructor(public payload: ImportedLocation[]) {}
}

export class SaveLocationsImportResultSucceeded {
  static readonly type = '[candidate] Save Locations Import Result Succeeded';
  constructor(public payload: ImportResult<ImportedLocation>) {}
}

export class GetDepartmentsImportTemplate {
  static readonly type = '[organizationManagement] Get Departments Import Template';
  constructor(public payload: ImportedDepartment[]) {}
}

export class GetDepartmentsImportTemplateSucceeded {
  static readonly type = '[organizationManagement] Get Departments Import Template Succeeded';
  constructor(public payload: Blob) {}
}

export class GetDepartmentsImportErrors {
  static readonly type = '[organizationManagement] Get Departments Import Errors';
  constructor(public payload: ImportedDepartment[]) {}
}

export class GetDepartmentsImportErrorsSucceeded {
  static readonly type = '[organizationManagement] Get Departments Import Errors Succeeded';
  constructor(public payload: Blob) {}
}

export class UploadDepartmentsFile {
  static readonly type = '[organizationManagement] Upload Departments File';
  constructor(public payload: Blob) {}
}

export class UploadDepartmentsFileSucceeded {
  static readonly type = '[organizationManagement] Upload Departments File Succeeded';
  constructor(public payload: ImportResult<ImportedDepartment>) {}
}

export class SaveDepartmentsImportResult {
  static readonly type = '[candidate] Save Departments Import Result';
  constructor(public payload: ImportedDepartment[]) {}
}

export class SaveDepartmentsImportResultSucceeded {
  static readonly type = '[candidate] Save Departments Import Result Succeeded';
  constructor(public payload: ImportResult<ImportedDepartment>) {}
}

export class GetBillRatesImportTemplate {
  static readonly type = '[organizationManagement] Get Bill Rates Import Template';
  constructor(public payload: ImportedBillRate[]) {}
}

export class GetBillRatesImportTemplateSucceeded {
  static readonly type = '[organizationManagement] Get Bill Rates Import Template Succeeded';
  constructor(public payload: Blob) {}
}

export class GetBillRatesImportErrors {
  static readonly type = '[organizationManagement] Get Bill Rates Import Errors';
  constructor(public payload: ImportedBillRate[]) {}
}

export class GetBillRatesImportErrorsSucceeded {
  static readonly type = '[organizationManagement] Get Bill Rates Import Errors Succeeded';
  constructor(public payload: Blob) {}
}

export class UploadBillRatesFile {
  static readonly type = '[organizationManagement] Upload Bill Rates File';
  constructor(public payload: Blob) {}
}

export class UploadBillRatesFileSucceeded {
  static readonly type = '[organizationManagement] Upload Bill Rates File Succeeded';
  constructor(public payload: ImportResult<ImportedBillRate>) {}
}

export class SaveBillRatesImportResult {
  static readonly type = '[organizationManagement] Save Bill Rates Import Result';
  constructor(public payload: ImportedBillRate[]) {}
}

export class SaveBillRatesImportResultSucceeded {
  static readonly type = '[organizationManagement] Save Bill Rates Import Result Succeeded';
  constructor(public payload: ImportResult<ImportedBillRate>) {}
}


export class GetRegionsImportTemplate {
  static readonly type = '[organizationManagement] Get Region Import Template';
  constructor(public payload: ImportedRegion[]) { }
}
export class GetRegionsImportTemplateSucceeded {
  static readonly type = '[organizationManagement] Get Region Import Template Succeeded';
  constructor(public payload: Blob) { }
}

export class GetRegionsImportErrors {
  static readonly type = '[organizationManagement] Get Regions Import Errors';
  constructor(public payload: ImportedRegion[]) { }
}

export class GetRegionsImportErrorsSucceeded {
  static readonly type = '[organizationManagement] Get Regions Import Errors Succeeded';
  constructor(public payload: Blob) { }
}

export class UploadRegionsFile {
  static readonly type = '[organizationManagement] Upload Region File';
  constructor(public payload: Blob) { }
}

export class UploadRegionsFileSucceeded {
  static readonly type = '[organizationManagement] Upload Region File Succeeded';
  constructor(public payload: ImportResult<ImportedRegion>) { }
}

export class SaveRegionsImportResult {
  static readonly type = '[candidate] Save Region Import Result';
  constructor(public payload: ImportedRegion[]) { }
}

export class SaveRegionsImportResultSucceeded {
  static readonly type = '[candidate] Save Regions Import Result Succeeded';
  constructor(public payload: ImportResult<ImportedRegion>) { }
}
