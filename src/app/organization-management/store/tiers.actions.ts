import { TierDTO } from '@shared/components/tiers-dialog/interfaces/tier-form.interface';
import { TIERS_ACTIONS } from '@organization-management/enums';
import { TierPriorityDTO } from '@organization-management/tiers/interfaces';
import { SystemType } from "@shared/enums/system-type.enum";

export namespace Tiers {
  export class GetTiersByPage {
    static readonly type = TIERS_ACTIONS.GET_TIERS_BY_PAGE;
    constructor(
      public pageNumber: number,
      public pageSize: number,
      public systemType: SystemType,
    ) {}
  }

  export class SaveTier {
    static readonly type = TIERS_ACTIONS.SAVE_TIER;
    constructor(
      public payload: TierDTO,
      public isEdit: boolean
    ) {}
  }

  export class SaveTierIRP {
    static readonly type = TIERS_ACTIONS.SAVE_TIER_IRP;
    constructor(
      public payload: TierDTO,
      public isEdit: boolean
    ) {}
  }

  export class DeleteTier {
    static readonly type = TIERS_ACTIONS.DELETE_TIER;
    constructor(public id: number) {}
  }

  export class UpdatePageAfterSuccessAction {
    static readonly type = TIERS_ACTIONS.UPDATE_PAGE_AFTER_SUCCESS_ACTION;
  }

  export class ShowOverrideTierDialog {
    static readonly type = TIERS_ACTIONS.SHOW_OVERRIDE_TIER_DIALOG;
  }

  export class ChangeTierPriority {
    static readonly type = TIERS_ACTIONS.CHANGE_TIER_PRIORITY;
    constructor(
      public payload: TierPriorityDTO
    ) {}
  }

  export class GetWorkCommitmentByPageforTiers {
    static readonly type = TIERS_ACTIONS.GET_WORKCOMMITMENT;
    constructor(  public payload : any) { }
  }
}
