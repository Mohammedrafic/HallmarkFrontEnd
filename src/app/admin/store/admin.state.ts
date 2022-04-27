import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { Days } from 'src/app/shared/enums/days';
import { Country, UsaStates, CanadaStates } from 'src/app/shared/enums/states';
import { Status } from 'src/app/shared/enums/status';
import { Titles } from 'src/app/shared/enums/title';
import { BusinessUnit } from 'src/app/shared/models/business-unit.model';
import { Organization, OrganizationPage } from 'src/app/shared/models/organization.model';
import { OrganizationService } from '../services/organization.service';

import {
  SaveDepartment,
  CreateOrganization,
  GetBusinessUnitList,
  GetDepartmentsByLocationId,
  GetLocationsByOrganizationId,
  GetRegionsByOrganizationId,
  SetBillingStatesByCountry,
  GetOrganizationsByPage,
  SetDirtyState,
  SetGeneralStatesByCountry,
  SetSuccessErrorToastState,
  UpdateDepartment,
  DeleteDepartmentById,
  GetLocationById,
  GetLocationsByRegionId
} from './admin.actions';
import { DepartmentsService } from '../services/departments.service';
import { Department } from '../../shared/models/department.model';
import { Region } from '../../shared/models/region.model';
import { Location } from '../../shared/models/location.model';
import { SuccessErrorToast } from '../../shared/models/success-error-toast.model';

interface DropdownOption {
  id: number;
  text: string;
}

const StringIsNumber = (value: any) => isNaN(Number(value)) === true; // TODO: move to utils

export interface AdminStateModel {
  countries: DropdownOption[];
  statesGeneral: string[] | null;
  statesBilling: string[] | null;
  businessUnits: BusinessUnit[];
  days: DropdownOption[];
  statuses: DropdownOption[];
  titles: string[];
  isOrganizationLoading: boolean;
  organizations: OrganizationPage | null;
  isDepartmentLoading: boolean;
  departments: Department[];
  regions: Region[];
  locations: Location[];
  location: Location | null;
  successErrorToastState: SuccessErrorToast | null;
  isDirty: boolean;
}

