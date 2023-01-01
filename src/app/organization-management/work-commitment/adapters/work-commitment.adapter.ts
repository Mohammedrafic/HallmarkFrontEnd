import { CustomFormGroup } from '@core/interface';

import {
  WorkCommitmentDTO,
  WorkCommitmentForm,
  RegionsDTO,
  WorkCommitmentDetails,
  WorkCommitmentGrid,
  WorkCommitmentOrgHierarchies,
} from '../interfaces';
import { getRegionsArray } from '../helpers';

export class WorkCommitmentAdapter {
  public static prepareToSave(
    correctRegions: RegionsDTO[],
    formGroup: CustomFormGroup<WorkCommitmentForm>
  ): WorkCommitmentDTO {
    const {
      masterWorkCommitmentId,
      skills,
      minimumWorkExperience,
      availabilityRequirement,
      schedulePeriod,
      criticalOrder,
      holiday,
      jobCode,
      comments,
    } = formGroup.getRawValue();

    return {
      masterWorkCommitmentId,
      skills,
      minimumWorkExperience,
      availabilityRequirement,
      schedulePeriod,
      criticalOrder,
      holiday,
      jobCode,
      comments,
      regions: correctRegions,
    };
  }

  public static adaptToGrid(items: WorkCommitmentDetails[]): WorkCommitmentGrid[] {
    const itemsForGrid: WorkCommitmentGrid[] = [];

    items.forEach((item) => {
      const {
        availabilityRequirement,
        comments,
        criticalOrder,
        departmentId,
        departmentName,
        holiday,
        jobCode,
        masterWorkCommitmentId,
        masterWorkCommitmentName,
        minimumWorkExperience,
        schedulePeriod,
        skills,
        workCommitmentId,
        workCommitmentOrgHierarchies,
      } = item;
      itemsForGrid.push({
        availabilityRequirement,
        comments,
        criticalOrder,
        departmentId,
        departmentName,
        holiday,
        jobCode,
        locationName: workCommitmentOrgHierarchies.map((item) => item.locationName),
        masterWorkCommitmentId,
        masterWorkCommitmentName,
        minimumWorkExperience,
        regionName: getRegionsArray(workCommitmentOrgHierarchies),
        schedulePeriod,
        skills,
        workCommitmentId,
      });
    });
    return itemsForGrid;
  }
}
