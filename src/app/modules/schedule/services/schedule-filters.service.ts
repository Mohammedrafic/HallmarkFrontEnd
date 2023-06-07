import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable, Subject } from 'rxjs';

import { BaseObservable } from '@core/helpers';
import { DropdownOption } from '@core/interface';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import {
  OrganizationDepartment,
  OrganizationLocation,
  OrganizationRegion,
  OrganizationStructure,
} from '@shared/models/organization.model';
import { ChipDeleteEventType, ChipItem } from '@shared/components/inline-chips';
import { InitEmployeeOrganizationStructure, InitScheduleFiltersData } from '../constants';
import { ScheduleFilterHelper } from '../helpers';
import {
  ChipsInitialState,
  DepartmentChipsStructureState,
  LocationChipsStructureState,
  RegionChipsStructureState,
  ScheduleFilterItem,
  ScheduleFilters,
  ScheduleFiltersConfig,
  ScheduleFiltersData,
  ScheduleFilterStructure,
} from '../interface';

@Injectable()
export class ScheduleFiltersService {
  deletedInlineChip: Subject<ChipDeleteEventType> = new Subject();

  private readonly scheduleFiltersData: BaseObservable<ScheduleFiltersData> = new BaseObservable(InitScheduleFiltersData);
  private readonly schedulePreservedFiltersData: BaseObservable<ScheduleFilters | null>
    = new BaseObservable<ScheduleFilters | null>(null);
  private readonly employeeOrganizationStructure: BaseObservable<OrganizationStructure>
    = new BaseObservable(InitEmployeeOrganizationStructure);

  constructor(private readonly fb: FormBuilder) {}

  createScheduleFilterForm(): FormGroup {
    return this.fb.group({
      regionIds: ['', Validators.required],
      locationIds: ['', Validators.required],
      departmentsIds: [],
      skillIds: [],
      isAvailablity : [false],
      isUnavailablity : [false],
      isOnlySchedulatedCandidate : [false],
      ShowGeneralnotes : [false],
      isExcludeNotOrganized : [false],
      startTime : [null],
      endTime : [null]
    });
  }

  createFilterStructure(orgRegions: OrganizationRegion[]): ScheduleFilterStructure {
    const structure: ScheduleFilterStructure = {
      regions: orgRegions,
      locations: [],
      departments: [],
    };

    structure.locations = orgRegions.flatMap((region) => region.locations as OrganizationLocation[]);
    structure.departments = structure.locations.flatMap((location) => location.departments as OrganizationDepartment[]);

    return structure;
  }

  getSelectedLocatinOptions(structure: ScheduleFilterStructure, selectedIds: number[]): DropdownOption[] {
    const selectedRegions: OrganizationRegion[] = structure.regions
    .filter((region) => selectedIds.includes(region.id as number));
    const locations = selectedRegions.flatMap((region) => region.locations as OrganizationLocation[]);

    return ScheduleFilterHelper.adaptLocationToOption(sortByField(locations, 'name'));
  }

  getSelectedDepartmentOptions(structure: ScheduleFilterStructure, selectedIds: number[], sort = true): DropdownOption[] {
    const selectedLocations = structure.locations
    .filter((location) => selectedIds.includes(location.id));
    const departments = selectedLocations.flatMap((location) => location.departments as OrganizationDepartment[]);

    return ScheduleFilterHelper.adaptDepartmentToOption(sort ? sortByField(departments, 'name') : departments);
  }

  createChipsData(
    formValue: Record<string, number[] | number | string | boolean>, filterConfig: ScheduleFiltersConfig): ChipItem[] {
    return Object.keys(filterConfig).filter((key) => {
      if (Array.isArray(formValue[key])) {
        return !!(formValue[key] as number[]).length;
      }

      return !!formValue[key];
    })
    .map((key) => {
      const configItem = filterConfig[key as keyof ScheduleFiltersConfig];
      return ({
        groupField: key,
        groupTitle: configItem.filterTitle,
        data: this.createChipValue(formValue[key], configItem),
      });
    });
  }

  deleteInlineChip(event: ChipDeleteEventType): void {
    this.deletedInlineChip.next(event);
  }

  getDeleteInlineChipStream(): Observable<ChipDeleteEventType> {
    return this.deletedInlineChip.asObservable();
  }

  getScheduleFiltersData(): ScheduleFiltersData {
    return this.scheduleFiltersData.get();
  }

