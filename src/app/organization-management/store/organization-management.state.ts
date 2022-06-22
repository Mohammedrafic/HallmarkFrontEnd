import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { catchError, Observable, of, tap } from 'rxjs';
import { Days } from 'src/app/shared/enums/days';
import { SendDocumentAgency } from 'src/app/shared/enums/send-document-agency';
import { Country, UsaStates, CanadaStates } from 'src/app/shared/enums/states';
import { Status } from 'src/app/shared/enums/status';
import { BusinessUnit } from 'src/app/shared/models/business-unit.model';
import { Organization } from 'src/app/shared/models/organization.model';
import { OrganizationService } from '@shared/services/organization.service';

import {
  SaveDepartment,
  GetBusinessUnitList,
  GetDepartmentsByLocationId,
  GetLocationsByOrganizationId,
  GetRegions,
  SetBillingStatesByCountry,
  SetDirtyState,
  SaveOrganization,
  UploadOrganizationLogo,
  SaveOrganizationSucceeded,
  GetOrganizationById,
  GetOrganizationByIdSucceeded,
  SetGeneralStatesByCountry,
  UpdateDepartment,
  DeleteDepartmentById,
  GetLocationById,
  UpdateLocation,
  DeleteLocationById,
  SaveLocation,
  SaveRegion,
  UpdateRegion,
  DeleteRegionById,
  GetLocationsByRegionId,
  GetMasterSkillsByPage,
  GetSkillsCategoriesByPage,
  SaveSkillsCategory,
  SaveSkillsCategorySucceeded,
  RemoveSkillsCategory,
  RemoveSkillsCategorySucceeded,
  GetAllSkillsCategories,
  SaveMasterSkill,
  SaveMasterSkillSucceeded,
  RemoveMasterSkill,
  RemoveMasterSkillSucceeded,
  SaveAssignedSkill,
  GetAssignedSkillsByPage,
  RemoveAssignedSkill,
  SaveAssignedSkillSucceeded,
  RemoveAssignedSkillSucceeded,
  GetCredentialTypes,
  SaveCredentialType,
  RemoveCredentialType,
  GetCredential,
  SaveCredential,
  RemoveCredential,
  GetOrganizationLogo,
  GetOrganizationLogoSucceeded,
  UpdateCredentialType,
  GetAllSkills,
  GetCredentialSkillGroup,
  SaveCredentialSkillGroup,
  UpdateCredentialSkillGroup,
  RemoveCredentialSkillGroup,
  GetCredentialSetupByPage,
  SaveUpdateCredentialSetup,
  GetOrganizationSettings,
  SaveOrganizationSettings,
  ClearDepartmentList,
  ClearLocationList,
  GetSkillDataSources,
  SaveCredentialSucceeded,
  SaveUpdateCredentialSetupSucceeded,
  ExportLocations,
  ExportDepartments,
  ExportSkills,
  GetMasterSkillsByOrganization, GetAllOrganizationSkills
} from './organization-management.actions';
import { Department } from '@shared/models/department.model';
import { Region } from '@shared/models/region.model';
import { Location } from '@shared/models/location.model';
import { GeneralPhoneTypes } from '@shared/constants/general-phone-types';
import { SkillsService } from '@shared/services/skills.service';
import { MasterSkillByOrganization, Skill, SkillsPage, SkillDataSource } from 'src/app/shared/models/skill.model';
import { SkillCategoriesPage, SkillCategory } from 'src/app/shared/models/skill-category.model';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from 'src/app/shared/enums/message-types';
import { CredentialType } from '@shared/models/credential-type.model';
import { Credential } from '@shared/models/credential.model';
import { RECORD_ADDED, RECORD_CANNOT_BE_DELETED, RECORD_CANNOT_BE_UPDATED, RECORD_MODIFIED } from 'src/app/shared/constants/messages';
import { CandidateStateModel } from '@agency/store/candidate.state';
import { CredentialSkillGroup, CredentialSkillGroupPage } from '@shared/models/skill-group.model';
import { CredentialSetup, CredentialSetupPage } from '@shared/models/credential-setup.model';
import { OrganizationSettingsGet } from '@shared/models/organization-settings.model';
import { CategoriesService } from '@shared/services/categories.service';
import { DepartmentsService } from '@shared/services/departments.service';
import { RegionService } from '@shared/services/region.service';
import { LocationService } from '@shared/services/location.service';
import { CredentialsService } from '@shared/services/credentials.service';
import { SkillGroupService } from '@shared/services/skill-group.service';
import { OrganizationSettingsService } from '@shared/services/organization-settings.service';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { getAllErrors } from '@shared/utils/error.utils';

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
  departments: Department[];
  regions: Region[];
  locations: Location[];
  location: Location | null;
  organization: Organization | null;
  masterSkills: SkillsPage | null;
  masterSkillsByOrganization: MasterSkillByOrganization[];
  skills: SkillsPage | null;
  skillsCategories: SkillCategoriesPage | null;
  allSkillsCategories: SkillCategoriesPage | null;
  isDirty: boolean;
  credentialTypes: CredentialType[];
  credentials: Credential[];
  isCredentialTypesLoading: boolean;
  isCredentialLoading: boolean;
  skillGroups: CredentialSkillGroupPage | null;
  isSkillGroupLoading: boolean;
  credentialSetupPage: CredentialSetupPage | null;
  isCredentialSetupLoading: boolean;
  isOrganizationSettingsLoading: boolean;
  organizationSettings: OrganizationSettingsGet[];
  skillDataSource: SkillDataSource;
  allOrganizationSkills: SkillsPage | null;
}

