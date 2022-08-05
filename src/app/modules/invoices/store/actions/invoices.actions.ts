import { GetInvoicesData, InvoicesFilterState } from '../../interfaces';
import { INVOICES_ACTIONS, InvoicesTableFiltersColumns } from '../../enums/invoices.enum';
import { DialogAction } from '@core/enums';
import { OrganizationRegion } from '@shared/models/organization.model';
import { DataSourceItem } from '@core/interface';

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

  export class UpdateFiltersState {
    static readonly type = INVOICES_ACTIONS.UPDATE_FILTERS_STATE;

    constructor(
      public readonly payload?: InvoicesFilterState | null,
    ) {}
  }

  export class ResetFiltersState {
    static readonly type = INVOICES_ACTIONS.RESET_FILTERS_STATE;
  }

  export class GetFiltersDataSource {
    static readonly type = INVOICES_ACTIONS.GET_FILTERS_DATA_SOURCE;
  }

  export class SetFiltersDataSource {
    static readonly type = INVOICES_ACTIONS.SET_FILTERS_DATA_SOURCE;

    constructor(
      public readonly columnKey: InvoicesTableFiltersColumns,
      public readonly dataSource: DataSourceItem[] | OrganizationRegion[]
    ) {
    }
  }
}
