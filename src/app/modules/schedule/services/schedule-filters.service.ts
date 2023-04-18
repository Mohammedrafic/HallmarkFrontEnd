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
