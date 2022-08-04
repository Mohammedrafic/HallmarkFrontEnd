import { GetInvoicesData } from '../../interfaces';
import { INVOICES_ACTIONS } from '../../enums/invoices.enum';
import { DialogAction } from '@core/enums';

export namespace Invoices {
  export class Get {
    static readonly type = INVOICES_ACTIONS.GET;

    constructor(public readonly payload: GetInvoicesData) {
    }
  }

  export class ToggleInvoiceDialog {
    static readonly type = INVOICES_ACTIONS.TOGGLE_INVOICE_DIALOG;

    constructor(
      public readonly action: DialogAction,
      public readonly id?: number,
      public readonly prevId?: string,
      public readonly nextId?: string) {
    }
  }

  export class ToggleManulaInvoiceDialog {
    static readonly type = INVOICES_ACTIONS.ToggleManualInvoice;

    constructor(
      public readonly action: DialogAction,
    ) {}
  }
}
