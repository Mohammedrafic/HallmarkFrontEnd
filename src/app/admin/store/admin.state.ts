import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { catchError, Observable, of, tap } from 'rxjs';
import { Days } from 'src/app/shared/enums/days';
import { SendDocumentAgency } from 'src/app/shared/enums/send-document-agency';
import { Country, UsaStates, CanadaStates } from 'src/app/shared/enums/states';
import { Status } from 'src/app/shared/enums/status';
import { BusinessUnit } from 'src/app/shared/models/business-unit.model';
import { Organization, OrganizationPage } from 'src/app/shared/models/organization.model';
import { OrganizationService } from '@shared/services/organization.service';

import {
  GetBusinessUnitList,
  SetBillingStatesByCountry,
  GetOrganizationsByPage,
  SetDirtyState,
  SaveOrganization,
  UploadOrganizationLogo,
  SaveOrganizationSucceeded,
  GetOrganizationById,
  GetOrganizationByIdSucceeded,
  SetGeneralStatesByCountry,
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
  GetOrganizationLogo,
  GetOrganizationLogoSucceeded,
  GetAllSkills,
  GetCredentialTypes,
  SaveCredentialType,
  UpdateCredentialType,
  RemoveCredentialType,
  ExportSkills,
  ExportSkillCategories,
  RemoveOrganizationLogo
} from './admin.actions';
import { GeneralPhoneTypes } from '@shared/constants/general-phone-types';
import { SkillsService } from '@shared/services/skills.service';
import { CategoriesService } from '@shared/services/categories.service';
import { Skill, SkillsPage } from 'src/app/shared/models/skill.model';
import { SkillCategoriesPage, SkillCategory } from 'src/app/shared/models/skill-category.model';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from 'src/app/shared/enums/message-types';
import { RECORD_ADDED, RECORD_MODIFIED } from 'src/app/shared/constants/messages';
import { OrganizationManagementStateModel } from '../../organization-management/store/organization-management.state';
import { CredentialType } from '@shared/models/credential-type.model';
import { CredentialsService } from '@shared/services/credentials.service';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';

interface DropdownOption {
  id: number;
  text: string;
}

const StringIsNumber = (value: any) => isNaN(Number(value)) === true; // TODO: move to utils

// TODO: separate states (skills, creds etc)
export interface AdminStateModel {
  countries: DropdownOption[];
  statesGeneral: string[] | null;
  statesBilling: string[] | null;
  phoneTypes: string[] | null;
  businessUnits: BusinessUnit[];
  sendDocumentAgencies: DropdownOption[];
  days: DropdownOption[];
  statuses: DropdownOption[];
  isOrganizationLoading: boolean;
  organizations: OrganizationPage | null;
  isDepartmentLoading: boolean;
  isLocationLoading: boolean;
  organization: Organization | null;
  masterSkills: SkillsPage | null;
  skills: SkillsPage | null;
  skillsCategories: SkillCategoriesPage | null;
  allSkillsCategories: SkillCategoriesPage | null;
  credentialTypes: CredentialType[];
  isDirty: boolean;
}

@State<AdminStateModel>({
  name: 'admin',
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
    organizations: null,
    organization: null,
    isDepartmentLoading: false,
    isLocationLoading: false,
    masterSkills: null,
    skills: null,
    skillsCategories: null,
    allSkillsCategories: null,
    credentialTypes: [],
    isDirty: false
  },
})
@Injectable()
export class AdminState {
  @Selector()
  static countries(state: AdminStateModel): DropdownOption[] { return state.countries; }

  @Selector()
  static statesGeneral(state: AdminStateModel): string[] | null { return state.statesGeneral; }

  @Selector()
  static phoneTypes(state: AdminStateModel): string[] | null { return state.phoneTypes; }

  @Selector()
  static statesBilling(state: AdminStateModel): string[] | null { return state.statesBilling; }

  @Selector()
  static businessUnits(state: AdminStateModel): BusinessUnit[] { return state.businessUnits; }

