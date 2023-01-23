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
    allSkillsLength: number,
    formGroup: CustomFormGroup<WorkCommitmentForm>
  ): WorkCommitmentDTO {
    const {
      masterWorkCommitmentId,
      skillIds,
      minimumWorkExperience,
      availabilityRequirement,
      schedulePeriod,
      criticalOrder,
      holiday,
      jobCode,
      comments,
      workCommitmentId,
    } = formGroup.getRawValue();

    const commitmentId: { workCommitmentId?: number } = {};
    if (workCommitmentId) {
      commitmentId.workCommitmentId = workCommitmentId;
    }

    return {
      ...commitmentId,
      masterWorkCommitmentId,
      skillIds: skillIds.length === allSkillsLength ? [null] : skillIds,
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
        locationIds: workCommitmentOrgHierarchies.map((item) => item.locationId),
        masterWorkCommitmentId,
        masterWorkCommitmentName,
        minimumWorkExperience,
        regionName: getRegionsArray(workCommitmentOrgHierarchies, 'regionName'),
        regionIds: getRegionsArray(workCommitmentOrgHierarchies, 'regionId'),
        schedulePeriod,
        skillNames: skills.map((item) => item.name),
        skillIds: skills.map((item) => item.id),
        workCommitmentId,
      });
    });
    return itemsForGrid;
  }
}
