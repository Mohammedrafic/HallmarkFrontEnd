import {
  AssociateOrganizationsAgency,
  DepartmentsTierDTO,
  FeeExceptionsDTO,
  FeeExceptionsPage,
  PartnershipSettings,
} from '@shared/models/associate-organizations.model';
import { TierDTO } from '@shared/components/tiers-dialog/interfaces/tier-form.interface';
import { TIERS_EXCEPTION_ACTION } from '@shared/components/associate-list/enums';
import { Tier } from '@shared/components/associate-list/interfaces';

export namespace TiersException {
  export class GetAssociateListPage {
    static readonly type = TIERS_EXCEPTION_ACTION.GET_ASSOCIATE_LIST;
    constructor(public pageNumber: number, public pageSize: number, public orderBy: string) {}
  }

  export class DeleteAssociateOrganizationsAgencyById {
    static readonly type = TIERS_EXCEPTION_ACTION.DELETE_ORG_AGENCY_BY_ID;
    constructor(public id: number) {}
  }

  export class SaveFeeExceptions {
    static readonly type = TIERS_EXCEPTION_ACTION.SAVE_FEE_EXCEPTIONS;
    constructor(public feeExceptionsDTO: FeeExceptionsDTO) {}
  }

  export class GetAssociateAgencyOrg {
    static readonly type = TIERS_EXCEPTION_ACTION.GET_ASSOCIATE_AGENCY_ORG;
    constructor() {}
  }

  export class InviteOrganizationsAgency {
    static readonly type = TIERS_EXCEPTION_ACTION.INVITE_ORG_AGENCY;
    constructor(public organizationIds: number[]) {}
  }

  export class InviteOrganizationsSucceeded {
    static readonly type = TIERS_EXCEPTION_ACTION.INVITE_ORG_SUCCESS;
    constructor(public payload: AssociateOrganizationsAgency[]) {}
  }

  export class SaveFeeExceptionsSucceeded {
    static readonly type = TIERS_EXCEPTION_ACTION.SAVE_FEE_EXCEPTION_SUCCESS;
    constructor(public feeExceptionsDTO: FeeExceptionsPage) {}
  }

  export class GetFeeSettingByOrganizationId {
    static readonly type = TIERS_EXCEPTION_ACTION.GET_ASSOCIATE_AGENCY_ORG_BY_ID;
    constructor(public organizationAgencyId: number, public pageNumber: number, public pageSize: number) {}
  }

  export class SavePartnershipSettings {
    static readonly type = TIERS_EXCEPTION_ACTION.SAVE_PARTNERSHIP_SETTINGS;
    constructor(public payload: PartnershipSettings) {}
  }

  export class UpdateAssociateOrganizationsAgencyPage {
    static readonly type = TIERS_EXCEPTION_ACTION.UPDATE_ASSOCIATE_AGENCY_ORG_PAGE;
    constructor() {}
  }

  export class GetPartnershipSettings {
    static readonly type = TIERS_EXCEPTION_ACTION.GET_PARTNERSHIP_SETTINGS_BY_ID;
    constructor(public organizationId: number) {}
  }

  export class SaveBaseFee {
    static readonly type = TIERS_EXCEPTION_ACTION.SAVE_BASE_FEE;
    constructor(public associateOrganizationId: number, public baseFee: number) {}
  }

  export class GetFeeExceptionsInitialData {
    static readonly type = TIERS_EXCEPTION_ACTION.GET_FEE_INITIAL_DATA;
    constructor(public organizationId: number) {}
  }

  export class GetJobDistributionInitialData {
    static readonly type = TIERS_EXCEPTION_ACTION.GET_DISTRIBUTION_INITIAL_DATA;
    constructor() {}
  }

  export class RemoveFeeExceptionsById {
    static readonly type = TIERS_EXCEPTION_ACTION.REMOVE_FEE_EXC_BY_ID;
    constructor(public id: number) {}
  }

  export class GetTiers {
    static readonly type = TIERS_EXCEPTION_ACTION.GET_TIERS;
    constructor( public payload: DepartmentsTierDTO ) {}
  }

  export class SaveTierException {
    static readonly type = TIERS_EXCEPTION_ACTION.SAVE_TIER_EXCEPTION;
    constructor(
      public payload: TierDTO,
      public isEdit: boolean
    ) {}
  }

  export class GetTierExceptionByPage {
    static readonly type = TIERS_EXCEPTION_ACTION.GET_TIER_EXCEPTION_BY_PAGE;
    constructor(
      public id: number,
      public pageNumber: number,
      public pageSize: number
    ) {}
  }

  export class DeleteTierException {
    static readonly type = TIERS_EXCEPTION_ACTION.DELETE_TIER_EXCEPTION;
    constructor(public id: number) {}
  }

  export class GetSelectedOrgAgency {
    static readonly type = TIERS_EXCEPTION_ACTION.SELECTED_ORG_AGENCY;
    constructor(public selectedOrganizationAgency: AssociateOrganizationsAgency) {}
  }

  export class UpdateExceptionAfterSuccessAction {
    static readonly type = TIERS_EXCEPTION_ACTION.UPDATE_PAGE_AFTER_SUCCESS_ACTION;
  }

  export class SaveTier {
    static readonly type = TIERS_EXCEPTION_ACTION.SAVE_TIER;
    constructor(public payload: Tier) {}
  }
}