  setScheduleFiltersData(scheduleFiltersData: ScheduleFiltersData): void {
    this.scheduleFiltersData.set(scheduleFiltersData);
  }

  getEmployeeOrganizationStructure(): OrganizationStructure {
    return this.employeeOrganizationStructure.get();
  }

  getEmployeeOrganizationStructureStream(): Observable<OrganizationStructure> {
    return this.employeeOrganizationStructure.getStream();
  }

  setEmployeeOrganizationStructure(employeeOrganizationStructure: OrganizationStructure): void {
    this.employeeOrganizationStructure.set(employeeOrganizationStructure);
  }

  setPreservedFiltersDataStream(scheduleFiltersData: ScheduleFilters): void {
    this.schedulePreservedFiltersData.set(scheduleFiltersData);
  }

  getPreservedFiltersDataStream(): Observable<ScheduleFilters | null> {
    return this.schedulePreservedFiltersData.getStream();
  }

  getSelectedSkillFilterColumns(sources: DropdownOption[], preservedSkills: number[]): number[] {
    return sources.filter((skill: DropdownOption) => {
      return preservedSkills.includes(Number(skill.value));
    }).map((skill: DropdownOption) => {
      return Number(skill.value);
    });
  }

  getRegionChipsStructureState(
    filterStructure: ScheduleFilterStructure,
    state: ChipsInitialState,
    regionIds: number[],
    name: string,
  ): RegionChipsStructureState {
    const structureState: RegionChipsStructureState = {
      regionIds: [],
      regions: [],
    };

    structureState.regionIds = filterStructure.regions?.filter((region: OrganizationRegion) => {
      return regionIds.includes(region.id as number) && region.name !== name;
    }).map((region: OrganizationRegion) => {
      structureState.regions = [...state.regions,...structureState.regions,...region.locations as OrganizationLocation[]];
      return Number(region.id);
    });

    return structureState;
  }

  getRegionInitialChipsStructure(regions: OrganizationRegion[]): OrganizationLocation[] {
    return regions?.map(regions => {
      return regions.locations as OrganizationLocation[];
    }).flat();
  }

  getLocationChipsStructureState(
    filterStructure: ScheduleFilterStructure,
    state: ChipsInitialState,
    locationIds: number[],
    name: string,
  ): LocationChipsStructureState {
    const structureState: LocationChipsStructureState = {
      locationIds: [],
      locations: [],
    };

    structureState.locationIds = state.regions?.filter((location: OrganizationLocation) => {
      return locationIds.includes(location.id) && location.name !== name;
    }).map((location: OrganizationLocation) => {
      structureState.locations = [...state.locations,...structureState.locations,...location.departments];
      return Number(location.id);
    });

    return structureState;
  }

  getLocationInitialChipsStructure(regionLocations: OrganizationLocation[]): OrganizationDepartment[] {
    return regionLocations?.map((locations: OrganizationLocation) => locations.departments).flat();
  }

  getDepartmentChipsStructureState(
    filterStructure: ScheduleFilterStructure,
    state: ChipsInitialState,
    departmentsIds: number[],
    name: string,
  ): DepartmentChipsStructureState {
    const structureState: DepartmentChipsStructureState = {
      departmentIds: [],
      departments: [],
    };

    structureState.departmentIds = state.locations?.filter((departments: OrganizationDepartment) => {
      return departmentsIds.includes(departments.id) && departments.name !== name;
    }).map((departments: OrganizationDepartment) => {
      structureState.departments.push(departments);
      return Number(departments.id);
    });

    return structureState;
  }

  getDepartmentInitialChipsStructure(locationDepartments: OrganizationDepartment[]): OrganizationDepartment[] {
    return locationDepartments?.map((departments: OrganizationDepartment) => departments);
  }

  getSkillsChipsStructure(
    skills: DropdownOption[],
    skillIds: number[],
    name: string,
  ): number[] {
    return skills?.filter((skills: DropdownOption) => {
      return skillIds.includes(skills.value as number) && skills.text !== name;
    }).map((skills: DropdownOption) => Number(skills.value));
  }

  private createChipValue(formValue: number[] | number | string | boolean, configIem: ScheduleFilterItem): string[] {
    if (Array.isArray(formValue)) {
      return configIem.dataSource.filter((source) => formValue.includes(source.value as number)).map((data) => data.text);
    }

    if (typeof formValue === 'boolean') {
      return [formValue ? 'Yes' : 'No'];
    }

    if (typeof formValue === 'number') {
      return [formValue.toString()];
    }

    return [formValue];
  }
}
