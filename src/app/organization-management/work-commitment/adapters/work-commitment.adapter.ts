import { CustomFormGroup } from '@core/interface';

import {
  WorkCommitmentDTO,
  WorkCommitmentForm,
  RegionsDTO,
  WorkCommitmentDetails,
  WorkCommitmentGrid,
} from '../interfaces';
import { getLocationssArray, getRegionsArray } from '../helpers';
import { DateTimeHelper } from '@core/helpers';

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
      startDate,
      endDate,
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
      startDate: startDate ? DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(new Date(startDate))) : null,
      endDate: endDate ? DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(new Date(endDate))) : null,
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
        startDate,
        endDate,
        jobCode,
        masterWorkCommitmentId,
        masterWorkCommitmentName,
        minimumWorkExperience,
        schedulePeriod,
        skills,
        workCommitmentId,
        workCommitmentOrgHierarchies,
        allLocationsSelected,
        allRegionsSelected
      } = item;
      itemsForGrid.push({
        availabilityRequirement,
        comments,
        criticalOrder,
        departmentId,
        departmentName,
        holiday,
        startDate,
        endDate,
        jobCode,
        locationName:allLocationsSelected ? ["All"] : getLocationssArray(workCommitmentOrgHierarchies.filter(f=>f.locationId!=null), 'locationName'),
        locationIds: getLocationssArray(workCommitmentOrgHierarchies.filter(f=>f.locationId!=null), 'locationId'),
        masterWorkCommitmentId,
        masterWorkCommitmentName,
        minimumWorkExperience,
        regionName:allRegionsSelected? ["All"]: getRegionsArray(workCommitmentOrgHierarchies, 'regionName'),
        regionIds: getRegionsArray(workCommitmentOrgHierarchies, 'regionId'),
        schedulePeriod,
        skillNames: skills.map((item) => item.name),
        skillIds: skills.map((item) => item.id),
        workCommitmentId,
        allLocationsSelected,
        allRegionsSelected
      });
    });
    return itemsForGrid;
  }
}