@State<OrganizationManagementStateModel>({
  name: 'organizationManagement',
  defaults: {
    countries: [{ id: Country.USA, text: Country[0] }, { id: Country.Canada, text: Country[1] }],
    statesGeneral: UsaStates,
    statesBilling: UsaStates,
    phoneTypes: GeneralPhoneTypes,
    businessUnits: [],
    sendDocumentAgencies: [
      { id: SendDocumentAgency.Accepted, text: 'Accepted' },
      { id: SendDocumentAgency.Offered, text: 'Offered' },
      { id: SendDocumentAgency.Onboard, text: 'Onboard' }
    ],
    days: Days,
    statuses: Object.keys(Status).filter(StringIsNumber).map((statusName, index) => ({ id: index, text: statusName })),
    isOrganizationLoading: false,
    organization: null,
    isDepartmentLoading: false,
    isLocationLoading: false,
    departments: [],
    regions: [],
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
    credentialSetupPage: null,
    isCredentialSetupLoading: false,
    isOrganizationSettingsLoading: false,
    organizationSettings: [],
    skillDataSource: { skillABBRs: [], skillDescriptions: [], glNumbers: [] },
    allOrganizationSkills: null
  },
})
@Injectable()
export class OrganizationManagementState {
  @Selector()
  static countries(state: OrganizationManagementStateModel): DropdownOption[] { return state.countries; }

  @Selector()
  static statesGeneral(state: OrganizationManagementStateModel): string[] | null { return state.statesGeneral; }

  @Selector()
  static phoneTypes(state: OrganizationManagementStateModel): string[] | null { return state.phoneTypes; }

  @Selector()
  static statesBilling(state: OrganizationManagementStateModel): string[] | null { return state.statesBilling; }

  @Selector()
  static businessUnits(state: OrganizationManagementStateModel): BusinessUnit[] { return state.businessUnits; }

  @Selector()
  static sendDocumentAgencies(state: OrganizationManagementStateModel): DropdownOption[] { return state.sendDocumentAgencies; }

  @Selector()
  static days(state: OrganizationManagementStateModel): DropdownOption[] { return state.days; }

  @Selector()
  static statuses(state: OrganizationManagementStateModel): DropdownOption[] { return state.statuses; }

  @Selector()
  static isDirty(state: OrganizationManagementStateModel): boolean { return state.isDirty; }

