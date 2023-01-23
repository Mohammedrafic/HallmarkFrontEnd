import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { filter, Observable, take } from 'rxjs';

import { CustomFormGroup } from '@core/interface';
import { BaseObservable } from '@core/helpers';
import {
  Holiday,
  HolidaysPage,
  MasterCommitmentNames,
  Option,
  WorkCommitmentForm,
  WorkCommitmentGrid,
} from '../interfaces';
import { WorkCommitmentDialogApiService } from './work-commitment-dialog-api.service';

import { OrganizationRegion } from '@shared/models/organization.model';
import { AssignedSkillsByOrganization } from '@shared/models/skill.model';
import { mapDataSource } from '../helpers';
import { convertHolidaysToDataSource } from '@shared/helpers/dropdown-options.helper';

@Injectable()
export class WorkCommitmentService {
  public masterCommitmentNames: BaseObservable<Option[]> = new BaseObservable<Option[]>(null as unknown as Option[]);
  public regionsStructure: BaseObservable<OrganizationRegion[]> = new BaseObservable<OrganizationRegion[]>(
    null as unknown as OrganizationRegion[]
  );
  public holidays: BaseObservable<any> = new BaseObservable<any>(null as unknown as any);
  public skills: BaseObservable<Option[]> = new BaseObservable<Option[]>(null as unknown as Option[]);

  constructor(private formBuilder: FormBuilder, private commitmentDialogApi: WorkCommitmentDialogApiService) {}

  public createCommitmentForm(): CustomFormGroup<WorkCommitmentForm> {
    return this.formBuilder.group({
      masterWorkCommitmentId: [null, Validators.required],
      regions: [null, Validators.required],
      locations: [null, Validators.required],
      skillIds: [null, Validators.required],
      availabilityRequirement: [null],
      schedulePeriod: [null],
      minimumWorkExperience: [null],
      criticalOrder: [null],
      holiday: [null],
      jobCode: [null, Validators.required],
      comments: [null],
      workCommitmentId: null,
    }) as CustomFormGroup<WorkCommitmentForm>;
  }

  public getAllDataSource(): void {
    this.getNamesDropdown();
    this.getHolidaysDropdown();
    this.getSkillsDropdown();
  }

  public mapStructureForForms(commitment: WorkCommitmentGrid): WorkCommitmentForm {
    let allSkills = null;

    if (commitment.skillIds[0] === 0) {
      allSkills = this.skills.get().map((item) => item.id);
    }
    return {
      ...commitment,
      regions: commitment.regionIds,
      locations: commitment.locationIds,
      skillIds: allSkills ?? commitment.skillIds,
    };
  }

  private getNamesDropdown(): void {
    this.commitmentDialogApi
      .getMasterCommitmentNames()
      .pipe(filter(Boolean), take(1))
      .subscribe((names) => {
        const correctItems: Option[] = names.items.map((item: MasterCommitmentNames) => ({
          name: item.name,
          id: item.id,
        }));
        this.masterCommitmentNames.set(mapDataSource(names.items, 'name', 'id'));
      });
  }

  private getSkillsDropdown(): void {
    this.commitmentDialogApi
      .getAllSkills()
      .pipe(filter(Boolean), take(1))
      .subscribe((skills: AssignedSkillsByOrganization[]) => {
        const correctItems = skills.filter((skill) => skill.includeInIRP);
        this.skills.set(mapDataSource(correctItems, 'skillDescription', 'masterSkillId'));
      });
  }

  private getHolidaysDropdown(): void {
    this.commitmentDialogApi
      .getHolidays()
      .pipe(filter(Boolean), take(1))
      .subscribe((holidays: HolidaysPage) => {
        this.holidays.set(this.convertHolidaysToDataSource(holidays));
      });
  }

  private convertHolidaysToDataSource(holidays: HolidaysPage) {
    return convertHolidaysToDataSource(holidays);
  }
}
