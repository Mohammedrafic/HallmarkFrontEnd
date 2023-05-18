import { ManualInvoiceReasonsActionsTypesEnum } from '@shared/enums/manual-invoice-reasons-actions-types.enum';
import { ManualInvoiceReason } from '@shared/models/manual-invoice-reasons.model';

export namespace ManualInvoiceReasons {
  export class GetAll {
    static readonly type = ManualInvoiceReasonsActionsTypesEnum.GET_ALL;
    constructor(public pageNumber: number, public pageSize: number) {}
  }

  export class Save {
    static readonly type = ManualInvoiceReasonsActionsTypesEnum.SAVE;
    constructor(public payload: { reason: string }) {}
  }

  export class Update {
    static readonly type = ManualInvoiceReasonsActionsTypesEnum.UPDATE;
    constructor(public payload: ManualInvoiceReason) {
    }
  }

  export class Remove {
    static readonly type = ManualInvoiceReasonsActionsTypesEnum.REMOVE;
    constructor(public id: number,public businessUnitId: number){}
  }

  export class SaveError {
    static readonly type = ManualInvoiceReasonsActionsTypesEnum.SAVE_ERROR;
  }

  export class SaveSuccess {
    static readonly type = ManualInvoiceReasonsActionsTypesEnum.SAVE_SUCCESS;
  }

  export class UpdateSuccess {
    static readonly type = ManualInvoiceReasonsActionsTypesEnum.UPDATE_SUCCESS;
  }
}
