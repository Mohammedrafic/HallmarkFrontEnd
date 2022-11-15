import { TierDTO } from '@shared/components/tiers-dialog/interfaces/tier-form.interface';
import { TIERS_ACTIONS } from '@organization-management/enums';

export namespace Tiers {
  export class GetTiersByPage {
    static readonly type = TIERS_ACTIONS.GET_TIERS_BY_PAGE;
    constructor(
      public pageNumber: number,
      public pageSize: number
    ) {}
  }

  export class SaveTier {
    static readonly type = TIERS_ACTIONS.SAVE_TIER;
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
}