  @Selector()
  static sendDocumentAgencies(state: AdminStateModel): DropdownOption[] { return state.sendDocumentAgencies; }

  @Selector()
  static days(state: AdminStateModel): DropdownOption[] { return state.days; }

  @Selector()
  static statuses(state: AdminStateModel): DropdownOption[] { return state.statuses; }

  @Selector()
  static isDirty(state: AdminStateModel): boolean { return state.isDirty; }

  @Selector()
  static organizations(state: AdminStateModel): OrganizationPage | null { return state.organizations; }

  @Selector()
  static organization(state: AdminStateModel): Organization | null { return state.organization; }

  @Selector()
  static masterSkills(state: AdminStateModel): SkillsPage | null { return state.masterSkills; }

  @Selector()
  static skills(state: AdminStateModel): SkillsPage | null { return state.skills; }

  @Selector()
  static skillsCategories(state: AdminStateModel): SkillCategoriesPage | null { return state.skillsCategories; }

  @Selector()
  static allSkillsCategories(state: AdminStateModel): SkillCategoriesPage | null { return state.allSkillsCategories; }

  @Selector()
  static credentialTypes(state: OrganizationManagementStateModel): CredentialType[] { return state.credentialTypes; }

  constructor(
    private organizationService: OrganizationService,
    private skillsService: SkillsService,
    private categoriesService: CategoriesService,
    private credentialsService: CredentialsService
  ) { }

  @Action(SetGeneralStatesByCountry)
  SetGeneralStatesByCountry({ patchState }: StateContext<AdminStateModel>, { payload }: SetGeneralStatesByCountry): void {
    patchState({ statesGeneral: payload === Country.USA ? UsaStates : CanadaStates });
  }

  @Action(SetBillingStatesByCountry)
  SetBillingStatesByCountry({ patchState }: StateContext<AdminStateModel>, { payload }: SetBillingStatesByCountry): void {
    patchState({ statesBilling: payload === Country.USA ? UsaStates : CanadaStates });
  }

