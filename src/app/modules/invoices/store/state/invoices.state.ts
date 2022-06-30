import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Invoices } from "../actions/invoices.actions";
import { InvoicesService } from "../../services/invoices.service";
import { PageOfCollections } from "@shared/models/page.model";
import { InvoiceRecord } from "../../interfaces";
import { InvoicesModel } from "../invoices.model";
import { tap } from "rxjs/internal/operators/tap";

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

  @Action(Invoices.Get)
  GetInvoices({ patchState }: StateContext<InvoicesModel>, { payload }: Invoices.Get): Observable<PageOfCollections<InvoiceRecord>> {
    return this.invoicesService.getInvoices(payload).pipe(
      tap((data: PageOfCollections<InvoiceRecord>) => patchState({
        invoicesData: data,
      }))
    );
  }
}
