import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ImportResult } from '@shared/models/import.model';
import { catchError, Observable, of, tap } from 'rxjs';
import { Days } from 'src/app/shared/enums/days';
import { SendDocumentAgency } from 'src/app/shared/enums/send-document-agency';
import { CanadaStates, Country, UsaStates } from 'src/app/shared/enums/states';
import { Status } from 'src/app/shared/enums/status';
import { BusinessUnit } from 'src/app/shared/models/business-unit.model';
import { Organization } from 'src/app/shared/models/organization.model';
import { OrganizationService } from '@shared/services/organization.service';

import {
  ClearAssignedSkillsByOrganization,
  ClearCredentialsAndTypes,
  ClearDepartmentList,
  ClearLocationList,
  DeleteDepartmentById,
  DeleteLocationById,
  DeleteRegionById,
  ExportDepartments,
  ExportLocations,
  ExportRegions,
  ExportSkills,
  GetAllOrganizationSkills,
  GetAllSkills,
  GetAllSkillsCategories,
  GetAssignedSkillsByOrganization,
  GetAssignedSkillsByPage,
  GetBillRatesImportErrors,
  GetBillRatesImportErrorsSucceeded,
  GetBillRatesImportTemplate,
  GetBillRatesImportTemplateSucceeded,
  GetBusinessUnitList,
  GetCredential,
  GetCredentialForSettings,
  GetCredentialSkillGroup,
  GetCredentialTypes,
  GetDepartmentFilterOptions,
  GetDepartmentsByLocationId,
  GetDepartmentsImportErrors,
  GetDepartmentsImportErrorsSucceeded,
  GetDepartmentsImportTemplate,
  GetDepartmentsImportTemplateSucceeded,
  GetFilteringAssignedSkillsByOrganization,
  GetLocationById,
  GetLocationFilterOptions,
  GetLocationsByOrganizationId,
  GetLocationsByRegionId,
  GetLocationsImportErrors,
  GetLocationsImportErrorsSucceeded,
  GetLocationsImportTemplate,
  GetLocationsImportTemplateSucceeded,
  GetLocationTypes,
  GetMasterRegions,
  GetMasterSkillsByOrganization,
  GetMasterSkillsByPage,
  GetOrganizationById,
  GetOrganizationByIdSucceeded,
  GetOrganizationLogo,
  GetOrganizationLogoSucceeded,
  GetOrganizationSettings,
  GetOrganizationSettingsFilterOptions,
  GetRegionFilterOptions,
  GetRegions,
  GetRegionsImportErrors,
  GetRegionsImportErrorsSucceeded,
  GetRegionsImportTemplate,
  GetRegionsImportTemplateSucceeded,
  GetRegionsPage,
  GetSkillDataSources,
  GetSkillsCategoriesByPage,
  GetUSCanadaTimeZoneIds,
  RemoveAssignedSkill,
  RemoveAssignedSkillSucceeded,
  RemoveCredential,
  RemoveCredentialSkillGroup,
  RemoveCredentialSuccess,
  RemoveCredentialType,
  RemoveMasterSkill,
  RemoveMasterSkillSucceeded,
  RemoveSkillsCategory,
  RemoveSkillsCategorySucceeded,
  SaveAssignedSkill,
  SaveAssignedSkillSucceeded,
  SaveBillRatesImportResult,
  SaveBillRatesImportResultSucceeded,
  SaveCredential,
  SaveCredentialSucceeded,
  SaveCredentialType,
  SaveDepartment,
  SaveDepartmentConfirm,
  SaveDepartmentsImportResult,
  SaveDepartmentsImportResultSucceeded,
  SaveDepartmentSucceeded,
  SaveLocation,
  SaveLocationConfirm,
  SaveLocationsImportResult,
  SaveLocationsImportResultSucceeded,
  SaveLocationSucceeded,
  SaveMasterSkill,
  SaveMasterSkillSucceeded,
  SaveOrganization,
  SaveOrganizationSettings,
  SaveOrganizationSucceeded,
  SaveRegion,
  SaveRegionsImportResult,
  SaveRegionsImportResultSucceeded,
  SaveSkillsCategory,
  SaveSkillsCategorySucceeded,
  SaveUpdateCredentialSkillGroup,
  SetBillingStatesByCountry,
  SetDirtyState,
  SetGeneralStatesByCountry,
  UpdateCredentialType,
  UpdateDepartment,
  UpdateLocation,
  UpdateRegion,
  UploadBillRatesFile,
  UploadBillRatesFileSucceeded,
  UploadDepartmentsFile,
  UploadDepartmentsFileSucceeded,
  UploadLocationsFile,
  UploadLocationsFileSucceeded,
  UploadOrganizationLogo,
  UploadRegionsFile,
  UploadRegionsFileSucceeded,
} from './organization-management.actions';
import { Department, DepartmentFilterOptions, DepartmentsPage, ImportedDepartment } from '@shared/models/department.model';
import { ImportedRegion, Region, regionFilter, regionsPage } from '@shared/models/region.model';
import {
  ImportedLocation,
  Location,
  LocationFilterOptions,
  LocationsPage,
  LocationType,
  TimeZoneModel,
} from '@shared/models/location.model';
import { CandidateStateModel } from "@shared/models/candidate.model";
import { GeneralPhoneTypes } from '@shared/constants/general-phone-types';
import { SkillsService } from '@shared/services/skills.service';
import {
  AssignedSkillsByOrganization,
  ListOfSkills,
  MasterSkillByOrganization,
  Skill,
  SkillDataSource,
  SkillsPage,
} from 'src/app/shared/models/skill.model';
import { SkillCategoriesPage, SkillCategory } from 'src/app/shared/models/skill-category.model';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from 'src/app/shared/enums/message-types';
import { CredentialType } from '@shared/models/credential-type.model';
import { Credential, CredentialPage } from '@shared/models/credential.model';
import {
  RECORD_ADDED,
  RECORD_ALREADY_EXISTS,
  RECORD_CANNOT_BE_DELETED,
  RECORD_DELETE,
  RECORD_MODIFIED,
  usedByOrderErrorMessage,
} from 'src/app/shared/constants/messages';
import { CredentialSkillGroup, CredentialSkillGroupPage } from '@shared/models/skill-group.model';
import { Configuration } from '@shared/models/organization-settings.model';
import { CategoriesService } from '@shared/services/categories.service';
import { DepartmentsService } from '@shared/services/departments.service';
import { RegionService } from '@shared/services/region.service';
import { LocationService } from '@shared/services/location.service';
import { CredentialsService } from '@shared/services/credentials.service';
import { SkillGroupService } from '@shared/services/skill-group.service';
import { OrganizationSettingsService } from '@shared/services/organization-settings.service';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { getAllErrors } from '@shared/utils/error.utils';
import { NodatimeService } from '@shared/services/nodatime.service';
import { HttpErrorResponse } from '@angular/common/http';
import { BillRatesService } from '@shared/services/bill-rates.service';
import { ImportedBillRate } from '@shared/models';
import { sortByField } from '@shared/helpers/sort-by-field.helper';

