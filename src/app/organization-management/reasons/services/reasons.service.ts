import { Injectable } from '@angular/core';

import { Store } from '@ngxs/store';

import { SaveClosureReasons, SaveOrderRequisition, SavePenalty, SaveUnavailabilityReason, UpdateClosureReasonsSuccess } from '@organization-management/store/reject-reason.actions';
import { OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { Penalty, PenaltyPayload } from '@shared/models/penalty.model';
import { RejectReason } from '@shared/models/reject-reason.model';
import { NewReasonsActionsMap, UpdateReasonsActionsMap } from '../constants';
import { ReasonsNavigationTabs } from '../enums';
import { Closurevalue, SaveReasonParams, UnavailabilityValue } from '../interfaces';

@Injectable()
export class ReasonsService {
  constructor(
    private store: Store,
  ) {}

  addRegionNameForLocations(regions: OrganizationRegion[] ): OrganizationRegion[] {
    return regions.map((region) => {

      region.locations = region.locations?.map((location) => {
        location.regionName = region.name;
        return location;
      }) as OrganizationLocation[];

      return region;
    });
  }

  createRegionIds(regions: OrganizationRegion[], reason: Penalty): number[] {
    if (!reason.regionId) {
      return regions.map((region) => region.id) as number[];
    }
    
    return [reason.regionId];
  }

  createSelectedRegions(regions: OrganizationRegion[], reason: Penalty, regionsIds: number[]): OrganizationRegion[] {
    if (reason.locationId === null) {
      return regions.filter((region) => regionsIds.includes(region.id as number));
    }

    return [];
  }

  createLocationIds(selected: OrganizationRegion[], reason: Penalty): number[] {
    if (reason.locationId === null) {
      return selected.map((region) => region.locations?.map((location) => location.id)).flat() as number[];
    }

    return [reason.locationId];
  }

  saveReason(params: SaveReasonParams): void {
    if (params.selectedTab === ReasonsNavigationTabs.Penalties) {
      const value = params.formValue as PenaltyPayload;

      this.store.dispatch(new SavePenalty({
        ...value,
        regionIds: params.allRegionsSelected ? [] : value.regionIds,
        locationIds: params.allLocationsSelected ? [] : value.locationIds,
        forceUpsert: params.forceUpsert,
      }));
    } else if (params.selectedTab === ReasonsNavigationTabs.Unavailability) {
      const value = params.formValue as UnavailabilityValue;

      this.store.dispatch(new SaveUnavailabilityReason({
        id: value.id || null,
        reason: value.reason,
        description: value.description,
        calculateTowardsWeeklyHours: !!value.calculateTowardsWeeklyHours,
        eligibleToBeScheduled: !!value.eligibleToBeScheduled,
        visibleForIRPCandidates: !!value.visibleForIRPCandidates,
      }));
    } else if (params.selectedTab === ReasonsNavigationTabs.Closure) {
      const value = params.formValue as Closurevalue;

      this.store.dispatch(new SaveClosureReasons({
        id: value.id || undefined,
        reason: value.reason,
        includeInVMS: value.includeInVMS,
        includeInIRP: value.includeInIRP
      }));
    } else if(params.selectedTab === ReasonsNavigationTabs.Requisition){
      const value = params.formValue as Closurevalue;

      this.store.dispatch(new SaveOrderRequisition({
        id: value.id || undefined,
        reason: value.reason,
        includeInVMS: value.includeInVMS,
        includeInIRP: value.includeInIRP
      }));
    }else {
      const Action = params.editMode ? UpdateReasonsActionsMap[params.selectedTab]
      : NewReasonsActionsMap[params.selectedTab];
      const payload = params.editMode ? this.createUpdateReasonPayload(params) : this.createNewReasonPayload(params);
      this.store.dispatch(new Action(payload));
    }
  }

  private createNewReasonPayload(params: SaveReasonParams): RejectReason {
    return ({
      reason: params.formValue.reason,
    }) as RejectReason;
  }

  private createUpdateReasonPayload(params: SaveReasonParams): RejectReason {
    return params.formValue as RejectReason;
  }
}