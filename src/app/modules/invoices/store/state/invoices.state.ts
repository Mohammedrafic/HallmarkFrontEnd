import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Invoices } from "../actions/invoices.actions";
import { InvoicesService } from "../../services/invoices.service";
import { PageOfCollections } from "@shared/models/page.model";
import { InvoiceRecord } from "../../interfaces";
import { InvoicesModel } from "../invoices.model";
import { tap } from "rxjs/internal/operators/tap";
import { Timesheets } from '../../../timesheets/store/actions/timesheets.actions';
import { TimesheetsModel } from '../../../timesheets/store/model/timesheets.model';
import { DialogAction } from '../../../timesheets/enums';
import { DialogActionPayload } from '../../../timesheets/interface';

@State<InvoicesModel>({
  name: 'invoices',
  defaults: {
  } as InvoicesModel,
})
@Injectable()
export class InvoicesState {
  constructor(
    private invoicesService: InvoicesService,
  ) {
  }

  @Selector([InvoicesState])
  static invoicesData(state: InvoicesModel): PageOfCollections<InvoiceRecord> | null {
    return state?.invoicesData ?? null;
  }

  @Selector([InvoicesState])
  static isInvoiceDetailDialogOpen(state: InvoicesModel): DialogActionPayload {
    return { dialogState: state.isInvoiceDetailDialogOpen, rowId: state.selectedInvoiceId };
  }

  @Selector([InvoicesState])
  static nextInvoiceId(state: InvoicesModel): string | null {
    return state?.nextInvoiceId ?? null;
  }

  @Selector([InvoicesState])
  static prevInvoiceId(state: InvoicesModel): string | null {
    return state?.prevInvoiceId ?? null;
  }

  @Action(Invoices.Get)
  GetInvoices({ patchState }: StateContext<InvoicesModel>, { payload }: Invoices.Get): Observable<PageOfCollections<InvoiceRecord>> {
    return this.invoicesService.getInvoices(payload).pipe(
      tap((data: PageOfCollections<InvoiceRecord>) => patchState({
        invoicesData: data,
      }))
    );
  }

  @Action(Invoices.ToggleInvoiceDialog)
  ToggleInvoiceDialog(
    { patchState }: StateContext<InvoicesModel>,
    { action, id, prevId, nextId }: Invoices.ToggleInvoiceDialog
  ): void {
    const isOpen: boolean = action === DialogAction.Open;

    patchState({
      isInvoiceDetailDialogOpen: isOpen,
      selectedInvoiceId: id,
      ...(isOpen ? {prevInvoiceId: prevId, nextInvoiceId: nextId} : {}),
    });
  }
}