  @Selector()
  static departments(state: OrganizationManagementStateModel): Department[] { return state.departments; }

  @Selector()
  static regions(state: OrganizationManagementStateModel): Region[] { return state.regions; }

  @Selector()
  static locationsByRegionId(state: OrganizationManagementStateModel): Location[] { return state.locations; }

  @Selector()
  static locationById(state: OrganizationManagementStateModel): Location | null { return state.location; }

  @Selector()
  static organization(state: OrganizationManagementStateModel): Organization | null { return state.organization; }

  @Selector()
  static masterSkills(state: OrganizationManagementStateModel): SkillsPage | null { return state.masterSkills; }

  @Selector()
  static masterSkillsByOrganization(state: OrganizationManagementStateModel): MasterSkillByOrganization[] { return state.masterSkillsByOrganization; }

  @Selector()
  static skills(state: OrganizationManagementStateModel): SkillsPage | null { return state.skills; }

  @Selector()
  static skillsCategories(state: OrganizationManagementStateModel): SkillCategoriesPage | null { return state.skillsCategories; }

  @Selector()
  static allSkillsCategories(state: OrganizationManagementStateModel): SkillCategoriesPage | null { return state.allSkillsCategories; }

  @Selector()
  static credentialTypes(state: OrganizationManagementStateModel): CredentialType[] { return state.credentialTypes; }

  @Selector()
  static credentials(state: OrganizationManagementStateModel): Credential[] { return state.credentials }

  @Selector()
  static skillGroups(state: OrganizationManagementStateModel): CredentialSkillGroupPage  | null { return state.skillGroups }

  @Selector()
  static credentialSetups(state: OrganizationManagementStateModel): CredentialSetupPage | null { return state.credentialSetupPage }

  @Selector()
  static organizationSettings(state: OrganizationManagementStateModel): OrganizationSettingsGet[] { return state.organizationSettings }

  @Selector()
  static skillDataSource(state: OrganizationManagementStateModel): SkillDataSource { return state.skillDataSource; }

  @Selector()
  static allOrganizationSkills(state: OrganizationManagementStateModel): SkillsPage | null { return state.allOrganizationSkills; }

  constructor(
    private organizationService: OrganizationService,
    private skillsService: SkillsService,
    private categoriesService: CategoriesService,
    private departmentService: DepartmentsService,
    private regionService: RegionService,
    private locationService: LocationService,
    private credentialsService: CredentialsService,
    private skillGroupService: SkillGroupService,
    private organizationSettingsService: OrganizationSettingsService
  ) { }

  @Action(SetGeneralStatesByCountry)
  SetGeneralStatesByCountry({ patchState }: StateContext<OrganizationManagementStateModel>, { payload }: SetGeneralStatesByCountry): void {
    patchState({ statesGeneral: payload === Country.USA ? UsaStates : CanadaStates });
  }

  @Action(SetBillingStatesByCountry)
  SetBillingStatesByCountry({ patchState }: StateContext<OrganizationManagementStateModel>, { payload }: SetBillingStatesByCountry): void {
    patchState({ statesBilling: payload === Country.USA ? UsaStates : CanadaStates });
  }

