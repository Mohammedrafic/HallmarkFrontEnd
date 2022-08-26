import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { debounceTime, Observable, of, throttleTime, catchError, switchMap } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';

import { PageOfCollections } from '@shared/models/page.model';
import { DialogAction } from '@core/enums';
import { DataSourceItem } from '@core/interface';
import { MessageTypes } from '@shared/enums/message-types';
import { ShowToast } from 'src/app/store/app.actions';
import { Invoices } from '../actions/invoices.actions';
import { InvoicesApiService, InvoicesService, ManualInvoiceAttachmentsApiService } from '../../services';
import {
  BaseInvoice,
  InvoiceFilterColumns,
  InvoiceRecord,
  InvoicesFilteringOptions,
  InvoicesFilterState,
  InvoiceStateDto,
  ManualInvoiceMeta,
  ManualInvoiceReason, ManualInvoicesData, PrintInvoiceData
} from '../../interfaces';
import { InvoicesModel } from '../invoices.model';
import { FilteringOptionsFields } from '../../../timesheets/enums';
import { DefaultInvoicesState, InvoicesFilteringOptionsMapping, ManualInvoiceMessages } from '../../constants';
import { SavedFiltersParams } from '../../../timesheets/constants';
import { reduceFiltersState } from '../../../timesheets/helpers';
import { InvoicesTableFiltersColumns } from '../../enums/invoices.enum';
import { InvoiceMetaAdapter } from '../../helpers';
import { OrganizationStructure } from '@shared/models/organization.model';
import { PendingInvoicesData } from '../../interfaces/pending-invoice-record.interface';
import { getAllErrors } from '@shared/utils/error.utils';
import { HttpErrorResponse } from '@angular/common/http';
import { FileViewer } from '@shared/modules/file-viewer/file-viewer.actions';
import { downloadBlobFile } from '@shared/utils/file.utils';
import { PendingApprovalInvoicesData } from '../../interfaces/pending-approval-invoice.interface';


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
    private manualInvoiceAttachmentsApiService: ManualInvoiceAttachmentsApiService,
  ) {
  }

  @Selector([InvoicesState])
  static invoicesData(state: InvoicesModel): PageOfCollections<InvoiceRecord> | null {
    return state?.invoicesData ?? null;
  }

  @Selector([InvoicesState])
  static manualInvoicesData(state: InvoicesModel): ManualInvoicesData | null {
    return state?.manualInvoicesData ?? null;
  }

  @Selector([InvoicesState])
  static pendingInvoicesData(state: InvoicesModel): PendingInvoicesData | null {
    return state?.pendingInvoicesData ?? null;
  }

  @Selector([InvoicesState])
  static invoicesContainerData(state: InvoicesModel): PageOfCollections<BaseInvoice> | null {
    return state?.invoicesContainerData ?? null;
  }

  @Selector([InvoicesState])
  static pendingApprovalInvoicesData(state: InvoicesModel): PendingApprovalInvoicesData | null {
    return state?.pendingApprovalInvoicesData ?? null;
  }

  @Selector([InvoicesState])
  static pendingPaymentInvoicesData(state: InvoicesModel): PendingApprovalInvoicesData | null {
    return state?.pendingPaymentInvoicesData ?? null;
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
    { setState, dispatch }: StateContext<InvoicesModel>,
  ): Observable<InvoicesFilteringOptions | void> {
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
      }),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
      }),
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
    { patchState, dispatch }: StateContext<InvoicesModel>,
    { orgId }: Invoices.GetInvoicesReasons,
  ): Observable<ManualInvoiceReason[] | void> {

    return this.invoicesAPIService.getInvoiceOrgReasons(orgId)
      .pipe(
        tap((res) => {
          patchState(
            {
              invoiceReasons: res,
            }
          );
        }),
        catchError((err: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
        }),
      )
  }

  @Action(Invoices.GetManInvoiceMeta)
  GetInvoiceMeta(
    { patchState, dispatch }: StateContext<InvoicesModel>,
    { orgId }: Invoices.GetManInvoiceMeta,
  ): Observable<ManualInvoiceMeta[] | void> {
    return this.invoicesAPIService.getManInvoiceMeta(orgId)
      .pipe(
        tap((res) => {
          patchState({
            invoiceMeta: res,
          });
        }),
        catchError((err: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
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
  ): Observable<number[] | void> {
    return this.invoicesAPIService.saveManualInvoice(payload)
    .pipe(
      switchMap((res) => this.invoicesAPIService.saveManualInvoiceAttachments(
        files, isAgency ? res.organizationId : null,  res.timesheetId,)),
      tap(() => {
        ctx.dispatch([
          new ShowToast(MessageTypes.Success, ManualInvoiceMessages.successAdd),
          new Invoices.GetManualInvoices(payload.organizationId),
        ]);
      }),
      catchError((err: HttpErrorResponse) => {
        return ctx.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
      }),
    );
  }

  @Action(Invoices.DeleteManualInvoice)
  DeleteManualInvoice(
    ctx: StateContext<InvoicesModel | void>,
    { id, organizationId }: Invoices.DeleteManualInvoice,
    /**
     * TODO: change return type afte invoice get implementation
     */
  ): Observable<void> {
    return this.invoicesAPIService.deleteManualInvoice(id, organizationId)
      .pipe(
        tap(() => {
          ctx.dispatch([
            new ShowToast(MessageTypes.Success, ManualInvoiceMessages.successDelete),
            new Invoices.GetManualInvoices(organizationId),
          ]);
        }),
        catchError((err: HttpErrorResponse) => {
          return ctx.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
        }),
      );
  }

  @Action(Invoices.GetOrganizations)
  GetOrganizations(
    { patchState, dispatch }: StateContext<InvoicesModel>,
  ): Observable<DataSourceItem[] | void> {
    return this.invoicesAPIService.getOrganizations()
    .pipe(
      tap((res) => {
        patchState({
          organizations: res,
        });
      }),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
      }),
    )
  }

  @Action(Invoices.GetOrganizationStructure)
  GetStructure(
    { patchState, dispatch }: StateContext<InvoicesModel>,
    { orgId, isAgency }: Invoices.GetOrganizationStructure,
  ): Observable<OrganizationStructure | void> {
    return this.invoicesAPIService.getOrgStructure(orgId, isAgency)
    .pipe(
      tap((res) => {
        patchState({
          organizationLocations: InvoiceMetaAdapter.createLocationsStructure(res.regions),
          regions: res.regions,
        });
      }),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
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

  @Action(Invoices.GetManualInvoices)
  GetManualInvoices(
    { patchState, getState, dispatch }: StateContext<InvoicesModel>,
    { organizationId }: Invoices.GetManualInvoices
  ): Observable<ManualInvoicesData | void> {
    const state = getState();

    return this.invoicesAPIService.getManualInvoices({
      ...state.invoicesFilters,
      organizationId,
    }).pipe(
      tap((data: ManualInvoicesData) => patchState({
        manualInvoicesData: data,
      })),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
      }),
    );
  }

  @Action(Invoices.GetPendingInvoices)
  GetPendingInvoices(
    { patchState, getState, dispatch }: StateContext<InvoicesModel>,
    { organizationId }: Invoices.GetPendingInvoices
  ): Observable<PendingInvoicesData | void> {
    const state = getState();

    return this.invoicesAPIService.getPendingInvoices({
      ...state.invoicesFilters,
      organizationId,
    }).pipe(
      tap((data: PendingInvoicesData) => patchState({
        pendingInvoicesData: data,
      })),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
      }),
    );
  }

  @Action(Invoices.GetPendingApproval)
  GetPendingApproval(
    { patchState, getState, dispatch }: StateContext<InvoicesModel>,
    { payload }: Invoices.GetPendingApproval
  ): Observable<PendingApprovalInvoicesData | void> {
    const state = getState();

    return this.invoicesAPIService.getPendingApproval({
      ...state.invoicesFilters,
      ...payload,
    }).pipe(
      tap((data: PendingApprovalInvoicesData) => patchState({
        pendingApprovalInvoicesData: data,
      })),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
      }),
    );
  }

  @Action(Invoices.ApproveInvoice)
  ApproveInvoice(
    { dispatch }: StateContext<InvoicesModel>,
    { invoiceId }: Invoices.ApproveInvoice
  ): Observable<void> {
    return this.invoicesService.confirmInvoiceApprove(invoiceId)
      .pipe(
        switchMap(() => this.invoicesService.approveInvoice(invoiceId)),
        catchError((err: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
        }),
      );
  }

  @Action(Invoices.ApproveInvoices)
  ApproveInvoices(
    { patchState, dispatch }: StateContext<InvoicesModel>,
    { invoiceIds }: Invoices.ApproveInvoices
  ): Observable<void> {
    return this.invoicesAPIService.bulkApprove(invoiceIds)
      .pipe(
        tap(() => dispatch([
          new ShowToast(MessageTypes.Success, 'Records has been approved'),
          new Invoices.GetManualInvoices(null),
        ])),
        catchError((error: HttpErrorResponse) => dispatch(
          new ShowToast(MessageTypes.Error, getAllErrors(error.error))
        ))
      );
  }

  @Action(Invoices.RejectInvoice)
  RejectInvoice(
    { dispatch }: StateContext<InvoicesModel>,
    { invoiceId, rejectionReason }: Invoices.RejectInvoice
  ): Observable<void> {
    return this.invoicesService.rejectInvoice(invoiceId, rejectionReason)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
      }),
    )
  }

  @Action(Invoices.PreviewAttachment)
  PreviewAttachment(
    { patchState, dispatch }: StateContext<InvoicesModel>,
    { organizationId, payload: { id, fileName } }: Invoices.PreviewAttachment
  ): Observable<void> {
    return dispatch(
      new FileViewer.Open({
        fileName,
        getPDF: () => this.manualInvoiceAttachmentsApiService.downloadPDFAttachment(id, organizationId),
        getOriginal: () => this.manualInvoiceAttachmentsApiService.downloadAttachment(id, organizationId)
      })
    );
  }

  @Action(Invoices.DownloadAttachment)
  DownloadAttachment(
    { patchState, dispatch }: StateContext<InvoicesModel>,
    { organizationId, payload: { id, fileName } }: Invoices.DownloadAttachment
  ): Observable<Blob | void> {
    return this.manualInvoiceAttachmentsApiService.downloadAttachment(id, organizationId)
      .pipe(
        tap((file: Blob) => downloadBlobFile(file, fileName)),
        catchError(() => dispatch(
          new ShowToast(MessageTypes.Error, 'File not found')
        ))
      );
  }

  @Action(Invoices.GroupInvoices)
  GroupInvoices(
    { patchState, dispatch }: StateContext<InvoicesModel>,
    { payload  }: Invoices.GroupInvoices
  ): Observable<void> {
    return this.invoicesAPIService.groupInvoices(payload)
      .pipe(
        tap(() => {
          dispatch(new ShowToast(MessageTypes.Success, 'Invoice was created successfully'));
        }),
        catchError(({ error }: HttpErrorResponse) => dispatch(
          new ShowToast(MessageTypes.Error, getAllErrors(error))
        ))
      );
  }

  @Action(Invoices.ChangeInvoiceState)
  ChangeInvoiceState(
    { patchState, dispatch }: StateContext<InvoicesModel>,
    { payload, stateId  }: Invoices.ChangeInvoiceState,
  ): Observable<void> {
    const body: InvoiceStateDto = {
      invoiceId: payload.invoiceId,
      targetState: stateId,
    }
    return this.invoicesAPIService.approvePendingApproveInvoice(body)
      .pipe(
        tap(() => {
          dispatch(new ShowToast(MessageTypes.Success, 'Invoice status was changed successfully'));
        }),
        catchError(({ error }: HttpErrorResponse) => dispatch(
          new ShowToast(MessageTypes.Error, getAllErrors(error)),
        )),
      );
  }

  @Action(Invoices.GetPrintData)
  GetPrintingData(
    { patchState, dispatch } : StateContext<InvoicesModel>,
    { body }: Invoices.GetPrintData,
  ): Observable<PrintInvoiceData[] | void> {
    return this.invoicesAPIService.getPrintData(body)
    .pipe(
      tap((res) => {
        patchState({
          printData: res,
        });
      }),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
      }),
    )
  }
}
