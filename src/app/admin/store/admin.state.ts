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
  GetBusinessUnitList,
  GetDepartmentsByLocationId,
  GetLocationsByOrganizationId,
  GetRegionsByOrganizationId,
  SetBillingStatesByCountry,
  GetOrganizationsByPage,
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
  GetLocationsByRegionId,
  UpdateLocation,
  DeleteLocationById,
  SaveLocation,
  SaveRegion,
  UpdateRegion,
  DeleteRegionById
} from './admin.actions';
import { DepartmentsService } from '../services/departments.service';
import { Department } from '../../shared/models/department.model';
import { Region } from '../../shared/models/region.model';
import { Location } from '../../shared/models/location.model';
import { RegionService } from '../services/region.service';
import { LocationService } from '../services/location.service';
import { GeneralPhoneTypes } from '../../shared/constants/general-phone-types';

interface DropdownOption {
  id: number;
  text: string;
}

const StringIsNumber = (value: any) => isNaN(Number(value)) === true; // TODO: move to utils

export interface AdminStateModel {
  countries: DropdownOption[];
  statesGeneral: string[] | null;
  statesBilling: string[] | null;
  phoneTypes: string[] | null;
  businessUnits: BusinessUnit[];
  days: DropdownOption[];
  statuses: DropdownOption[];
  titles: string[];
  isOrganizationLoading: boolean;
  organizations: OrganizationPage | null;
  isDepartmentLoading: boolean;
  isLocationLoading: boolean;
  departments: Department[];
  regions: Region[];
  locations: Location[];
  location: Location | null;
  organization: Organization | null;
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
    days: Days,
    statuses: Object.keys(Status).filter(StringIsNumber).map((statusName, index) => ({ id: index, text: statusName })),
    titles: Titles,
    isOrganizationLoading: false,
    organizations: null,
    organization: null,
    isDepartmentLoading: false,
    isLocationLoading: false,
    departments: [],
    regions: [],
    locations: [],
    location: null,
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
  static organizations(state: AdminStateModel): OrganizationPage | null { return state.organizations; }

  @Selector()
  static organizationById(state: AdminStateModel): Organization | null { return state.organization; }

  constructor(
    private organizationService: OrganizationService,
    private departmentService: DepartmentsService,
    private regionService: RegionService,
    private locationService: LocationService
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
      patchState({ isOrganizationLoading: false });
      dispatch(new GetOrganizationByIdSucceeded(payload));
      return payload;
    }));
  }

  @Action(SaveOrganization)
  SaveOrganization({ patchState, dispatch }: StateContext<AdminStateModel>, { payload }: SaveOrganization): Observable<Organization> {
    patchState({ isOrganizationLoading: true });
    return this.organizationService.saveOrganization(payload).pipe(tap((payload) => {
      patchState({ isOrganizationLoading: false });
      dispatch(new SaveOrganizationSucceeded(payload));
      return payload;
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
  DeleteDepartmentById({ patchState, dispatch }: StateContext<AdminStateModel>, { department }: DeleteDepartmentById): Observable<void> {
    return this.departmentService.deleteDepartmentById(department.departmentId).pipe(tap((payload) => {
      patchState({ isDepartmentLoading: false });
      dispatch(new GetDepartmentsByLocationId(department.locationId));
      return payload;
    }));
  }

  @Action(GetRegionsByOrganizationId)
  GetRegionsByOrganizationId({ patchState }: StateContext<AdminStateModel>, { organizationId }: GetRegionsByOrganizationId): Observable<Region[]> {
    return this.regionService.getRegionsByOrganizationId(organizationId).pipe(tap((payload) => {
      patchState({ regions: payload});
      return payload;
    }));
  }

  @Action(SaveRegion)
  SaveRegion({ patchState, dispatch }: StateContext<AdminStateModel>, { region }: SaveRegion): Observable<Region> {
    patchState({ isLocationLoading: true });
    return this.regionService.saveRegion(region).pipe(tap((payload) => {
      patchState({ isLocationLoading: false});
      dispatch(new GetRegionsByOrganizationId(region.organizationId));
      return payload;
    }));
  }

  @Action(UpdateRegion)
  UpdateRegion({ patchState, dispatch }: StateContext<AdminStateModel>, { region }: UpdateRegion): Observable<void> {
    return this.regionService.updateRegion(region).pipe(tap((payload) => {
      patchState({ isLocationLoading: false });
      dispatch(new GetRegionsByOrganizationId(region.organizationId));
      return payload;
    }));
  }

  @Action(DeleteRegionById)
  DeleteRegionById({ patchState, dispatch }: StateContext<AdminStateModel>, { regionId, organizationId }: DeleteRegionById): Observable<void> {
    return this.regionService.deleteRegionById(regionId).pipe(tap((payload) => {
      patchState({ isLocationLoading: false });
      dispatch(new GetRegionsByOrganizationId(organizationId));
      return payload;
    }));
  }

  @Action(GetLocationsByOrganizationId)
  GetLocationsByOrganizationId({ patchState }: StateContext<AdminStateModel>, { organizationId }: GetLocationsByOrganizationId): Observable<Location[]> {
    return this.locationService.getLocationsByOrganizationId(organizationId).pipe(tap((payload) => {
      patchState({ locations: payload});
      return payload;
    }));
  }

  @Action(GetLocationsByRegionId)
  GetLocationsByRegionId({ patchState }: StateContext<AdminStateModel>, { regionId }: GetLocationsByRegionId): Observable<Location[]> {
    return this.locationService.getLocationsByRegionId(regionId).pipe(tap((payload) => {
      patchState({ locations: payload});
      return payload;
    }));
  }

  @Action(GetLocationById)
  GetLocationById({ patchState }: StateContext<AdminStateModel>, { locationId }: GetLocationById): Observable<Location> {
    return this.locationService.getLocationById(locationId).pipe(tap((payload) => {
      patchState({ location: payload});
      return payload;
    }));
  }

  @Action(SaveLocation)
  SaveLocation({ patchState, dispatch }: StateContext<AdminStateModel>, { location, regionId }: SaveLocation): Observable<Location> {
    patchState({ isLocationLoading: true });
    return this.locationService.saveLocation(location).pipe(tap((payload) => {
      patchState({ isLocationLoading: false});
      dispatch(new GetLocationsByRegionId(regionId));
      return payload;
    }));
  }

  @Action(UpdateLocation)
  UpdateLocation({ patchState, dispatch }: StateContext<AdminStateModel>, { location, regionId }: UpdateLocation): Observable<void> {
    return this.locationService.updateLocation(location).pipe(tap((payload) => {
      patchState({ isLocationLoading: false });
      dispatch(new GetLocationsByRegionId(regionId));
      return payload;
    }));
  }

  @Action(DeleteLocationById)
  DeleteLocationById({ patchState, dispatch }: StateContext<AdminStateModel>, { locationId, regionId }: DeleteLocationById): Observable<void> {
    return this.locationService.deleteLocationById(locationId).pipe(tap((payload) => {
      patchState({ isLocationLoading: false });
      dispatch(new GetLocationsByRegionId(regionId));
      return payload;
    }));
  }
}
