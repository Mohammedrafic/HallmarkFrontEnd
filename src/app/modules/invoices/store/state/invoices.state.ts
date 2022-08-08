import { Action, Selector, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { debounceTime, Observable, of, throttleTime } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';
import { Injectable } from '@angular/core';

import { PageOfCollections } from '@shared/models/page.model';
import { DialogAction } from '@core/enums';

import { Invoices } from '../actions/invoices.actions';
import { InvoicesService } from '../../services';
import { InvoiceFilterColumns, InvoiceRecord, InvoicesFilteringOptions, InvoicesFilterState } from '../../interfaces';
import { InvoicesModel } from '../invoices.model';
import { FilteringOptionsFields } from '../../../timesheets/enums';
import { DefaultInvoicesState } from '../../constants';
import { DefaultFiltersState, SavedFiltersParams } from '../../../timesheets/constants';
import { reduceFiltersState } from '../../../timesheets/helpers';
import { InvoicesApiService } from '../../services/invoices-api.service';
import { InvoicesTableFiltersColumns } from '../../enums/invoices.enum';
import { InvoicesFilteringOptionsMapping } from '../../constants';

@State<InvoicesModel>({
  name: 'invoices',
  defaults: DefaultInvoicesState,
})
@Injectable()
export class InvoicesState {
  constructor(
    private invoicesService: InvoicesService,
    private invoicesAPIService: InvoicesApiService,
  ) {
  }

  @Selector([InvoicesState])
  static invoicesData(state: InvoicesModel): PageOfCollections<InvoiceRecord> | null {
    return state?.invoicesData ?? null;
  }

  @Selector([InvoicesState])
  static invoicesFilters(state: InvoicesModel): InvoicesFilterState | null {
    return state.invoicesFilters;
  }

  @Selector([InvoicesState])
  static invoiceFiltersColumns(state: InvoicesModel): InvoiceFilterColumns {
    return state.invoiceFiltersColumns;
  }

  // @Selector([InvoicesState])
  // static isInvoiceDetailDialogOpen(state: InvoicesModel): DialogActionPayload {
  //   return { dialogState: state.isInvoiceDetailDialogOpen, rowId: state.selectedInvoiceId };
  // }

  @Selector([InvoicesState])
  static nextInvoiceId(state: InvoicesModel): string | null {
    return state?.nextInvoiceId ?? null;
  }

  @Selector([InvoicesState])
  static prevInvoiceId(state: InvoicesModel): string | null {
    return state?.prevInvoiceId ?? null;
  }

  @Action(Invoices.Get)
  GetInvoices(
    { patchState }: StateContext<InvoicesModel>,
    { payload }: Invoices.Get
  ): Observable<PageOfCollections<InvoiceRecord>> {
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

  @Action(Invoices.UpdateFiltersState)
  UpdateFiltersState(
    { setState, getState }: StateContext<InvoicesModel>,
    { payload }: Invoices.UpdateFiltersState,
  ): Observable<null> {
    const oldFilters: InvoicesFilterState = getState().invoicesFilters || DefaultFiltersState;
    let filters: InvoicesFilterState = reduceFiltersState(oldFilters, SavedFiltersParams);
    filters = Object.assign({}, filters, payload);

    return of(null).pipe(
      throttleTime(100),
      tap(() => setState(patch<InvoicesModel>({
        invoicesFilters: payload ? filters : DefaultFiltersState,
      })))
    );
  }

  @Action(Invoices.ResetFiltersState)
  ResetFiltersState(
    { setState }: StateContext<InvoicesModel>,
  ): Observable<null> {
    return of(null).pipe(
      throttleTime(100),
      tap(() => setState(patch<InvoicesModel>({
        invoicesFilters: null
      })))
    );
  }

  @Action(Invoices.GetFiltersDataSource)
  GetFiltersDataSource(
    { setState }: StateContext<InvoicesModel>,
  ): Observable<InvoicesFilteringOptions> {
    return this.invoicesAPIService.getFiltersDataSource().pipe(
      tap((res) => {
        setState(patch({
          invoiceFiltersColumns: patch(Object.keys(res).reduce((acc: any, key) => {
            if (key === FilteringOptionsFields.Statuses) { // TODO remove when would be correct api call
              return acc;
            }

            acc[InvoicesFilteringOptionsMapping.get((key as FilteringOptionsFields)) as InvoicesTableFiltersColumns] = patch({
              dataSource: res[key as FilteringOptionsFields],
            });
            return acc;
          }, {})),
        }));
      })
    );
  }

  @Action(Invoices.SetFiltersDataSource)
  SetFiltersDataSource(
    { setState }: StateContext<InvoicesModel>,
    { columnKey, dataSource }: Invoices.SetFiltersDataSource
  ): Observable<null> {
    return of(null)
      .pipe(
        debounceTime(100),
        tap(() =>
          setState(patch({
            invoiceFiltersColumns: patch({
              [columnKey]: patch({
                dataSource: dataSource,
              })
            })
          }))
        )
      );
  }

  @Action(Invoices.ToggleManulaInvoiceDialog)
  ToggleManInvoiceDialog(
    { action }: Invoices.ToggleManulaInvoiceDialog
  ): void {}
}