  @Action(GetOrganizationsByPage)
  GetOrganizationsByPage({ patchState }: StateContext<AdminStateModel>, { pageNumber, pageSize }: GetOrganizationsByPage): Observable<OrganizationPage> {
    patchState({ isOrganizationLoading: true });
    return this.organizationService.getOrganizations(pageNumber, pageSize).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false, organizations: payload });
      return payload;
    }));
  }

  @Action(GetOrganizationById)
  GetOrganizationById({ patchState, dispatch }: StateContext<AdminStateModel>, { payload }: GetOrganizationById): Observable<Organization> {
    patchState({ isOrganizationLoading: true });
    return this.organizationService.getOrganizationById(payload).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false, organization: payload });
      dispatch(new GetOrganizationByIdSucceeded(payload));
      return payload;
    }));
  }

  @Action(SaveOrganization)
  SaveOrganization({ patchState, dispatch }: StateContext<AdminStateModel>, { payload }: SaveOrganization): Observable<Organization> {
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
  UploadOrganizationLogo({ patchState }: StateContext<AdminStateModel>, { file, businessUnitId }: UploadOrganizationLogo): Observable<any> {
    patchState({ isOrganizationLoading: true });
    return this.organizationService.saveOrganizationLogo(file, businessUnitId).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false });
      return payload;
    }));
  }

  @Action(GetOrganizationLogo)
  GetOrganizationLogo({ dispatch }: StateContext<AdminStateModel>, { payload }: GetOrganizationLogo): Observable<any> {
    return this.organizationService.getOrganizationLogo(payload).pipe(tap((payload) => {
      dispatch(new GetOrganizationLogoSucceeded(payload));
      return payload;
    }));
  }

  @Action(RemoveOrganizationLogo)
  RemoveOrganizationLogo({ dispatch }: StateContext<AdminStateModel>, { payload }: RemoveOrganizationLogo): Observable<any> {
    return this.organizationService.removeOrganizationLogo(payload).pipe(
      tap((payload) => payload),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'Logo cannot be deleted'))))
    );
  }

  @Action(GetBusinessUnitList)
  GetBusinessUnitList({ patchState }: StateContext<AdminStateModel>, { }: GetBusinessUnitList): Observable<BusinessUnit[]> {
    return this.organizationService.getBusinessUnit().pipe(tap((payload) => {
      patchState({ businessUnits: payload});
      return payload;
    }));
  }

  @Action(SetDirtyState)
  SetDirtyState({ patchState }: StateContext<AdminStateModel>, { payload }: SetDirtyState): void {
    patchState({ isDirty: payload });
  }

  @Action(GetMasterSkillsByPage)
  GetMasterSkillsByPage({ patchState }: StateContext<AdminStateModel>, { pageNumber, pageSize }: GetMasterSkillsByPage): Observable<SkillsPage> {
    patchState({ isOrganizationLoading: true });
    return this.skillsService.getMasterSkills(pageNumber, pageSize).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false, masterSkills: payload });
      return payload;
    }));
  }

  @Action(GetAllSkillsCategories)
  GetAllSkillsCategories({ patchState }: StateContext<AdminStateModel>, { }: GetAllSkillsCategories): Observable<SkillCategoriesPage> {
    return this.categoriesService.getAllSkillsCategories().pipe(tap((payload) => {
      patchState({ allSkillsCategories: payload });
      return payload;
    }));
  }

  @Action(GetSkillsCategoriesByPage)
  GetSkillsCategoriesByPage({ patchState }: StateContext<AdminStateModel>, { pageNumber, pageSize }: GetSkillsCategoriesByPage): Observable<SkillCategoriesPage> {
    patchState({ isOrganizationLoading: true });
    return this.categoriesService.getSkillsCategories(pageNumber, pageSize).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false, skillsCategories: payload });
      return payload;
    }));
  }

  @Action(SaveSkillsCategory)
  SaveSkillsCategory({ patchState, dispatch }: StateContext<AdminStateModel>, { payload }: SaveSkillsCategory): Observable<SkillCategory> {
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
  RemoveSkillsCategory({ patchState, dispatch }: StateContext<AdminStateModel>, { payload }: RemoveSkillsCategory): Observable<any> {
    patchState({ isOrganizationLoading: true });
    return this.categoriesService.removeSkillCategory(payload).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false });
      dispatch(new RemoveSkillsCategorySucceeded);
      return payload;
    }),
    catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))));
  }

  @Action(SaveMasterSkill)
  SaveMasterSkill({ patchState, dispatch }: StateContext<AdminStateModel>, { payload }: SaveMasterSkill): Observable<Skill> {
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
  RemoveMasterSkill({ patchState, dispatch }: StateContext<AdminStateModel>, { payload }: RemoveMasterSkill): Observable<any> {
    patchState({ isOrganizationLoading: true });
    return this.skillsService.removeMasterSkill(payload).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false });
      dispatch(new RemoveMasterSkillSucceeded);
      return payload;
    }),
    catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, error.error.detail)))));
  }

  @Action(GetAllSkills)
  GetAllSkills({ patchState }: StateContext<AdminStateModel>, { }: GetAllSkills): Observable<SkillsPage> {
    return this.skillsService.getAllMasterSkills().pipe(
      tap((payload) => {
        patchState({ skills: payload });
        return payload;
      })
    );
  }

  @Action(GetCredentialTypes)
  GetCredentialTypes({ patchState }: StateContext<AdminStateModel>, { }: GetCredentialTypes): Observable<CredentialType[]> {
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

  @Action(ExportSkills)
  ExportSkills({ }: StateContext<AdminStateModel>, { payload }: ExportSkills): Observable<any> {
    return this.skillsService.export(payload).pipe(tap(file => {
      const url = window.URL.createObjectURL(file);
      saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
    }));
  };

  @Action(ExportSkillCategories)
  ExportSkillCategories({ }: StateContext<AdminStateModel>, { payload }: ExportSkillCategories): Observable<any> {
    return this.categoriesService.export(payload).pipe(tap(file => {
      const url = window.URL.createObjectURL(file);
      saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
    }));
  };
}