interface DropdownOption {
  id: number;
  text: string;
}

const StringIsNumber = (value: any) => isNaN(Number(value)) === true; // TODO: move to utils

// TODO: separate states (skills, creds etc)
export interface OrganizationManagementStateModel {
  countries: DropdownOption[];
  statesGeneral: string[] | null;
  statesBilling: string[] | null;
  phoneTypes: string[] | null;
  businessUnits: BusinessUnit[];
  sendDocumentAgencies: DropdownOption[];
  days: DropdownOption[];
  statuses: DropdownOption[];
  isOrganizationLoading: boolean;
  isDepartmentLoading: boolean;
  isLocationLoading: boolean;
  departments: Department[] | DepartmentsPage;
  regions: Region[];
  regionsPage: regionsPage | null;
  masterRegions: Region[];
  locations: Location[] | LocationsPage;
  location: Location | null;
  organization: Organization | null;
  masterSkills: SkillsPage | null;
  masterSkillsByOrganization: MasterSkillByOrganization[];
  skills: SkillsPage | null;
  skillsCategories: SkillCategoriesPage | null;
  allSkillsCategories: SkillCategoriesPage | null;
  isDirty: boolean;
  credentialTypes: CredentialType[];
  credentials: Credential[] | CredentialPage;
  isCredentialTypesLoading: boolean;
  isCredentialLoading: boolean;
  skillGroups: CredentialSkillGroupPage | null;
  isSkillGroupLoading: boolean;
  isCredentialSetupLoading: boolean;
  isOrganizationSettingsLoading: boolean;
  organizationSettings: Configuration[];
  skillDataSource: SkillDataSource;
  allOrganizationSkills: Skill[] | null;
  locationFilterOptions: LocationFilterOptions | null;
  regionFilterOptions: regionFilter | null;
  departmentFilterOptions: DepartmentFilterOptions | null;
  organizationSettingsFilterOptions: string[] | null;
  timeZones: TimeZoneModel[] | null;
  loctionTypes: LocationType[] | null;
  isLocationTypesLoading: boolean;
  assignedSkillsByOrganization: ListOfSkills[];
  filteringAssignedSkillsByOrganization: ListOfSkills[];
}

@State<OrganizationManagementStateModel>({
  name: 'organizationManagement',
  defaults: {
    countries: [
      { id: Country.USA, text: Country[0] },
      { id: Country.Canada, text: Country[1] },
    ],
    statesGeneral: UsaStates,
    statesBilling: UsaStates,
    phoneTypes: GeneralPhoneTypes,
    businessUnits: [],
    sendDocumentAgencies: [
      { id: SendDocumentAgency.Accepted, text: 'Accepted' },
      { id: SendDocumentAgency.Offered, text: 'Offered' },
      { id: SendDocumentAgency.Onboard, text: 'Onboard' },
    ],
    days: Days,
    statuses: Object.keys(Status)
      .filter(StringIsNumber)
      .map((statusName, index) => ({ id: index, text: statusName })),
    isOrganizationLoading: false,
    organization: null,
    isDepartmentLoading: false,
    isLocationLoading: false,
    departments: [],
    regions: [],
    regionsPage: null,
    masterRegions: [],
    locations: [],
    location: null,
    masterSkills: null,
    masterSkillsByOrganization: [],
    skills: null,
    skillsCategories: null,
    allSkillsCategories: null,
    isDirty: false,
    credentialTypes: [],
    credentials: [],
    isCredentialTypesLoading: false,
    isCredentialLoading: false,
    skillGroups: null,
    isSkillGroupLoading: false,
    isCredentialSetupLoading: false,
    isOrganizationSettingsLoading: false,
    organizationSettings: [],
    skillDataSource: { skillABBRs: [], skillDescriptions: [], glNumbers: [] },
    allOrganizationSkills: null,
    locationFilterOptions: null,
    regionFilterOptions: null,
    departmentFilterOptions: null,
    organizationSettingsFilterOptions: null,
    timeZones: [],
    loctionTypes: [],
    isLocationTypesLoading: false,
    assignedSkillsByOrganization: [],
    filteringAssignedSkillsByOrganization: [],
  },
})
@Injectable()
export class OrganizationManagementState {
  @Selector()
  static countries(state: OrganizationManagementStateModel): DropdownOption[] {
    return state.countries;
  }

  @Selector()
  static statesGeneral(state: OrganizationManagementStateModel): string[] | null {
    return state.statesGeneral;
  }

  @Selector()
  static phoneTypes(state: OrganizationManagementStateModel): string[] | null {
    return state.phoneTypes;
  }

  @Selector()
  static statesBilling(state: OrganizationManagementStateModel): string[] | null {
    return state.statesBilling;
  }

  @Selector()
  static businessUnits(state: OrganizationManagementStateModel): BusinessUnit[] {
    return state.businessUnits;
  }

  @Selector()
  static sendDocumentAgencies(state: OrganizationManagementStateModel): DropdownOption[] {
    return state.sendDocumentAgencies;
  }

  @Selector()
  static days(state: OrganizationManagementStateModel): DropdownOption[] {
    return state.days;
  }

  @Selector()
  static statuses(state: OrganizationManagementStateModel): DropdownOption[] {
    return state.statuses;
  }

  @Selector()
  static isDirty(state: OrganizationManagementStateModel): boolean {
    return state.isDirty;
  }

  @Selector()
  static departments(state: OrganizationManagementStateModel): Department[] | DepartmentsPage {
    return state.departments;
  }

  @Selector()
  static sortedDepartments(state: OrganizationManagementStateModel): Department[] | DepartmentsPage {
    return sortByField(state.departments as Department[], 'departmentName');
  }

  @Selector()
  static regions(state: OrganizationManagementStateModel): Region[] {
    return state.regions;
  }

  @Selector()
  static regionsPage(state: OrganizationManagementStateModel): regionsPage | null {
    return state.regionsPage;
  }

  @Selector()
  static sortedRegions(state: OrganizationManagementStateModel): Region[] {
    return sortByField(state.regions, 'name');
  }

  @Selector()
  static GetRegionFilterOptions(state: OrganizationManagementStateModel): Region[] {
    return state.regions;
  }

  @Selector()
  static GetMasterRegions(state: OrganizationManagementStateModel): Region[] {
    return state.masterRegions;
  }
  @Selector()
  static locationsByRegionId(state: OrganizationManagementStateModel): Location[] | LocationsPage {
    return state.locations;
  }