@State<AdminStateModel>({
  name: 'admin',
  defaults: {
    countries: [{ id: Country.USA, text: Country[0] }, { id: Country.Canada, text: Country[1] }],
    statesGeneral: null,
    statesBilling: null,
    businessUnits: [],
    days: Days,
    statuses: Object.keys(Status).filter(StringIsNumber).map((statusName, index) => ({ id: index, text: statusName })),
    titles: Titles,
    isOrganizationLoading: false,
    organizations: null,
    isDepartmentLoading: false,
    departments: [],
    regions: [],
    locations: [],
    location: null,
    successErrorToastState: null,
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
  static statesBilling(state: AdminStateModel): string[] | null { return state.statesBilling; }

  @Selector()
  static businessUnits(state: AdminStateModel): BusinessUnit[] { return state.businessUnits; }

  @Selector()
  static days(state: AdminStateModel): DropdownOption[] { return state.days; }

  @Selector()
  static statuses(state: AdminStateModel): DropdownOption[] { return state.statuses; }

  @Selector()
  static titles(state: AdminStateModel): string[] { return state.titles; }

  @Selector()
  static isDirty(state: AdminStateModel): boolean { return state.isDirty; }

  @Selector()
  static departments(state: AdminStateModel): Department[] { return state.departments; }

  @Selector()
  static regions(state: AdminStateModel): Region[] { return state.regions; }

  @Selector()
  static locationsByRegionId(state: AdminStateModel): Location[] { return state.locations; }

  @Selector()
  static locationById(state: AdminStateModel): Location | null { return state.location; }

  @Selector()
  static successErrorToastState(state: AdminStateModel): SuccessErrorToast | null { return state.successErrorToastState; }

  @Selector()
  static organizations(state: AdminStateModel): OrganizationPage | null { return state.organizations; }

  constructor(
    private organizationService: OrganizationService,
    private departmentService: DepartmentsService,
  ) { }

  @Action(SetGeneralStatesByCountry)
  SetGeneralStatesByCountry({ patchState }: StateContext<AdminStateModel>, { payload }: SetGeneralStatesByCountry): void {
    patchState({ statesGeneral: payload === Country[Country.USA] ? UsaStates : CanadaStates });
  }

  @Action(SetBillingStatesByCountry)
  SetBillingStatesByCountry({ patchState }: StateContext<AdminStateModel>, { payload }: SetBillingStatesByCountry): void {
    patchState({ statesBilling: payload === Country[Country.USA] ? UsaStates : CanadaStates });
  }

  @Action(GetOrganizationsByPage)
  GetOrganizationsByPage({ patchState }: StateContext<AdminStateModel>, { pageNumber, pageSize }: GetOrganizationsByPage): Observable<OrganizationPage> {
    patchState({ isOrganizationLoading: true });
    return this.organizationService.getOrganizations(pageNumber, pageSize).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false, organizations: payload });
      return payload;
    }));
  }

  @Action(CreateOrganization)
  CreateOrganization({ patchState }: StateContext<AdminStateModel>, { payload }: CreateOrganization): Observable<Organization> {
    patchState({ isOrganizationLoading: true });
    return this.organizationService.saveOrganization(payload).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false });
      return payload;
    }));
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

  @Action(SaveDepartment)
  SaveDepartment({ patchState, dispatch }: StateContext<AdminStateModel>, { payload }: SaveDepartment): Observable<Department> {
    patchState({ isDepartmentLoading: true });
    return this.departmentService.saveDepartment(payload).pipe(tap((payload) => {
      patchState({ isDepartmentLoading: false});
      dispatch(new GetDepartmentsByLocationId(payload.locationId));
      return payload;
    }));
  }

  @Action(GetDepartmentsByLocationId)
  GetDepartmentsByLocationId({ patchState }: StateContext<AdminStateModel>, { locationId }: GetDepartmentsByLocationId): Observable<Department[]> {
    return this.departmentService.getDepartmentsByLocationId(locationId).pipe(tap((payload) => {
      patchState({ departments: payload});
      return payload;
    }));
  }

  @Action(UpdateDepartment)
  UpdateDepartments({ patchState, dispatch }: StateContext<AdminStateModel>, { department }: UpdateDepartment): Observable<void> {
    return this.departmentService.updateDepartment(department).pipe(tap((payload) => {
      patchState({ isDepartmentLoading: false });
      dispatch(new GetDepartmentsByLocationId(department.locationId));
      return payload;
    }));
  }

  @Action(DeleteDepartmentById)
  DeleteDepartmentById({ patchState }: StateContext<AdminStateModel>, { departmentId }: DeleteDepartmentById): void {
    this.departmentService.deleteDepartmentById(departmentId).pipe(tap(() => {
      patchState({ isDepartmentLoading: false });
    }));
  }

  @Action(GetRegionsByOrganizationId)
  GetRegionsByOrganizationId({ patchState }: StateContext<AdminStateModel>, { organizationId }: GetRegionsByOrganizationId): Observable<Region[]> {
    return this.departmentService.getRegionsByOragnizationId(organizationId).pipe(tap((payload) => {
      patchState({ regions: payload});
      return payload;
    }));
  }

  @Action(GetLocationsByOrganizationId)
  GetLocationsByOrganizationId({ patchState }: StateContext<AdminStateModel>, { organizationId }: GetLocationsByOrganizationId): Observable<Location[]> {
    return this.departmentService.getLocationsByOrganizationId(organizationId).pipe(tap((payload) => {
      patchState({ locations: payload});
      return payload;
    }));
  }

  @Action(GetLocationsByRegionId)
  GetLocationsByRegionId({ patchState }: StateContext<AdminStateModel>, { regionId }: GetLocationsByRegionId): Observable<Location[]> {
    return this.departmentService.getLocationsByRegionId(regionId).pipe(tap((payload) => {
      patchState({ locations: payload});
      return payload;
    }));
  }

  @Action(GetLocationById)
  GetLocationById({ patchState }: StateContext<AdminStateModel>, { locationId }: GetLocationById): Observable<Location> {
    return this.departmentService.getLocationById(locationId).pipe(tap((payload) => {
      patchState({ location: payload});
      return payload;
    }));
  }

  @Action(SetSuccessErrorToastState)
  SetSuccessErrorToastState({ patchState }: StateContext<AdminStateModel>, { payload }: SetSuccessErrorToastState): void {
    patchState({ successErrorToastState: payload });
  }
}
