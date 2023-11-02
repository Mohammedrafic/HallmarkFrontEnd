import { Injectable } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { filter, Observable } from 'rxjs';

import {
  CreateManualInvoiceRejectReason,
  SaveCancelEmployeeReason,
  SaveCategoryNoteReasons,
  SaveClosureReasons,
  SaveOrderRequisition,
  SavePenalty,
  SaveInactivationReasons,
  SaveUnavailabilityReason,
  UpdateCategoryNoteReasons,
  UpdateManualInvoiceRejectReason,
  UpdateRecuriterReasons,
  UpdateSourcingReasons,
  UpdateInactivationReasons,
} from '@organization-management/store/reject-reason.actions';
import { SelectedSystems } from '@shared/components/credentials-list/constants';
import { SelectedSystemsFlag } from '@shared/components/credentials-list/interfaces';
import { REASON_WARNING } from '@shared/constants';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { MessageTypes } from '@shared/enums/message-types';
import { Organization, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { Penalty, PenaltyPayload } from '@shared/models/penalty.model';
import { RejectReason, SelectRejectedSystem } from '@shared/models/reject-reason.model';
import { ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { NewReasonsActionsMap, UpdateReasonsActionsMap } from '../constants';
import { ReasonsNavigationTabs } from '../enums';
import { CancelEmployeeReasonValue, CategoryNoteValue, Closurevalue, SaveReasonParams, InactivatedValue, UnavailabilityValue } from '../interfaces';

@Injectable()
export class ReasonsService {
  constructor(
    private store: Store,
  ) { }

  @Select(OrganizationManagementState.organization)
  public readonly organization$: Observable<Organization>;
  protected componentDestroy: () => Observable<unknown>;
  public selectedSystem: SelectedSystemsFlag = SelectedSystems;

  addRegionNameForLocations(regions: OrganizationRegion[]): OrganizationRegion[] {
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
    this.getOrganizagionData();
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
        sendThroughIntegration : !!value.sendThroughIntegration
      }));
    } else if (params.selectedTab === ReasonsNavigationTabs.CancelEmployeeReasons) {
      const value = params.formValue as CancelEmployeeReasonValue;

      this.store.dispatch(new SaveCancelEmployeeReason({
        id: value.id || null,
        reason: value.reason,
      }));
    } else if(params.selectedTab === ReasonsNavigationTabs.Rejection) {
      const {formValue, selectedSystem, editMode , isVMSIRP} = params;
      const hasSelectedSystem = isVMSIRP ? !(formValue as RejectReason).includeInIRP && !(formValue as RejectReason).includeInVMS :
        !selectedSystem.isIRP && !selectedSystem.isVMS;

      if (hasSelectedSystem) {
        this.store.dispatch(new ShowToast(MessageTypes.Error, REASON_WARNING));
        return;
      }

      this.saveUpdateRejectReason(formValue as RejectReason,selectedSystem,editMode);
    } else if (params.selectedTab === ReasonsNavigationTabs.Closure) {
      var value = params.formValue as Closurevalue;
      (value.includeInIRP == null) ? (value.includeInIRP = false) : "";
      (value.includeInVMS == null) ? (value.includeInVMS = false) : "";
      var reasonvalue = {
        id : value.id || undefined,
        includeInIRP : this.selectedSystem.isIRP,
        includeInVMS : this.selectedSystem.isVMS,
        reason : params.formValue.reason
      };
      ((this.selectedSystem.isIRP && this.selectedSystem.isVMS) ? "" : value = reasonvalue as Closurevalue);
      if (params.isVMSIRP) {
        if ((value.includeInIRP == false) && (value.includeInVMS == false)) {
          this.store.dispatch(new ShowToast(MessageTypes.Error, REASON_WARNING));
        } else {
          this.store.dispatch(new SaveClosureReasons({
            id: value.id || undefined,
            reason: value.reason,
            includeInVMS: !!value.includeInVMS,
            includeInIRP: !!value.includeInIRP,
          }));
        }
      } else {
        this.store.dispatch(new SaveClosureReasons({
          id: value.id || undefined,
          reason: value.reason,
          includeInVMS: params.selectedSystem.isVMS,
          includeInIRP: params.selectedSystem.isIRP,
        }));
      }
    } else if (params.selectedTab === ReasonsNavigationTabs.Requisition) {
      var value = params.formValue as Closurevalue;
      (value.includeInIRP == null) ? (value.includeInIRP = false) : "";
      (value.includeInVMS == null) ? (value.includeInVMS = false) : "";
      var reqreasonvalue = {
        id : value.id || undefined,
        includeInIRP : this.selectedSystem.isIRP,
        includeInVMS : this.selectedSystem.isVMS,
        reason : params.formValue.reason,
        isAutoPopulate : value.isAutoPopulate
      };
      ((this.selectedSystem.isIRP && this.selectedSystem.isVMS) ? "" : value = reqreasonvalue as Closurevalue);
      if (params.isVMSIRP) {
        if ((value.includeInIRP == false) && (value.includeInVMS == false)) {
          this.store.dispatch(new ShowToast(MessageTypes.Error, REASON_WARNING));
        } else {
          this.store.dispatch(new SaveOrderRequisition({
            id: value.id || undefined,
            reason: value.reason,
            includeInVMS: !!value.includeInVMS,
            includeInIRP: !!value.includeInIRP,
            isAutoPopulate : !!value.isAutoPopulate
          }));
        }
      } else {
        this.store.dispatch(new SaveOrderRequisition({
          id: value.id || undefined,
          reason: value.reason,
          includeInVMS: !!value.includeInVMS,
          includeInIRP: !!value.includeInIRP,
          isAutoPopulate : !!value.isAutoPopulate
        }));
      }

    } else if (params.selectedTab === ReasonsNavigationTabs.CategoryNote) {
      const value = params.formValue as CategoryNoteValue;
      if (value.id != undefined || null) {
        this.store.dispatch(new UpdateCategoryNoteReasons({
          id: value.id || undefined,
          reason: value.reason,
          isRedFlagCategory: !!value.isRedFlagCategory,
        }));
      } else {
        this.store.dispatch(new SaveCategoryNoteReasons({
          id: value.id || undefined,
          reason: value.reason,
          isRedFlagCategory: !!value.isRedFlagCategory,
        }));
      }
    } else if (params.selectedTab === ReasonsNavigationTabs.SourcingReason) {
      const value = params.formValue as CategoryNoteValue;
      if (value.id != undefined || null) {
        this.store.dispatch(new UpdateSourcingReasons({
          id: value.id || undefined,
          reason: value.reason,
        }));
      }
      else {
        const Action = params.editMode ? UpdateReasonsActionsMap[params.selectedTab]
          : NewReasonsActionsMap[params.selectedTab];
        const payload = params.editMode ? this.createUpdateReasonPayload(params) : this.createNewReasonPayload(params);
        this.store.dispatch(new Action(payload));
      }
    } else if (params.selectedTab === ReasonsNavigationTabs.RecruiterReason) {
      const value = params.formValue as CategoryNoteValue;
      if (value.id != undefined || null) {
        this.store.dispatch(new UpdateRecuriterReasons({
          id: value.id || undefined,
          reason: value.reason,
        }));
      } else {
        const Action = params.editMode ? UpdateReasonsActionsMap[params.selectedTab]
          : NewReasonsActionsMap[params.selectedTab];
        const payload = params.editMode ? this.createUpdateReasonPayload(params) : this.createNewReasonPayload(params);
        this.store.dispatch(new Action(payload));
      }
    } else if (params.selectedTab === ReasonsNavigationTabs.ManualInvoice) {
      var valueRR = params.formValue as RejectReason;
      if (valueRR.id != undefined || null) {
        this.store.dispatch(new UpdateManualInvoiceRejectReason({
          id: valueRR.id || undefined,
          reason: valueRR.reason,
          agencyFeeApplicable: !!valueRR.agencyFeeApplicable,
        }));
      } else {
        this.store.dispatch(new CreateManualInvoiceRejectReason({
          id: valueRR.id || undefined,
          reason: valueRR.reason,
          agencyFeeApplicable: !!valueRR.agencyFeeApplicable,
        }));
      }
    } else if (params.selectedTab === ReasonsNavigationTabs.Inactivation) {
      const value = params.formValue as InactivatedValue;
      if (value.id != undefined || null) {
        this.store.dispatch(new UpdateInactivationReasons({
          id: value.id || undefined,
          reason: value.reason,
          defaultValue : !!value.defaultValue
        }));
      } else {
        this.store.dispatch(new SaveInactivationReasons({
          reason: value.reason,
          defaultValue : !!value.defaultValue
        }));
      }
     } else {
      const Action = params.editMode ? UpdateReasonsActionsMap[params.selectedTab]
        : NewReasonsActionsMap[params.selectedTab];
      const payload = params.editMode ? this.createUpdateReasonPayload(params) : this.createNewReasonPayload(params);
      this.store.dispatch(new Action(payload));
    }
  }

  private saveUpdateRejectReason(formValue: RejectReason, selectedSystem: SelectRejectedSystem, editMode: boolean): void {
    const action = editMode ? UpdateReasonsActionsMap[ReasonsNavigationTabs.Rejection] : NewReasonsActionsMap[ReasonsNavigationTabs.Rejection];

    if (formValue.includeInIRP || formValue.includeInVMS) {
      const rejectedDto = {
        id: formValue.id || undefined,
        reason: formValue.reason,
        includeInVMS: !!formValue.includeInVMS,
        includeInIRP: !!formValue.includeInIRP,
      };

      this.store.dispatch(new action(rejectedDto));
      return;
    }

    const rejectedDto = {
      id: formValue.id || undefined,
      reason: formValue.reason,
      includeInVMS: !!selectedSystem.isVMS,
      includeInIRP: !!selectedSystem.isIRP,
    };
    this.store.dispatch(new action(rejectedDto));
  }

  private createNewReasonPayload(params: SaveReasonParams): RejectReason {
    return ({
      reason: params.formValue.reason,
    }) as RejectReason;
  }

  private createUpdateReasonPayload(params: SaveReasonParams): RejectReason {
    return params.formValue as RejectReason;
  }

  private getOrganizagionData(): void {
    this.organization$
    .pipe(
      filter(Boolean)
    )
    .subscribe((organization : Organization) => {
      const isOrgUser = this.store.selectSnapshot(UserState.user)?.businessUnitType === BusinessUnitType.Organization;
      this.selectedSystem = {
        isIRP: !!organization.preferences.isIRPEnabled,
        isVMS: !!organization.preferences.isVMCEnabled,
      };
    });
  }
}
