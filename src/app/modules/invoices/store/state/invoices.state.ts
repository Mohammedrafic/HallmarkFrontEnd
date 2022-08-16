import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { debounceTime, Observable, of, throttleTime, catchError, forkJoin, map, switchMap } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';

import { PageOfCollections } from '@shared/models/page.model';
import { DialogAction } from '@core/enums';
import { DataSourceItem } from '@core/interface';
import { MessageTypes } from '@shared/enums/message-types';
import { ShowToast } from 'src/app/store/app.actions';
import { Invoices } from '../actions/invoices.actions';
import { InvoicesApiService, InvoicesService } from '../../services';
import {
  InvoiceFilterColumns,
  InvoiceRecord,
  InvoicesFilteringOptions,
  InvoicesFilterState,
  ManualInvoiceMeta,
  ManualInvoiceReason
} from '../../interfaces';
import { InvoicesModel } from '../invoices.model';
import { FilteringOptionsFields, TimesheetTargetStatus } from '../../../timesheets/enums';
import { DefaultInvoicesState, InvoicesFilteringOptionsMapping, ManualInvoiceMessages } from '../../constants';
import { SavedFiltersParams } from '../../../timesheets/constants';
import { reduceFiltersState } from '../../../timesheets/helpers';
import { InvoicesTableFiltersColumns } from '../../enums/invoices.enum';
import { InvoiceMetaAdapter } from '../../helpers';
import { OrganizationStructure } from '@shared/models/organization.model';
import { PendingInvoicesData } from '../../interfaces/pending-invoice-record.interface';
import { getAllErrors } from '@shared/utils/error.utils';
import { HttpErrorResponse } from '@angular/common/http';


const DefaultFiltersState: InvoicesFilterState = {
  pageNumber: 1,
  pageSize: 30,
  organizationId: null,
};


@State<InvoicesModel>({
  name: 'invoices',
  defaults: DefaultInvoicesState,
})
@Injectable()
export class InvoicesState {
  constructor(
    private invoicesService: InvoicesService,
    private invoicesAPIService: InvoicesApiService,
    private store: Store,
  ) {
  }

  @Selector([InvoicesState])
  static invoicesData(state: InvoicesModel): PageOfCollections<InvoiceRecord> | null {
    return state?.invoicesData ?? null;
  }

  @Selector([InvoicesState])
  static pendingInvoicesData(state: InvoicesModel): PendingInvoicesData | null {
    return state?.pendingInvoicesData ?? null;
  }

  @Selector([InvoicesState])
  static invoicesFilters(state: InvoicesModel): InvoicesFilterState | null {
    return state.invoicesFilters;
  }

  @Selector([InvoicesState])
  static invoiceFiltersColumns(state: InvoicesModel): InvoiceFilterColumns {
    return state.invoiceFiltersColumns;
  }

