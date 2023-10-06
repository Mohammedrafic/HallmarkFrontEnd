import {
    CandidateWorkCommitment,
} from '@client/candidates/candidate-work-commitment/models/candidate-work-commitment.model';
import { WorkCommitmentGrid } from '@organization-management/work-commitment/interfaces';

export const checkCommitmentNotOverride =
(commitment: WorkCommitmentGrid | CandidateWorkCommitment, regions: number[], locations: number[]): boolean => {
  if (!commitment.isInUse) {
      return true;
    }
    
    const allPrevRegionsInPlace =  (commitment.regionIds as number[])
    .every((id) => regions.includes(id as unknown as number));
    const newRegionAdded = regions.some((id) => !(commitment.regionIds as unknown as number[]).includes(id));
    const allLocationsInPlace = (commitment.locationIds  as number[])
    .every((id) => locations.includes(id as unknown as number));
    const newLocationsAdded = locations.some((id) => !(commitment.locationIds as unknown as number[]).includes(id));
    const newCommitmentOverride = (allPrevRegionsInPlace && newRegionAdded) || (allLocationsInPlace && newLocationsAdded);

    return newCommitmentOverride;
};
