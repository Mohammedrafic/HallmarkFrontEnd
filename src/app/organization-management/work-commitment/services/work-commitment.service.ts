import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { filter, Observable, take } from 'rxjs';

import { CustomFormGroup } from '@core/interface';
import { BaseObservable } from '@core/helpers';
import { Holiday, HolidaysPage, MasterCommitmentNames, Option, WorkCommitmentForm } from '../interfaces';
import { WorkCommitmentDialogApiService } from './work-commitment-dialog-api.service';

import { OrganizationRegion } from '@shared/models/organization.model';
import { AssignedSkillsByOrganization } from '@shared/models/skill.model';

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
      skills: [null, Validators.required],
      availabilityRequirement: [null],
      schedulePeriod: [null],
      minimumWorkExperience: [null],
      criticalOrder: [null],
      holiday: [null],
      jobCode: [null, Validators.required],
      comments: [null],
    }) as CustomFormGroup<WorkCommitmentForm>;
  }

  public getAllDataSource(): void {
    this.getNamesDropdown();
    this.getHolidaysDropdown();
    this.getSkillsDropdown();
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
        this.masterCommitmentNames.set(correctItems);
      });
  }

  private getSkillsDropdown(): void {
    this.commitmentDialogApi
      .getAllSkills()
      .pipe(filter(Boolean), take(1))
      .subscribe((skills: AssignedSkillsByOrganization[]) => {
        const correctItems = skills.map((item: AssignedSkillsByOrganization) => ({
          name: item.skillDescription,
          id: item.masterSkillId,
        }));
        this.skills.set(correctItems);
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
    let holidayCounter = 0;
    holidays.items.forEach((item: Holiday) => {
      holidayCounter += this.calculateDateDifferent(item.startDateTime, item.endDateTime);
    });

    const dataSource = [];

    for (let i = 0; i <= holidayCounter; i++) {
      dataSource.push({ name: i, id: i });
    }

    return dataSource;
  }

  private calculateDateDifferent(firstDate: Date | string, secondDate: Date | string): number {
    firstDate = new Date(firstDate);
    secondDate = new Date(secondDate);

    const differentInTime = secondDate.getTime() - firstDate.getTime();
    return Math.ceil(differentInTime / (1000 * 3600 * 24));
  }
}