  @Selector([InvoicesState])
  static invoicesOrganizations(state: InvoicesModel): DataSourceItem[] {
    return state.organizations;
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

  @Selector([InvoicesState])
  static invoiceReasons(state: InvoicesModel): ManualInvoiceReason[] {
    return state.invoiceReasons;
  }

  @Selector([InvoicesState])
  static selectedOrgId(state: InvoicesModel): number {
    return state.selectedOrganizationId;
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

  @Action(Invoices.ToggleManualInvoiceDialog)
  ToggleManInvoiceDialog(): void {}

  @Action(Invoices.GetInvoicesReasons)
  GetInvoicesReasons(
    { patchState }: StateContext<InvoicesModel>,
    { orgId }: Invoices.GetInvoicesReasons,
  ): Observable<ManualInvoiceReason[]> {

    return this.invoicesAPIService.getInvoiceOrgReasons(orgId)
      .pipe(
        tap((res) => {
          patchState(
            {
              invoiceReasons: res,
            }
          );
        }),
      )
  }

  @Action(Invoices.GetManInvoiceMeta)
  GetInvoiceMeta(
    { patchState }: StateContext<InvoicesModel>,
    { orgId }: Invoices.GetManInvoiceMeta,
  ): Observable<ManualInvoiceMeta[]> {
    return this.invoicesAPIService.getManInvoiceMeta(orgId)
      .pipe(
        tap((res) => {
          patchState({
            invoiceMeta: res,
          });
        }),
      );
  }

  @Action(Invoices.SaveManulaInvoice)
  SaveManualInvoice(
    ctx: StateContext<InvoicesModel>,
    { payload, files, isAgency }: Invoices.SaveManulaInvoice,
    /**
     * TODO: change return type afte invoice get implementation
     */
  ): Observable<number[]> {
    return this.invoicesAPIService.saveManualInvoice(payload)
    .pipe(
      switchMap((res) => this.invoicesAPIService.saveManualInvoiceAttachments(
        files, isAgency ? res.organizationId : null,  res.timesheetId,)),
      tap(() => {
        ctx.dispatch([
          new ShowToast(MessageTypes.Success, ManualInvoiceMessages.successAdd),
          new Invoices.GetPendingInvoices(payload.organizationId),
        ]);
      }),
    );
  }

  @Action(Invoices.GetOrganizations)
  GetOrganizations(
    { patchState }: StateContext<InvoicesModel>,
  ): Observable<DataSourceItem[]> {
    return this.invoicesAPIService.getOrganizations()
    .pipe(
      tap((res) => {
        patchState({
          organizations: res,
        });
      })
    )
  }

  @Action(Invoices.GetOrganizationStructure)
  GetStructure(
    { patchState }: StateContext<InvoicesModel>,
    { orgId, isAgency }: Invoices.GetOrganizationStructure,
  ): Observable<OrganizationStructure> {
    return this.invoicesAPIService.getOrgStructure(orgId, isAgency)
    .pipe(
      tap((res) => {
        patchState({
          organizationLocations: InvoiceMetaAdapter.createLocationsStructure(res.regions),
          regions: res.regions,
        });
      }),
    )
  }

  @Action(Invoices.SelectOrganization)
  SelectOrganization(
    { patchState }: StateContext<InvoicesModel>,
    { id }: Invoices.SelectOrganization
  ): Observable<null> {
    return of(null).pipe(
      debounceTime(100),
      tap(() => patchState({
        selectedOrganizationId: id,
      }))
    );
  }

  @Action(Invoices.GetPendingInvoices)
  GetPendingInvoices(
    { patchState, getState }: StateContext<InvoicesModel>,
    { organizationId }: Invoices.GetPendingInvoices
  ): Observable<PendingInvoicesData> {
    const state = getState();

    return this.invoicesAPIService.getPendingInvoices({
      ...state.invoicesFilters,
      organizationId,
    }).pipe(
      tap((data: PendingInvoicesData) => patchState({
        pendingInvoicesData: data,
      }))
    );
  }

  @Action(Invoices.ApproveInvoice)
  ApproveInvoices(
    { patchState, getState }: StateContext<InvoicesModel>,
    { invoiceId }: Invoices.ApproveInvoice
  ): Observable<void> {
    return this.invoicesAPIService.changeInvoiceStatus({
      organizationId: null,
      reason: null,
      targetStatus: TimesheetTargetStatus.Approved,
      timesheetId: invoiceId,
    }).pipe(
      tap(() => this.store.dispatch([
        new Invoices.GetPendingInvoices(null),
        new ShowToast(MessageTypes.Success, 'Record has been approved'),
      ])),
      catchError((error: HttpErrorResponse) => this.store.dispatch(
        new ShowToast(MessageTypes.Error, getAllErrors(error.error))
      ))
    );
  }

  @Action(Invoices.RejectInvoice)
  RejectInvoice(
    { patchState, getState }: StateContext<InvoicesModel>,
    { invoiceId }: Invoices.RejectInvoice
  ): Observable<void> {
    return this.invoicesAPIService.changeInvoiceStatus({
      organizationId: null,
      reason: null,
      targetStatus: TimesheetTargetStatus.Rejected,
      timesheetId: invoiceId,
    }).pipe(
      tap(() => this.store.dispatch([
        new ShowToast(MessageTypes.Success, 'Record has been rejected'),
        new Invoices.GetPendingInvoices(null),
      ])),
      catchError((error: HttpErrorResponse) => this.store.dispatch(
        new ShowToast(MessageTypes.Error, getAllErrors(error.error))
      )),
    );
  }
}
