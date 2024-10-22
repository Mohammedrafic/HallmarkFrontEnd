import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { filter, take } from 'rxjs';

import { CustomFormGroup } from '@core/interface';
import { BaseObservable, DateTimeHelper } from '@core/helpers';
import {
  HolidaysPage,
  Option,
  WorkCommitmentForm,
  WorkCommitmentGrid,
} from '../interfaces';
import { WorkCommitmentDialogApiService } from './work-commitment-dialog-api.service';

import { OrganizationRegion } from '@shared/models/organization.model';
import { AssignedSkillsByOrganization } from '@shared/models/skill.model';
import { mapDataSource } from '../helpers';
import { convertHolidaysToDataSource } from '@shared/helpers/dropdown-options.helper';
import { formatDate as formatDateString } from '@shared/constants/format-date';

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
      regions: [[], Validators.required],
      locations: [[], Validators.required],
      skillIds: [[], Validators.required],
      availabilityRequirement: [null],
      schedulePeriod: [null],
      minimumWorkExperience: [null],
      criticalOrder: [null],
      holiday: [null],
      startDate: [null, Validators.required],
      endDate: [null],
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
      startDate: commitment.startDate ? DateTimeHelper.formatDateUTC(commitment.startDate, formatDateString) : null,
      endDate: commitment.endDate ? DateTimeHelper.formatDateUTC(commitment.endDate, formatDateString) : null,
    };
  }

  private getNamesDropdown(): void {
    this.commitmentDialogApi
      .getMasterCommitmentNames()
      .pipe(filter(Boolean), take(1))
      .subscribe((names) => {
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