  @Selector()
  static sortedLocationsByRegionId(state: OrganizationManagementStateModel): Location[] {
    return sortByField(state.locations as Location[], 'name');
  }

  @Selector()
  static locationById(state: OrganizationManagementStateModel): Location | null {
    return state.location;
  }

  @Selector()
  static organization(state: OrganizationManagementStateModel): Organization | null {
    return state.organization;
  }

  @Selector()
  static masterSkills(state: OrganizationManagementStateModel): SkillsPage | null {
    return state.masterSkills;
  }

  @Selector()
  static masterSkillsByOrganization(state: OrganizationManagementStateModel): MasterSkillByOrganization[] {
    return state.masterSkillsByOrganization;
  }

  @Selector()
  static assignedSkillsByOrganization(state: OrganizationManagementStateModel): ListOfSkills[] {
    return state.assignedSkillsByOrganization;
  }

  @Selector()
  static filteringAssignedSkillsByOrganization(state: OrganizationManagementStateModel): ListOfSkills[] {
    return state.filteringAssignedSkillsByOrganization;
  }

  @Selector()
  static skills(state: OrganizationManagementStateModel): SkillsPage | null {
    return state.skills;
  }

  @Selector()
  static skillsCategories(state: OrganizationManagementStateModel): SkillCategoriesPage | null {
    return state.skillsCategories;
  }

  @Selector()
  static allSkillsCategories(state: OrganizationManagementStateModel): SkillCategoriesPage | null {
    return state.allSkillsCategories;
  }

  @Selector()
  static credentialTypes(state: OrganizationManagementStateModel): CredentialType[] {
    return state.credentialTypes;
  }

  @Selector()
  static credentials(state: OrganizationManagementStateModel): Credential[] | CredentialPage {
    return state.credentials;
  }

  @Selector()
  static skillGroups(state: OrganizationManagementStateModel): CredentialSkillGroupPage | null {
    return state.skillGroups;
  }

  @Selector()
  static organizationSettings(state: OrganizationManagementStateModel): Configuration[] {
    return state.organizationSettings;
  }

  @Selector()
  static skillDataSource(state: OrganizationManagementStateModel): SkillDataSource {
    return state.skillDataSource;
  }

  @Selector()
  static allOrganizationSkills(state: OrganizationManagementStateModel): Skill[] | null {
    return state.allOrganizationSkills;
  }

  @Selector()
  static locationFilterOptions(state: OrganizationManagementStateModel): LocationFilterOptions | null {
    return state.locationFilterOptions;
  }
  @Selector()
  static regionFilterOptions(state: OrganizationManagementStateModel): regionFilter | null {
    return state.regionFilterOptions;
  }

  @Selector()
  static departmentFilterOptions(state: OrganizationManagementStateModel): DepartmentFilterOptions | null {
    return state.departmentFilterOptions;
  }

  @Selector()
  static organizationSettingsFilterOptions(state: OrganizationManagementStateModel): string[] | null {
    return state.organizationSettingsFilterOptions;
  }

  @Selector()
  static timeZones(state: OrganizationManagementStateModel): TimeZoneModel[] | null {
    return state.timeZones;
  }

  @Selector()
  static locationTypes(state: OrganizationManagementStateModel): LocationType[] | null {
    return state.loctionTypes;
  }

  constructor(
    private organizationService: OrganizationService,
    private skillsService: SkillsService,
    private categoriesService: CategoriesService,
    private departmentService: DepartmentsService,
    private regionService: RegionService,
    private locationService: LocationService,
    private credentialsService: CredentialsService,
    private skillGroupService: SkillGroupService,
    private organizationSettingsService: OrganizationSettingsService,
    private nodatimeService: NodatimeService,
    private billRatesService: BillRatesService
  ) {}

  @Action(SetGeneralStatesByCountry)
  SetGeneralStatesByCountry(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { payload }: SetGeneralStatesByCountry
  ): void {
    patchState({ statesGeneral: payload === Country.USA ? UsaStates : CanadaStates });
  }

  @Action(SetBillingStatesByCountry)
  SetBillingStatesByCountry(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { payload }: SetBillingStatesByCountry
  ): void {
    patchState({ statesBilling: payload === Country.USA ? UsaStates : CanadaStates });
  }

  @Action(GetOrganizationById)
  GetOrganizationById(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: GetOrganizationById
  ): Observable<Organization> {
    patchState({ isOrganizationLoading: true });
    return this.organizationService.getOrganizationById(payload).pipe(
      tap((payload) => {
        patchState({ isOrganizationLoading: false, organization: payload });
        dispatch(new GetOrganizationByIdSucceeded(payload));
        return payload;
      })
    );
  }