  @Action(GetOrganizationById)
  GetOrganizationById({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: GetOrganizationById): Observable<Organization> {
    patchState({ isOrganizationLoading: true });
    return this.organizationService.getOrganizationById(payload).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false, organization: payload });
      dispatch(new GetOrganizationByIdSucceeded(payload));
      return payload;
    }));
  }

  @Action(SaveOrganization)
  SaveOrganization({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: SaveOrganization): Observable<Organization> {
    patchState({ isOrganizationLoading: true });
    return this.organizationService.saveOrganization(payload).pipe(tap((payloadResponse) => {
      patchState({ isOrganizationLoading: false });
      dispatch(new SaveOrganizationSucceeded(payloadResponse));
      if (payload.organizationId) {
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      } else {
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
      }
      return payloadResponse;
    }));
  }

  @Action(UploadOrganizationLogo)
  UploadOrganizationLogo({ patchState }: StateContext<OrganizationManagementStateModel>, { file, businessUnitId }: UploadOrganizationLogo): Observable<any> {
    patchState({ isOrganizationLoading: true });
    return this.organizationService.saveOrganizationLogo(file, businessUnitId).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false });
      return payload;
    }));
  }

  @Action(GetOrganizationLogo)
  GetOrganizationLogo({ dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: GetOrganizationLogo): Observable<any> {
    return this.organizationService.getOrganizationLogo(payload).pipe(tap((payload) => {
      dispatch(new GetOrganizationLogoSucceeded(payload));
      return payload;
    }));
  }

  @Action(GetBusinessUnitList)
  GetBusinessUnitList({ patchState }: StateContext<OrganizationManagementStateModel>, { }: GetBusinessUnitList): Observable<BusinessUnit[]> {
    return this.organizationService.getBusinessUnit().pipe(tap((payload) => {
      patchState({ businessUnits: payload});
      return payload;
    }));
  }

  @Action(SetDirtyState)
  SetDirtyState({ patchState }: StateContext<OrganizationManagementStateModel>, { payload }: SetDirtyState): void {
    patchState({ isDirty: payload });
  }

  @Action(SaveDepartment)
  SaveDepartment({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: SaveDepartment): Observable<Department> {
    patchState({ isDepartmentLoading: true });
    return this.departmentService.saveDepartment(payload).pipe(tap((payload) => {
      patchState({ isDepartmentLoading: false});
      dispatch(new GetDepartmentsByLocationId(payload.locationId));
      return payload;
    }));
  }

  @Action(GetDepartmentsByLocationId)
  GetDepartmentsByLocationId({ patchState }: StateContext<OrganizationManagementStateModel>, { locationId }: GetDepartmentsByLocationId): Observable<Department[]> {
    return this.departmentService.getDepartmentsByLocationId(locationId).pipe(tap((payload) => {
      patchState({ departments: payload});
      return payload;
    }));
  }

  @Action(UpdateDepartment)
  UpdateDepartments({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { department }: UpdateDepartment): Observable<void> {
    return this.departmentService.updateDepartment(department).pipe(tap((payload) => {
      patchState({ isDepartmentLoading: false });
      dispatch(new GetDepartmentsByLocationId(department.locationId));
      return payload;
    }));
  }

  @Action(DeleteDepartmentById)
  DeleteDepartmentById({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { department }: DeleteDepartmentById): Observable<any> {
    return this.departmentService.deleteDepartmentById(department.departmentId).pipe(tap((payload) => {
      patchState({ isDepartmentLoading: false });
      dispatch(new GetDepartmentsByLocationId(department.locationId));
      return payload;
    }),
      catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail))));
  }

  @Action(GetRegions)
  GetRegions({ patchState }: StateContext<OrganizationManagementStateModel>, { }: GetRegions): Observable<Region[]> {
    return this.regionService.getRegionsByOrganizationId().pipe(tap((payload) => {
      patchState({ regions: payload});
      return payload;
    }));
  }

  @Action(SaveRegion)
  SaveRegion({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { region }: SaveRegion): Observable<Region> {
    patchState({ isLocationLoading: true });
    return this.regionService.saveRegion(region).pipe(tap((payload) => {
      patchState({ isLocationLoading: false});
      dispatch(new GetRegions());
      return payload;
    }));
  }

  @Action(UpdateRegion)
  UpdateRegion({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { region }: UpdateRegion): Observable<void> {
    return this.regionService.updateRegion(region).pipe(tap((payload) => {
      patchState({ isLocationLoading: false });
      dispatch(new GetRegions());
      return payload;
    }));
  }

  @Action(DeleteRegionById)
  DeleteRegionById({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { regionId }: DeleteRegionById): Observable<void> {
    return this.regionService.deleteRegionById(regionId).pipe(tap((payload) => {
      patchState({ isLocationLoading: false });
      dispatch(new GetRegions());
      return payload;
    }));
  }

  @Action(GetLocationsByOrganizationId)
  GetLocationsByOrganizationId({ patchState }: StateContext<OrganizationManagementStateModel>, { organizationId }: GetLocationsByOrganizationId): Observable<Location[]> {
    return this.locationService.getLocationsByOrganizationId(organizationId).pipe(tap((payload) => {
      patchState({ locations: payload});
      return payload;
    }));
  }

  @Action(GetLocationsByRegionId)
  GetLocationsByRegionId({ patchState }: StateContext<OrganizationManagementStateModel>, { regionId }: GetLocationsByRegionId): Observable<Location[]> {
    return this.locationService.getLocationsByRegionId(regionId).pipe(tap((payload) => {
      patchState({ locations: payload});
      return payload;
    }));
  }

  @Action(GetLocationById)
  GetLocationById({ patchState }: StateContext<OrganizationManagementStateModel>, { locationId }: GetLocationById): Observable<Location> {
    return this.locationService.getLocationById(locationId).pipe(tap((payload) => {
      patchState({ location: payload});
      return payload;
    }));
  }

  @Action(SaveLocation)
  SaveLocation({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { location, regionId }: SaveLocation): Observable<Location> {
    patchState({ isLocationLoading: true });
    return this.locationService.saveLocation(location).pipe(tap((payload) => {
      patchState({ isLocationLoading: false});
      dispatch(new GetLocationsByRegionId(regionId));
      return payload;
    }));
  }

  @Action(UpdateLocation)
  UpdateLocation({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { location, regionId }: UpdateLocation): Observable<void> {
    return this.locationService.updateLocation(location).pipe(tap((payload) => {
      patchState({ isLocationLoading: false });
      dispatch(new GetLocationsByRegionId(regionId));
      return payload;
    }));
  }

  @Action(DeleteLocationById)
  DeleteLocationById({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { locationId, regionId }: DeleteLocationById): Observable<any> {
    return this.locationService.deleteLocationById(locationId).pipe(tap((payload) => {
      patchState({ isLocationLoading: false });
      dispatch(new GetLocationsByRegionId(regionId));
      return payload;
    }),
    catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail))));
  }

  @Action(GetMasterSkillsByPage)
  GetMasterSkillsByPage({ patchState }: StateContext<OrganizationManagementStateModel>, { pageNumber, pageSize }: GetMasterSkillsByPage): Observable<SkillsPage> {
    patchState({ isOrganizationLoading: true });
    return this.skillsService.getMasterSkills(pageNumber, pageSize).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false, masterSkills: payload });
      return payload;
    }));
  }

  @Action(GetMasterSkillsByOrganization)
  GetMasterSkillsByOrganization({ patchState }: StateContext<OrganizationManagementStateModel>): Observable<MasterSkillByOrganization[]> {
    return this.skillsService.getMasterSkillsByOrganization().pipe(tap(payload => {
      patchState({ masterSkillsByOrganization: payload });
      return payload;
    }));
  }

  @Action(GetAllSkillsCategories)
  GetAllSkillsCategories({ patchState }: StateContext<OrganizationManagementStateModel>, { }: GetAllSkillsCategories): Observable<SkillCategoriesPage> {
    return this.categoriesService.getAllSkillsCategories().pipe(tap((payload) => {
      patchState({ allSkillsCategories: payload });
      return payload;
    }));
  }

  @Action(GetSkillsCategoriesByPage)
  GetSkillsCategoriesByPage({ patchState }: StateContext<OrganizationManagementStateModel>, { pageNumber, pageSize }: GetSkillsCategoriesByPage): Observable<SkillCategoriesPage> {
    patchState({ isOrganizationLoading: true });
    return this.categoriesService.getSkillsCategories(pageNumber, pageSize).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false, skillsCategories: payload });
      return payload;
    }));
  }

  @Action(SaveSkillsCategory)
  SaveSkillsCategory({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: SaveSkillsCategory): Observable<SkillCategory> {
    patchState({ isOrganizationLoading: true });
    const isCreating = !payload.id;
    return this.categoriesService.saveSkillCategory(payload).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false });
      dispatch(new SaveSkillsCategorySucceeded(payload));
      dispatch(new ShowToast(MessageTypes.Success, isCreating ? RECORD_ADDED : RECORD_MODIFIED));
      return payload;
    }));
  }

  @Action(RemoveSkillsCategory)
  RemoveSkillsCategory({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: RemoveSkillsCategory): Observable<any> {
    patchState({ isOrganizationLoading: true });
    return this.categoriesService.removeSkillCategory(payload).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false });
      dispatch(new RemoveSkillsCategorySucceeded);
      return payload;
    }),
    catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))));
  }

  @Action(SaveMasterSkill)
  SaveMasterSkill({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: SaveMasterSkill): Observable<Skill> {
    const isCreating = !payload.id;
    patchState({ isOrganizationLoading: true });
    return this.skillsService.saveMasterSkill(payload).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false });
      dispatch(new SaveMasterSkillSucceeded(payload));
      dispatch(new ShowToast(MessageTypes.Success, isCreating ? RECORD_ADDED : RECORD_MODIFIED));
      return payload;
    }));
  }

  @Action(RemoveMasterSkill)
  RemoveMasterSkill({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: RemoveMasterSkill): Observable<any> {
    patchState({ isOrganizationLoading: true });
    return this.skillsService.removeMasterSkill(payload).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false });
      dispatch(new RemoveMasterSkillSucceeded);
      return payload;
    }),
    catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))));
  }

  @Action(SaveAssignedSkill)
  SaveAssignedSkill({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: SaveAssignedSkill): Observable<Skill | void> {
    const isCreating = !payload.id;
    patchState({ isOrganizationLoading: true });
    return this.skillsService.saveAssignedSkill(payload).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false });
      dispatch(new SaveAssignedSkillSucceeded(payload));
      dispatch(new ShowToast(MessageTypes.Success, isCreating ? RECORD_ADDED : RECORD_MODIFIED));
      return payload;
    }),
    catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, 'Skill already exists')))
    );
  }

  @Action(GetAssignedSkillsByPage)
  GetAssignedSkillsByPage({ patchState }: StateContext<OrganizationManagementStateModel>, { pageNumber, pageSize, filters }: GetAssignedSkillsByPage): Observable<SkillsPage> {
    patchState({ isOrganizationLoading: true });
    return this.skillsService.getAssignedSkills(pageNumber, pageSize, filters).pipe(tap((payload) => {
      payload.items.forEach(item => {
        item.foreignKey = item.id + '-' + item.masterSkill?.id;
      });
      patchState({ isOrganizationLoading: false, skills: payload });
      return payload;
    }));
  }

  @Action(RemoveAssignedSkill)
  RemoveAssignedSkill({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: RemoveAssignedSkill): Observable<any> {
    patchState({ isOrganizationLoading: true });
    return this.skillsService.removeAssignedSkill(payload).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false });
      dispatch(new RemoveAssignedSkillSucceeded);
      return payload;
    }),
    catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Skill cannot be deleted')))));
  }

  @Action(GetCredentialTypes)
  GetCredentialTypes({ patchState }: StateContext<OrganizationManagementStateModel>, { }: GetCredentialTypes): Observable<CredentialType[]> {
  return this.credentialsService.getCredentialTypes().pipe(tap((payload) => {
      patchState({ credentialTypes: payload });
      return payload;
    }));
  }

  @Action(SaveCredentialType)
  SaveCredentialTypes({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: SaveCredentialType): Observable<CredentialType> {
    return this.credentialsService.saveUpdateCredentialType(payload).pipe(tap((payload) => {
      patchState({ isCredentialTypesLoading: false });
      dispatch(new GetCredentialTypes());
      return payload;
    }));
  }

  @Action(UpdateCredentialType)
  UpdateCredentialTypes({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: UpdateCredentialType): Observable<CredentialType> {
    return this.credentialsService.saveUpdateCredentialType(payload).pipe(tap((payload) => {
      patchState({ isCredentialLoading: false });
      dispatch(new GetCredentialTypes());
      return payload;
    }));
  }

  @Action(RemoveCredentialType)
  RemoveCredentialTypes({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: RemoveCredentialType): Observable<any> {
    return this.credentialsService.removeCredentialType(payload).pipe(tap((payload) => {
      patchState({ isCredentialTypesLoading: false });
      dispatch(new GetCredentialTypes());
      return payload;
    }),
    catchError((error: any) =>  dispatch(new ShowToast(MessageTypes.Error, error.error.detail))));
  }

  @Action(GetCredential)
  GetCredential({ patchState }: StateContext<OrganizationManagementStateModel>, { }: GetCredential): Observable<Credential[]> {
    return this.credentialsService.getCredential().pipe(tap((payload) => {
      patchState({ credentials: payload });
      return payload;
    }));
  }

  @Action(SaveCredential)
  SaveCredential({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: SaveCredential): Observable<Credential | void> {
    return this.credentialsService.saveUpdateCredential(payload)
      .pipe(
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
          return dispatch(new ShowToast(MessageTypes.Error, error.error.detail))
        })
      );
  }

  @Action(RemoveCredential)
  RemoveCredential({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: RemoveCredential): Observable<any> {
    return this.credentialsService.removeCredential(payload).pipe(tap(() => {
      patchState({ isCredentialLoading: false });
      dispatch(new GetCredential());
      return payload;
    }),
    catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error.error.detail))));
  }

  @Action(GetAllSkills)
  GetAllSkills({ patchState }: StateContext<CandidateStateModel>, { }: GetAllSkills): Observable<SkillsPage> {
    return this.skillsService.getAllMasterSkills().pipe(
      tap((payload) => {
        patchState({ skills: payload });
        return payload;
      })
    );
  }

  @Action(GetCredentialSkillGroup)
  GetSkillGroups({ patchState }: StateContext<OrganizationManagementStateModel>, { }: GetCredentialSkillGroup): Observable<CredentialSkillGroupPage> {
    return this.skillGroupService.getSkillGroups().pipe(tap((payload) => {
      patchState({ skillGroups: payload });
      return payload;
    }));
  }

  @Action(SaveCredentialSkillGroup)
  SaveSkillGroup({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: SaveCredentialSkillGroup): Observable<CredentialSkillGroup> {
    return this.skillGroupService.saveUpdateSkillGroup(payload).pipe(tap((payload) => {
      patchState({ isSkillGroupLoading: false });
      dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
      dispatch(new GetCredentialSkillGroup());
      return payload;
    }));
  }

  @Action(UpdateCredentialSkillGroup)
  UpdateSkillGroup({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: UpdateCredentialSkillGroup): Observable<CredentialSkillGroup> {
    return this.skillGroupService.saveUpdateSkillGroup(payload).pipe(tap((payload) => {
      patchState({ isSkillGroupLoading: false });
      dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      dispatch(new GetCredentialSkillGroup());
      return payload;
    }));
  }

  @Action(RemoveCredentialSkillGroup)
  RemoveSkillGroup({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { payload }: RemoveCredentialSkillGroup): Observable<void> {
    return this.skillGroupService.removeSkillGroup(payload).pipe(
      tap((payload) => {
      patchState({ isSkillGroupLoading: false });
      dispatch(new GetCredentialSkillGroup());
      return payload;
    }),
      catchError((error: any) => {
        return dispatch(new ShowToast(MessageTypes.Error, error && error.error ? getAllErrors(error.error) : RECORD_CANNOT_BE_DELETED))
      })
    );
  }

  @Action(GetCredentialSetupByPage)
  GetCredentialSetupByPage({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { pageNumber, pageSize }: GetCredentialSetupByPage): Observable<CredentialSetupPage> {
    return this.credentialsService.getCredentialSetup(pageNumber, pageSize).pipe(tap((payload) => {
      dispatch(new GetCredentialTypes());
      const invalidDate = '0001-01-01T00:00:00+00:00';
      payload?.items.forEach((item: any) => {
        item.inactiveDate === invalidDate ? item.inactiveDate = '' : item.inactiveDate;
      });
      patchState({ credentialSetupPage: payload });
      return payload;
    }));
  }

  @Action(SaveUpdateCredentialSetup)
  SaveUpdateCredentialSetup({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { credentialSetup }: SaveUpdateCredentialSetup): Observable<CredentialSetup> {
    return this.credentialsService.saveUpdateCredentialSetup(credentialSetup).pipe(tap((payload) => {
      patchState({ isCredentialSetupLoading: false });
      dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      dispatch(new SaveUpdateCredentialSetupSucceeded(payload));
      return payload;
    }));
  }

  @Action(GetOrganizationSettings)
  GetOrganizationSettingsByOrganizationId({ patchState }: StateContext<OrganizationManagementStateModel>, { }: GetOrganizationSettings): Observable<OrganizationSettingsGet[]> {
    return this.organizationSettingsService.getOrganizationSettings().pipe(tap((payload) => {
      patchState({ organizationSettings: payload });
      return payload;
    }));
  }

  @Action(SaveOrganizationSettings)
  SaveOverrideOrganizationSettings({ patchState, dispatch }: StateContext<OrganizationManagementStateModel>, { organizationSettings }: SaveOrganizationSettings): Observable<void> {
    return this.organizationSettingsService.saveOrganizationSetting(organizationSettings).pipe(tap((payload) => {
      patchState({ isCredentialSetupLoading: false });
      dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      dispatch(new GetOrganizationSettings());
      return payload;
    }));
  }

  @Action(ClearDepartmentList)
  ClearDepartmentList({ patchState }: StateContext<OrganizationManagementStateModel>, { }: ClearDepartmentList): Observable<any> {
    patchState({ departments: [] });
    return of([]);
  };

  @Action(ClearLocationList)
  ClearLocationList({ patchState }: StateContext<OrganizationManagementStateModel>, { }: ClearLocationList): Observable<any> {
    patchState({locations: []});
    return of([]);
  };

  @Action(ExportLocations)
  ExportLocations({ }: StateContext<OrganizationManagementStateModel>, { payload }: ExportLocations): Observable<any> {
    return this.locationService.export(payload).pipe(tap(file => {
      const url = window.URL.createObjectURL(file);
      saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
    }));
  };

  @Action(ExportDepartments)
  ExportDepartments({ }: StateContext<OrganizationManagementStateModel>, { payload }: ExportDepartments): Observable<any> {
    return this.departmentService.export(payload).pipe(tap(file => {
      const url = window.URL.createObjectURL(file);
      saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
    }));
  };

  @Action(ExportSkills)
  ExportSkills({ }: StateContext<OrganizationManagementStateModel>, { payload }: ExportSkills): Observable<any> {
    return this.skillsService.exportAssignedSkills(payload).pipe(tap(file => {
      const url = window.URL.createObjectURL(file);
      saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
    }));
  };

  @Action(GetSkillDataSources)
  GetSkillDataSources({ patchState }: StateContext<OrganizationManagementStateModel>, { }: GetSkillDataSources): Observable<SkillDataSource> {
    return this.skillsService.getSkillsDataSources().pipe(tap(dataSource => {
      patchState({ skillDataSource: dataSource });
      return dataSource;
    }));
  };

  @Action(GetAllOrganizationSkills)
  GetAllOrganizationSkills({ patchState }: StateContext<OrganizationManagementStateModel>, { }: GetAllOrganizationSkills): Observable<SkillsPage> {
    return this.skillsService.getAllOrganizationSkills().pipe(tap(skills => {
      patchState({ allOrganizationSkills: skills });
      return skills;
    }));
  };
}