  @Action(SaveOrganization)
  SaveOrganization(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: SaveOrganization
  ): Observable<Organization> {
    patchState({ isOrganizationLoading: true });
    return this.organizationService.saveOrganization(payload).pipe(
      tap((payloadResponse) => {
        patchState({ isOrganizationLoading: false });
        dispatch(new SaveOrganizationSucceeded(payloadResponse));
        if (payload.organizationId) {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
        return payloadResponse;
      })
    );
  }

  @Action(UploadOrganizationLogo)
  UploadOrganizationLogo(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { file, businessUnitId }: UploadOrganizationLogo
  ): Observable<any> {
    patchState({ isOrganizationLoading: true });
    return this.organizationService.saveOrganizationLogo(file, businessUnitId).pipe(
      tap((payload) => {
        patchState({ isOrganizationLoading: false });
        return payload;
      })
    );
  }

  @Action(GetOrganizationLogo)
  GetOrganizationLogo(
    { dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: GetOrganizationLogo
  ): Observable<any> {
    return this.organizationService.getOrganizationLogo(payload).pipe(
      tap((payload) => {
        dispatch(new GetOrganizationLogoSucceeded(payload));
        return payload;
      })
    );
  }

  @Action(GetBusinessUnitList)
  GetBusinessUnitList(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    {}: GetBusinessUnitList
  ): Observable<BusinessUnit[]> {
    return this.organizationService.getBusinessUnit().pipe(
      tap((payload) => {
        patchState({ businessUnits: payload });
        return payload;
      })
    );
  }

  @Action(SetDirtyState)
  SetDirtyState({ patchState }: StateContext<OrganizationManagementStateModel>, { payload }: SetDirtyState): void {
    patchState({ isDirty: payload });
  }

  @Action(SaveDepartment)
  SaveDepartment(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload, filters }: SaveDepartment
  ): Observable<Department> {
    patchState({ isDepartmentLoading: true });
    return this.departmentService.saveDepartment(payload).pipe(
      tap((payload) => {
        patchState({ isDepartmentLoading: false });
        dispatch([new GetDepartmentsByLocationId(payload.locationId, filters), new SaveDepartmentSucceeded()]);
        if (filters) {
          dispatch(new GetDepartmentFilterOptions(payload.locationId as number));
        }
        return payload;
      })
    );
  }

  @Action(GetDepartmentsByLocationId)
  GetDepartmentsByLocationId(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { locationId, filters, activeOnly, preservedId }: GetDepartmentsByLocationId
  ): Observable<Department[] | DepartmentsPage> {
    return this.departmentService.getDepartmentsByLocationId(locationId, filters).pipe(
      tap((payload) => {
        if (activeOnly) {
          payload = (payload as []).filter((department: Department) => {
            return !department.isDeactivated || department.departmentId === preservedId;
          });
        }
        patchState({ departments: payload });
        return payload;
      })
    );
  }

  @Action(UpdateDepartment)
  UpdateDepartments(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { department, filters, ignoreWarning, createReplacement }: UpdateDepartment
  ): Observable<void> {
    return this.departmentService.updateDepartment(department, ignoreWarning, createReplacement).pipe(
      tap((payload) => {
        patchState({ isDepartmentLoading: false });
        dispatch([new GetDepartmentsByLocationId(department.locationId, filters), new SaveDepartmentSucceeded()]);
        if (filters) {
          dispatch(new GetDepartmentFilterOptions(department.locationId as number));
        }
        return payload;
      }),
      catchError((error) => {
        const errorObj = error.error;
        if (errorObj.errors?.IncompleteOpenOrdersExist && errorObj.errors?.InProgressOrdersExist) {
          return dispatch(new ShowToast(MessageTypes.Error, 'Department has Open/ Incomplete Orders please re-assign or close them before inactivating the Department. Department has Orders In Progress past the inactivation date, please review them before inactivating the Department'));
        }
        if (errorObj.errors?.IncompleteOpenOrdersExist) {
          return dispatch(new ShowToast(MessageTypes.Error, 'Department has Open/Incomplete Orders, please re-assign or close them before inactivating the Department'));
        }
        if (errorObj.errors?.InProgressOrdersExist) {
          return dispatch(new SaveDepartmentConfirm());
        }
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error?.error)));
      })
    );
  }

  @Action(DeleteDepartmentById)
  DeleteDepartmentById(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { department, filters }: DeleteDepartmentById
  ): Observable<any> {
    return this.departmentService.deleteDepartmentById(department.departmentId).pipe(
      tap((payload) => {
        patchState({ isDepartmentLoading: false });
        dispatch(new GetDepartmentsByLocationId(department.locationId, filters));
        return payload;
      }),
      catchError((error: any) => {
        const message = error.error.errors?.EntityInUse
          ? usedByOrderErrorMessage('Department', error.error.errors['EntityInUse'])
          : RECORD_CANNOT_BE_DELETED;
        return dispatch(new ShowToast(MessageTypes.Error, message));
      })
    );
  }

  @Action(GetRegions)
  GetRegions({ patchState }: StateContext<OrganizationManagementStateModel>, { filter }: any): Observable<Region[]> {
    return this.regionService.getRegionsByOrganizationId(filter).pipe(
      tap((payload: any) => {
        if ('items' in payload) {
          patchState({ regions: payload.items });
          return payload.items;
        } else {
          patchState({ regions: payload });
          return payload;
        }
      })
    );
  }

  @Action(GetRegionsPage)
  GetRegionsPage({ patchState }: StateContext<OrganizationManagementStateModel>, { filter }: any): Observable<regionsPage> {
    return this.regionService.getRegionsByOrganizationId(filter).pipe(
      tap((payload: any) => {
        patchState({ regionsPage: payload });
        return payload;
      })
    );
  }

  @Action(SaveRegion)
  SaveRegion(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { region }: SaveRegion
  ): Observable<Region> {
    patchState({ isLocationLoading: true });
    return this.regionService.saveRegion(region).pipe(
      tap((payload) => {
        patchState({ isLocationLoading: false });
        return payload;
      })
    );
  }

  @Action(UpdateRegion)
  UpdateRegion(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { region }: UpdateRegion
  ): Observable<Region> {
    return this.regionService.updateRegion(region).pipe(
      tap((payload) => {
        patchState({ isLocationLoading: false });

        if (payload.id != 0) {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
          dispatch(new GetRegions());
        } else {
          dispatch(new ShowToast(MessageTypes.Error, RECORD_ALREADY_EXISTS));
        }
        return payload;
      })
    );
  }

  @Action(DeleteRegionById)
  DeleteRegionById(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { regionId }: DeleteRegionById
  ): Observable<void> {
    return this.regionService.deleteRegionById(regionId).pipe(
      tap((payload) => {
        patchState({ isLocationLoading: false });
        dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error,
          (error.error.errors != null && error.error.errors != undefined) ? 'Region cannot be deleted. This Region was used in '+error.error.errors.EntityInUse[0] : error.error.detail));
      })
    );
  }

  @Action(GetLocationsByOrganizationId)
  GetLocationsByOrganizationId(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { organizationId }: GetLocationsByOrganizationId
  ): Observable<Location[]> {
    return this.locationService.getLocationsByOrganizationId(organizationId).pipe(
      tap((payload) => {
        patchState({ locations: payload });
        return payload;
      })
    );
  }

  @Action(GetLocationsByRegionId)
  GetLocationsByRegionId(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { regionId, filters, activeOnly, preservedId }: GetLocationsByRegionId
  ): Observable<Location[] | LocationsPage> {
    return this.locationService.getLocationsByRegionId(regionId, filters).pipe(
      tap((payload) => {
        if (activeOnly) {
          payload = (payload as []).filter((location: Location) => {
            return !location.isDeactivated || location.id === preservedId;
          });
        }
        patchState({ locations: payload });
        return payload;
      })
    );
  }

  @Action(GetLocationById)
  GetLocationById(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { locationId }: GetLocationById
  ): Observable<Location> {
    return this.locationService.getLocationById(locationId).pipe(
      tap((payload) => {
        patchState({ location: payload });
        return payload;
      })
    );
  }

  @Action(SaveLocation)
  SaveLocation(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { location, regionId, filters }: SaveLocation
  ): Observable<Location | void> {
    patchState({ isLocationLoading: true });
    return this.locationService.saveLocation(location).pipe(
      tap((payload) => {
        patchState({ isLocationLoading: false });
        dispatch([new ShowToast(MessageTypes.Success, RECORD_ADDED), new GetLocationsByRegionId(regionId, filters), new SaveLocationSucceeded()]);
        if (filters) {
          dispatch(new GetLocationFilterOptions(regionId));
        }
        return payload;
      }),
      catchError((error) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error?.error))))
    );
  }

  @Action(UpdateLocation)
  UpdateLocation(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { location, regionId, filters, ignoreWarning }: UpdateLocation
  ): Observable<void> {
    return this.locationService.updateLocation(location, ignoreWarning as boolean).pipe(
      tap((payload) => {
        patchState({ isLocationLoading: false });
        dispatch([new ShowToast(MessageTypes.Success, RECORD_MODIFIED), new GetLocationsByRegionId(regionId, filters), new SaveLocationSucceeded()]);
        if (filters) {
          dispatch(new GetLocationFilterOptions(regionId));
        }
        return payload;
      }),
      catchError((error) => {
        const errorObj = error.error;
        if (errorObj.errors?.IncompleteOpenOrdersExist && errorObj.errors?.InProgressOrdersExist) {
          return dispatch(new ShowToast(MessageTypes.Error, 'Location has Open/ Incomplete Orders please re-assign or close them before inactivating the Location. Location has Orders In Progress past the inactivation date, please review them before inactivating the Location'));
        }
        if (errorObj.errors?.IncompleteOpenOrdersExist) {
          return dispatch(new ShowToast(MessageTypes.Error, 'Location has Open/Incomplete Orders, please re-assign or close them before inactivating the Location'));
        }
        if (errorObj.errors?.InProgressOrdersExist) {
          return dispatch(new SaveLocationConfirm());
        }
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error?.error)));
      })
    );
  }

  @Action(DeleteLocationById)
  DeleteLocationById(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { locationId, regionId, filters }: DeleteLocationById
  ): Observable<any> {
    return this.locationService.deleteLocationById(locationId).pipe(
      tap((payload) => {
        patchState({ isLocationLoading: false });
        dispatch(new GetLocationsByRegionId(regionId, filters));
        return payload;
      }),
      catchError((error: any) => {
        const message = error.error.errors?.EntityInUse
          ? usedByOrderErrorMessage('Location', error.error.errors['EntityInUse'])
          : RECORD_CANNOT_BE_DELETED;
        return dispatch(new ShowToast(MessageTypes.Error, message));
      })
    );
  }

  @Action(GetMasterSkillsByPage)
  GetMasterSkillsByPage(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { pageNumber, pageSize }: GetMasterSkillsByPage
  ): Observable<SkillsPage> {
    patchState({ isOrganizationLoading: true });
    return this.skillsService.getMasterSkills(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ isOrganizationLoading: false, masterSkills: payload });
        return payload;
      })
    );
  }

  @Action(GetMasterSkillsByOrganization)
  GetMasterSkillsByOrganization({
    patchState,
  }: StateContext<OrganizationManagementStateModel>): Observable<MasterSkillByOrganization[]> {
    return this.skillsService.getMasterSkillsByOrganization().pipe(
      tap((payload) => {
        patchState({ masterSkillsByOrganization: payload });
        return payload;
      })
    );
  }

  @Action(GetAssignedSkillsByOrganization)
  GetAssignedSkillsByOrganization(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { params }: GetAssignedSkillsByOrganization,
  ): Observable<AssignedSkillsByOrganization[]> {
    return this.skillsService.getSortedAssignedSkillsByOrganization(params).pipe(
      tap((payload) => {
       patchState({ assignedSkillsByOrganization: payload.map((skill) => ({...skill, id: skill.masterSkillId, name: skill.skillDescription})) });
      })
    );
  }

  @Action(GetFilteringAssignedSkillsByOrganization)
  GetFilteringAssignedSkillsByOrganization(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { params }: GetFilteringAssignedSkillsByOrganization,
  ): Observable<AssignedSkillsByOrganization[]> {
    return this.skillsService.getSortedAssignedSkillsByOrganization(params).pipe(
      tap((payload) => {
       patchState({ filteringAssignedSkillsByOrganization: payload.map((skill) => ({...skill, id: skill.masterSkillId, name: skill.skillDescription})) });
      })
    );
  }

  @Action(ClearAssignedSkillsByOrganization)
  ClearAssignedSkillsByOrganization(
    { patchState }: StateContext<OrganizationManagementStateModel>,
  ): OrganizationManagementStateModel {
    return patchState({ assignedSkillsByOrganization: [] });
  }

  @Action(GetAllSkillsCategories)
  GetAllSkillsCategories(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { params }: GetAllSkillsCategories
  ): Observable<SkillCategoriesPage> {
    return this.categoriesService.getAllSkillsCategories(params).pipe(
      tap((payload) => {
        patchState({ allSkillsCategories: payload });
        return payload;
      })
    );
  }

  @Action(GetSkillsCategoriesByPage)
  GetSkillsCategoriesByPage(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { pageNumber, pageSize }: GetSkillsCategoriesByPage
  ): Observable<SkillCategoriesPage> {
    patchState({ isOrganizationLoading: true });
    return this.categoriesService.getSkillsCategories(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ isOrganizationLoading: false, skillsCategories: payload });
        return payload;
      })
    );
  }

  @Action(SaveSkillsCategory)
  SaveSkillsCategory(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: SaveSkillsCategory
  ): Observable<SkillCategory> {
    patchState({ isOrganizationLoading: true });
    const isCreating = !payload.id;
    return this.categoriesService.saveSkillCategory(payload).pipe(
      tap((payload) => {
        patchState({ isOrganizationLoading: false });
        dispatch(new SaveSkillsCategorySucceeded(payload));
        dispatch(new ShowToast(MessageTypes.Success, isCreating ? RECORD_ADDED : RECORD_MODIFIED));
        return payload;
      })
    );
  }

  @Action(RemoveSkillsCategory)
  RemoveSkillsCategory(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: RemoveSkillsCategory
  ): Observable<any> {
    patchState({ isOrganizationLoading: true });
    return this.categoriesService.removeSkillCategory(payload).pipe(
      tap((payload) => {
        patchState({ isOrganizationLoading: false });
        dispatch(new RemoveSkillsCategorySucceeded());
        return payload;
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, error.error.detail))))
    );
  }

  @Action(SaveMasterSkill)
  SaveMasterSkill(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: SaveMasterSkill
  ): Observable<Skill> {
    const isCreating = !payload.id;
    patchState({ isOrganizationLoading: true });
    return this.skillsService.saveMasterSkill(payload).pipe(
      tap((payload) => {
        patchState({ isOrganizationLoading: false });
        dispatch(new SaveMasterSkillSucceeded(payload));
        dispatch(new ShowToast(MessageTypes.Success, isCreating ? RECORD_ADDED : RECORD_MODIFIED));
        return payload;
      })
    );
  }

  @Action(RemoveMasterSkill)
  RemoveMasterSkill(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: RemoveMasterSkill
  ): Observable<any> {
    patchState({ isOrganizationLoading: true });
    return this.skillsService.removeMasterSkill(payload).pipe(
      tap((payload) => {
        patchState({ isOrganizationLoading: false });
        dispatch(new RemoveMasterSkillSucceeded());
        return payload;
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, error.error.detail))))
    );
  }

  @Action(SaveAssignedSkill)
  SaveAssignedSkill(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: SaveAssignedSkill
  ): Observable<Skill | void> {
    const isCreating = !payload.id;
    patchState({ isOrganizationLoading: true });
    return this.skillsService.saveAssignedSkill(payload).pipe(
      tap((payload) => {
        patchState({ isOrganizationLoading: false });
        dispatch(new SaveAssignedSkillSucceeded(payload));
        dispatch(new ShowToast(MessageTypes.Success, isCreating ? RECORD_ADDED : RECORD_MODIFIED));
        return payload;
      }),
      catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, 'Skill already exists')))
    );
  }

  @Action(GetAssignedSkillsByPage)
  GetAssignedSkillsByPage(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { pageNumber, pageSize, filters }: GetAssignedSkillsByPage
  ): Observable<SkillsPage> {
    patchState({ isOrganizationLoading: true });
    return this.skillsService.getAssignedSkills(pageNumber, pageSize, filters).pipe(
      tap((payload) => {
        payload.items.forEach((item) => {
          item.foreignKey = item.id + '-' + item.masterSkill?.id;
        });
        patchState({ isOrganizationLoading: false, skills: payload });
        return payload;
      })
    );
  }

  @Action(RemoveAssignedSkill)
  RemoveAssignedSkill(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: RemoveAssignedSkill
  ): Observable<any> {
    patchState({ isOrganizationLoading: true });
    return this.skillsService.removeAssignedSkill(payload).pipe(
      tap((payload) => {
        patchState({ isOrganizationLoading: false });
        dispatch(new RemoveAssignedSkillSucceeded());
        return payload;
      }),
      catchError((error: any) => {
        const message = error.error.errors?.EntityInUse
          ? usedByOrderErrorMessage('Skill', error.error.errors['EntityInUse'])
          : 'Skill cannot be deleted';
        return dispatch(new ShowToast(MessageTypes.Error, message));
      })
    );
  }

  @Action(GetCredentialTypes)
  GetCredentialTypes(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    {}: GetCredentialTypes
  ): Observable<CredentialType[]> {
    return this.credentialsService.getCredentialTypes().pipe(
      tap((payload) => {
        patchState({ credentialTypes: payload });
        return payload;
      })
    );
  }

  @Action(SaveCredentialType)
  SaveCredentialTypes(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: SaveCredentialType
  ): Observable<CredentialType> {
    return this.credentialsService.saveUpdateCredentialType(payload).pipe(
      tap((payload) => {
        patchState({ isCredentialTypesLoading: false });
        dispatch(new GetCredentialTypes());
        return payload;
      })
    );
  }

  @Action(UpdateCredentialType)
  UpdateCredentialTypes(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: UpdateCredentialType
  ): Observable<CredentialType> {
    return this.credentialsService.saveUpdateCredentialType(payload).pipe(
      tap((payload) => {
        patchState({ isCredentialLoading: false });
        dispatch(new GetCredentialTypes());
        return payload;
      })
    );
  }

  @Action(RemoveCredentialType)
  RemoveCredentialTypes(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: RemoveCredentialType
  ): Observable<any> {
    return this.credentialsService.removeCredentialType(payload).pipe(
      tap((payload) => {
        patchState({ isCredentialTypesLoading: false });
        dispatch(new GetCredentialTypes());
        return payload;
      }),
      catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))
    );
  }

  @Action(GetCredential)
  GetCredential(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { payload }: GetCredential
  ): Observable<Credential[] | CredentialPage> {
    return this.credentialsService.getCredential(payload).pipe(
      tap((payload) => {
        patchState({ credentials: payload });
        return payload;
      })
    );
  }

  @Action(ClearCredentialsAndTypes)
  ClearCredentialsAndTypes(
    { patchState }: StateContext<OrganizationManagementStateModel>,
  ): OrganizationManagementStateModel {
    return patchState({ credentials: [], credentialTypes: [] });
  }

  @Action(GetCredentialForSettings)
  GetCredentialForSettings(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { filters }: GetCredentialForSettings
  ): Observable<CredentialPage> {
    return this.credentialsService.getCredentialForSettings(filters).pipe(
      tap((payload: CredentialPage) => {
        patchState({credentials: payload});
      })
    )
  }

  @Action(SaveCredential)
  SaveCredential(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: SaveCredential
  ): Observable<Credential | void> {
    return this.credentialsService.saveUpdateCredential(payload).pipe(
      tap((payloadResponse) => {
        patchState({ isCredentialLoading: false });
        if (payload.id) {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
        dispatch(new SaveCredentialSucceeded(payloadResponse));
        return payloadResponse;
      }),
      catchError((error: any) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveCredential)
  RemoveCredential(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: RemoveCredential
  ): Observable<void> {
    return this.credentialsService.removeCredential(payload).pipe(
      tap(() => {
        patchState({ isCredentialLoading: false });
        dispatch(new RemoveCredentialSuccess());
        return payload;
      }),
      catchError((error: any) => {
        const message = error.error.errors?.EntityInUse
          ? usedByOrderErrorMessage('Credential', error.error.errors['EntityInUse'])
          : RECORD_CANNOT_BE_DELETED;
        return dispatch(new ShowToast(MessageTypes.Error, message));
      })
    );
  }

  @Action(GetAllSkills)
  GetAllSkills(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    {}: GetAllSkills
  ): Observable<SkillsPage> {
    return this.skillsService.getAllMasterSkills().pipe(
      tap((payload) => {
        patchState({ skills: payload });
        return payload;
      })
    );
  }

  @Action(GetCredentialSkillGroup)
  GetSkillGroups(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { pageNumber, pageSize }: GetCredentialSkillGroup
  ): Observable<CredentialSkillGroupPage> {
    return this.skillGroupService.getSkillGroups(pageNumber, pageSize).pipe(
      tap((payload) => {
        patchState({ skillGroups: payload });
        return payload;
      })
    );
  }

  @Action(SaveUpdateCredentialSkillGroup)
  SaveUpdateSkillGroup(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload, pageNumber, pageSize }: SaveUpdateCredentialSkillGroup
  ): Observable<CredentialSkillGroup> {
    return this.skillGroupService.saveUpdateSkillGroup(payload).pipe(
      tap((response) => {
        patchState({ isSkillGroupLoading: false });
        if (payload.id) {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
        dispatch(new GetCredentialSkillGroup(pageNumber, pageSize));
        return response;
      })
    );
  }

  @Action(RemoveCredentialSkillGroup)
  RemoveSkillGroup(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload, pageNumber, pageSize }: RemoveCredentialSkillGroup
  ): Observable<void> {
    return this.skillGroupService.removeSkillGroup(payload).pipe(
      tap((payload) => {
        patchState({ isSkillGroupLoading: false });
        dispatch(new GetCredentialSkillGroup(pageNumber, pageSize));
        return payload;
      }),
      catchError((error: any) => {
        const message = error.error.errors?.EntityInUse
          ? usedByOrderErrorMessage('Group', error.error.errors['EntityInUse'])
          : RECORD_CANNOT_BE_DELETED;
        return dispatch(new ShowToast(MessageTypes.Error, message));
      })
    );
  }


  @Action(GetOrganizationSettings)
  GetOrganizationSettingsByOrganizationId(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { filters, lastSelectedBusinessUnitId }: GetOrganizationSettings
  ): Observable<Configuration[] | unknown> {
    return this.organizationSettingsService.getOrganizationSettings(filters, lastSelectedBusinessUnitId).pipe(
      tap((payload) => {
        patchState({ organizationSettings: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        patchState({ organizationSettings: [] });
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(SaveOrganizationSettings)
  SaveOverrideOrganizationSettings(
    { patchState, dispatch }: StateContext<OrganizationManagementStateModel>,
    { organizationSettings, filters }: SaveOrganizationSettings
  ): Observable<void | Observable<void>> {
    return this.organizationSettingsService.saveOrganizationSetting(organizationSettings).pipe(
      tap((payload) => {
        patchState({ isCredentialSetupLoading: false });
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        dispatch(new GetOrganizationSettings(filters));
        return payload;
      }),
      catchError((error: HttpErrorResponse) => of(dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))),
    );
  }

  @Action(ClearDepartmentList)
  ClearDepartmentList(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    {}: ClearDepartmentList
  ): Observable<any> {
    patchState({ departments: [] });
    return of([]);
  }

  @Action(ClearLocationList)
  ClearLocationList(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    {}: ClearLocationList
  ): Observable<any> {
    patchState({ locations: [] });
    return of([]);
  }

  @Action(ExportLocations)
  ExportLocations({}: StateContext<OrganizationManagementStateModel>, { payload }: ExportLocations): Observable<any> {
    return this.locationService.export(payload).pipe(
      tap((file) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      })
    );
  }
  @Action(ExportRegions)
  ExportRegions({}: StateContext<OrganizationManagementStateModel>, { payload }: ExportRegions): Observable<any> {
    return this.regionService.exportRegion(payload).pipe(
      tap((file) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      })
    );
  }

  @Action(ExportDepartments)
  ExportDepartments(
    {}: StateContext<OrganizationManagementStateModel>,
    { payload }: ExportDepartments
  ): Observable<any> {
    return this.departmentService.export(payload).pipe(
      tap((file) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      })
    );
  }

  @Action(ExportSkills)
  ExportSkills({}: StateContext<OrganizationManagementStateModel>, { payload }: ExportSkills): Observable<any> {
    return this.skillsService.exportAssignedSkills(payload).pipe(
      tap((file) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      })
    );
  }

  @Action(GetSkillDataSources)
  GetSkillDataSources(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    {}: GetSkillDataSources
  ): Observable<SkillDataSource> {
    return this.skillsService.getSkillsDataSources().pipe(
      tap((dataSource) => {
        patchState({ skillDataSource: dataSource });
        return dataSource;
      })
    );
  }

  @Action(GetAllOrganizationSkills)
  GetAllOrganizationSkills(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    {}: GetAllOrganizationSkills
  ): Observable<Skill[]> {
    return this.skillsService.getAllOrganizationSkills().pipe(
      tap((skills) => {
        patchState({ allOrganizationSkills: skills });
        return skills;
      })
    );
  }

  @Action(GetLocationFilterOptions)
  GetLocationFilterOptions(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { payload }: GetLocationFilterOptions
  ): Observable<LocationFilterOptions> {
    return this.locationService.getLocationFilterOptions(payload).pipe(
      tap((options) => {
        patchState({ locationFilterOptions: options });
        return options;
      })
    );
  }
  @Action(GetRegionFilterOptions)
  GetRegionFilterOptions(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { payload }: GetRegionFilterOptions
  ): Observable<regionFilter> {
    return this.regionService.getRegionFilterOptions(payload).pipe(
      tap((options) => {
        patchState({ regionFilterOptions: options });
        return options;
      })
    );
  }

  @Action(GetMasterRegions)
  GetMasterRegions(
    { patchState }: StateContext<OrganizationManagementStateModel>,
  ): Observable<Region[]> {
    return this.regionService.getMasterRegions().pipe(
      tap((options) => {
        patchState({ masterRegions: options });
        return options;
      })
    );
  }

  @Action(GetDepartmentFilterOptions)
  GetDepartmentFilterOptions(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { payload }: GetDepartmentFilterOptions
  ): Observable<DepartmentFilterOptions> {
    return this.departmentService.getDepartmentFilterOptions(payload).pipe(
      tap((options) => {
        patchState({ departmentFilterOptions: options });
        return options;
      })
    );
  }

  @Action(GetOrganizationSettingsFilterOptions)
  GetOrganizationSettingsFilterOptions(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    { includeInIRP, includeInVMS }: GetOrganizationSettingsFilterOptions
  ): Observable<string[]> {
    return this.organizationSettingsService.getOrganizationSettingsFilteringOptions(includeInIRP, includeInVMS).pipe(
      tap((options) => {
        patchState({ organizationSettingsFilterOptions: options });
        return options;
      })
    );
  }

  @Action(GetLocationTypes)
  GetLocationTypes(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    {}: GetLocationTypes
  ): Observable<LocationType[]> {
    patchState({ isLocationTypesLoading: true });
    return this.locationService.getLocationTypes().pipe(
      tap((payload) => {
        patchState({ isLocationTypesLoading: false, loctionTypes: payload });
        return payload;
      })
    );
  }

  @Action(GetUSCanadaTimeZoneIds)
  GetUSCanadaTimeZoneIds(
    { patchState }: StateContext<OrganizationManagementStateModel>,
    {}: GetUSCanadaTimeZoneIds
  ): Observable<TimeZoneModel[]> {
    return this.nodatimeService.getUSCanadaTimeZoneIds().pipe(
      tap((payload) => {
        patchState({ timeZones: payload });
        return payload;
      })
    );
  }

  @Action(GetLocationsImportTemplate)
  GetLocationsImportTemplate(
    { dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: GetLocationsImportTemplate
  ): Observable<any> {
    return this.locationService.getLocationsImportTemplate(payload).pipe(
      tap((payload) => {
        dispatch(new GetLocationsImportTemplateSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Cannot download the file'))))
    );
  }

  @Action(GetLocationsImportErrors)
  GetLocationsImportErrors(
    { dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: GetLocationsImportErrors
  ): Observable<any> {
    return this.locationService.getLocationsImportTemplate(payload).pipe(
      tap((payload) => {
        dispatch(new GetLocationsImportErrorsSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Cannot download the file'))))
    );
  }

  @Action(UploadLocationsFile)
  UploadLocationsFile(
    { dispatch }: StateContext<CandidateStateModel>,
    { payload }: UploadLocationsFile
  ): Observable<ImportResult<ImportedLocation> | Observable<void>> {
    return this.locationService.uploadLocationsFile(payload).pipe(
      tap((payload) => {
        dispatch(new UploadLocationsFileSucceeded(payload));
        return payload;
      }),
      catchError((error: any) =>
        of(
          dispatch(
            new ShowToast(
              MessageTypes.Error,
              error && error.error ? getAllErrors(error.error) : 'File was not uploaded'
            )
          )
        )
      )
    );
  }

  @Action(SaveLocationsImportResult)
  SaveLocationsImportResult(
    { dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: SaveLocationsImportResult
  ): Observable<ImportResult<ImportedLocation> | Observable<void>> {
    return this.locationService.saveLocationImportResult(payload).pipe(
      tap((payload) => {
        dispatch(new SaveLocationsImportResultSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Locations were not imported'))))
    );
  }

  @Action(GetDepartmentsImportTemplate)
  GetDepartmentsImportTemplate(
    { dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: GetDepartmentsImportTemplate
  ): Observable<any> {
    return this.departmentService.getDepartmentsImportTemplate(payload).pipe(
      tap((payload) => {
        dispatch(new GetDepartmentsImportTemplateSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Cannot download the file'))))
    );
  }

  @Action(GetDepartmentsImportErrors)
  GetDepartmentsImportErrors(
    { dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: GetDepartmentsImportErrors
  ): Observable<any> {
    return this.departmentService.getDepartmentsImportTemplate(payload).pipe(
      tap((payload) => {
        dispatch(new GetDepartmentsImportErrorsSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Cannot download the file'))))
    );
  }

  @Action(UploadDepartmentsFile)
  UploadDepartmentsFile(
    { dispatch }: StateContext<CandidateStateModel>,
    { payload }: UploadDepartmentsFile
  ): Observable<ImportResult<ImportedDepartment> | Observable<void>> {
    return this.departmentService.uploadDepartmentsFile(payload).pipe(
      tap((payload) => {
        dispatch(new UploadDepartmentsFileSucceeded(payload));
        return payload;
      }),
      catchError((error: any) =>
        of(
          dispatch(
            new ShowToast(
              MessageTypes.Error,
              error && error.error ? getAllErrors(error.error) : 'File was not uploaded'
            )
          )
        )
      )
    );
  }

  @Action(SaveDepartmentsImportResult)
  SaveDepartmentsImportResult(
    { dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: SaveDepartmentsImportResult
  ): Observable<ImportResult<ImportedDepartment> | Observable<void>> {
    return this.departmentService.saveDepartmentsImportResult(payload).pipe(
      tap((payload) => {
        dispatch(new SaveDepartmentsImportResultSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Bill rates were not imported'))))
    );
  }

  @Action(GetBillRatesImportTemplate)
  GetBillRatesImportTemplate(
    { dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: GetBillRatesImportTemplate
  ): Observable<any> {
    return this.billRatesService.getBillRatesImportTemplate(payload).pipe(
      tap((payload) => {
        dispatch(new GetBillRatesImportTemplateSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Cannot download the file'))))
    );
  }

  @Action(GetBillRatesImportErrors)
  GetBillRatesImportErrors(
    { dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: GetBillRatesImportErrors
  ): Observable<any> {
    return this.billRatesService.getBillRatesImportTemplate(payload).pipe(
      tap((payload) => {
        dispatch(new GetBillRatesImportErrorsSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Cannot download the file'))))
    );
  }

  @Action(UploadBillRatesFile)
  UploadBillRatesFile(
    { dispatch }: StateContext<CandidateStateModel>,
    { payload }: UploadBillRatesFile
  ): Observable<ImportResult<ImportedBillRate> | Observable<void>> {
    return this.billRatesService.uploadBillRatesFile(payload).pipe(
      tap((payload) => {
        dispatch(new UploadBillRatesFileSucceeded(payload));
        return payload;
      }),
      catchError((error: any) =>
        of(
          dispatch(
            new ShowToast(
              MessageTypes.Error,
              error && error.error ? getAllErrors(error.error) : 'File was not uploaded'
            )
          )
        )
      )
    );
  }

  @Action(SaveBillRatesImportResult)
  SaveBillRatesImportResult(
    { dispatch }: StateContext<OrganizationManagementStateModel>,
    { payload }: SaveBillRatesImportResult
  ): Observable<ImportResult<ImportedBillRate> | Observable<void>> {
    return this.billRatesService.saveBillRatesImportResult(payload).pipe(
      tap((payload) => {
        dispatch(new SaveBillRatesImportResultSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Bill rates were not imported'))))
    );
  }


  @Action(GetRegionsImportTemplate)
  GetRegionsImportTemplate({ dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: GetRegionsImportTemplate): Observable<any> {
    return this.regionService.getRegionsImportTemplate(payload).pipe(
      tap((payload) => {
        dispatch(new GetRegionsImportTemplateSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Cannot download the file'))))
    );
  }

  @Action(GetRegionsImportErrors)
  GetRegionsImportErrors({ dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: GetRegionsImportErrors): Observable<any> {
    return this.regionService.getRegionsImportTemplate(payload).pipe(
      tap((payload) => {
        dispatch(new GetRegionsImportErrorsSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Cannot download the file'))))
    );
  }

  @Action(UploadRegionsFile)
  UploadRegionsFile({ dispatch }: StateContext<CandidateStateModel>, { payload }: UploadRegionsFile): Observable<ImportResult<ImportedRegion> | Observable<void>> {
    return this.regionService.uploadRegionsFile(payload).pipe(
      tap((payload) => {
        dispatch(new UploadRegionsFileSucceeded(payload));
        return payload;
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, error && error.error ? getAllErrors(error.error) : 'File was not uploaded'))))
    );
  }

  @Action(SaveRegionsImportResult)
  SaveRegionsImportResult({ dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: SaveRegionsImportResult): Observable<ImportResult<ImportedRegion> | Observable<void>> {
    return this.regionService.saveRegionImportResult(payload).pipe(
      tap((payload) => {
        dispatch(new SaveRegionsImportResultSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Regions were not imported'))))
    );
  }
}
