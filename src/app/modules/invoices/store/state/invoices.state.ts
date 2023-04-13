import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { catchError, debounceTime, forkJoin, map, Observable, of, switchMap, throttleTime, throwError } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';

import { PageOfCollections } from '@shared/models/page.model';
import { DialogAction } from '@core/enums';
import { DataSourceItem } from '@core/interface';
import { MessageTypes } from '@shared/enums/message-types';
import { ShowToast } from 'src/app/store/app.actions';
import { Invoices } from '../actions/invoices.actions';
import {
  InvoicesApiService,
  InvoicesService,
  ManualInvoiceAttachmentsApiService,
  InvoicesFiltersService,
} from '../../services';
import {
  BaseInvoice,
  InvoiceDetail,
  InvoiceDialogActionPayload,
  InvoiceFilterColumns,
  InvoicePayment,
  InvoicePaymentData,
  InvoicesFilteringOptions,
  InvoicesFilterState,
  InvoiceStateDto,
  ManualInvoiceMeta,
  ManualInvoiceReason,
  ManualInvoicesData,
  PrintInvoiceData,
  PendingApprovalInvoice,
  PendingApprovalInvoicesData,
  PendingInvoicesData,
  InvoicesPendingInvoiceRecordsFilteringOptions,
  InvoiceManualPendingRecordsFilteringOptions,
} from '../../interfaces';
import { InvoicesModel } from '../invoices.model';
import {
  DefaultFiltersState,
  DefaultInvoicesState,
  ManualInvoiceMessages,
  SavedInvoicesFiltersParams,
} from '../../constants';
import { CreateInvoiceData, InvoiceMessageHelper, InvoiceMetaAdapter } from '../../helpers';
import { OrganizationStructure } from '@shared/models/organization.model';
import { getAllErrors } from '@shared/utils/error.utils';
import { HttpErrorResponse } from '@angular/common/http';
import { FileViewer } from '@shared/modules/file-viewer/file-viewer.actions';
import { downloadBlobFile, saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { Attachment } from '@shared/components/attachments';
import { reduceFiltersState } from '@core/helpers/functions.helper';
import { InvoiceFiltersAdapter } from '../../adapters';

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
    private invoicesFiltersService: InvoicesFiltersService
  ) {
  }

  @Selector([InvoicesState])
  static invoicesData(state: InvoicesModel): ManualInvoicesData | PendingInvoicesData | PendingApprovalInvoicesData | null {
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

  @Selector([InvoicesState])
  static isInvoiceDetailDialogOpen(state: InvoicesModel): InvoiceDialogActionPayload {
    return {
      dialogState: state.isInvoiceDetailDialogOpen,
      invoiceDetail: state.invoiceDetail,
    };
  }

  @Selector([InvoicesState])
  static nextInvoiceId(state: InvoicesModel): number | null {
    return state.nextInvoiceId;
  }

  @Selector([InvoicesState])
  static prevInvoiceId(state: InvoicesModel): number | null {
    return state.prevInvoiceId;
  }

  @Selector([InvoicesState])
  static invoiceReasons(state: InvoicesModel): ManualInvoiceReason[] {
    return state.invoiceReasons;
  }

  @Selector([InvoicesState])
  static selectedOrgId(state: InvoicesModel): number {
    return state.selectedOrganizationId;
  }

  @Selector([InvoicesState])
  static paymentDetails(state: InvoicesModel): InvoicePayment[] {
    return state.paymentDetails;
  }

  @Selector([InvoicesState])
  static invoiceDetails(state: InvoicesModel): InvoiceDetail | null {
    return state.invoiceDetail;
  }

  @Selector([InvoicesState])
  static selectedPayment(state: InvoicesModel): InvoicePaymentData | null {
    return state.selectedPayment;
  }

  @Selector([InvoicesState])
  static organizationStructure(state: InvoicesModel): OrganizationStructure | null {
    return state.organizationStructure;
  }


  @Action(Invoices.ToggleInvoiceDialog)
  ToggleInvoiceDialog(
    { patchState, dispatch }: StateContext<InvoicesModel>,
    { action, isAgency, payload, prevId, nextId }: Invoices.ToggleInvoiceDialog
  ): Observable<InvoiceDetail | void> | void {
    const isOpen = action === DialogAction.Open;

    if (!isOpen) {
      patchState({
        isInvoiceDetailDialogOpen: isOpen,
      });

      return;
    }

    return this.invoicesAPIService.getInvoicesForPrinting(payload!, !!isAgency)
    .pipe(
      map((response) => CreateInvoiceData(response[0])),
      tap((res: InvoiceDetail) => patchState({
        invoiceDetail: res,
        isInvoiceDetailDialogOpen: isOpen,
          ...(isOpen ? { prevInvoiceId: prevId, nextInvoiceId: nextId } : {}),
        })
      ),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      }),
    );
  }

  @Action(Invoices.DetailExport)
  DetailExport(
    { dispatch }: StateContext<InvoicesModel>,
    { payload }: Invoices.DetailExport
  ): Observable<Blob | void> {
    return this.invoicesAPIService.export(payload)
      .pipe(
        tap((file: Blob) => {
          downloadBlobFile(file, `empty.${payload.exportFileType === ExportedFileType.csv ? 'csv' : 'xlsx'}`);
        }),
        catchError((err: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
        }),
      );
  }

  @Action(Invoices.UpdateFiltersState)
  UpdateFiltersState(
    { setState, getState }: StateContext<InvoicesModel>,
    { payload, usePrevFiltersState }: Invoices.UpdateFiltersState,
  ): Observable<null> {
    const oldFilters: InvoicesFilterState = getState().invoicesFilters || DefaultFiltersState;
    let filters: InvoicesFilterState;

    if (!usePrevFiltersState) {
      filters = reduceFiltersState(oldFilters, SavedInvoicesFiltersParams);
      filters = Object.assign({}, filters, payload);
    } else {
      filters = Object.assign({}, oldFilters, payload);
    }

    const invoicesFilters = payload ? filters : DefaultFiltersState;

    return of(null).pipe(
      throttleTime(100),
      tap(() => {
        setState(patch<InvoicesModel>({
          invoicesFilters,
        }));
      })
    );
  }

  @Action(Invoices.ResetFiltersState)
  ResetFiltersState(
    { setState }: StateContext<InvoicesModel>,
  ): Observable<null> {
    return of(null).pipe(
      throttleTime(100),
      tap(() => setState(patch<InvoicesModel>({
        invoicesFilters: null,
      })))
    );
  }

  @Action(Invoices.GetFiltersDataSource)
  GetFiltersDataSource(
    { setState, dispatch, getState }: StateContext<InvoicesModel>,
    { orgId }: Invoices.GetFiltersDataSource,
  ): Observable<InvoicesFilteringOptions | void> {
    return this.invoicesAPIService.getFiltersDataSource(orgId).pipe(
      tap((res) => {
        const { invoiceFiltersColumns } = getState();

        setState(patch({
          invoiceFiltersColumns: patch(this.invoicesFiltersService.prepareAllFiltersDataSources(
            res,
            invoiceFiltersColumns,
          )),
        }));
      }),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      }),
    );
  }

  @Action(Invoices.GetPendingRecordsFiltersDataSource)
  GetPendingRecordsFiltersDataSource(
    { setState, dispatch, getState }: StateContext<InvoicesModel>,
  ): Observable<InvoicesPendingInvoiceRecordsFilteringOptions | void> {
    return this.invoicesAPIService.getPendingInvoicesFiltersDataSource().pipe(
      map(res => ({
        ...res,
        regions: [],
        locations: [],
        departments: [],
      })),
      tap((res) => {
        const { invoiceFiltersColumns } = getState();

        setState(patch({
          invoiceFiltersColumns: patch(this.invoicesFiltersService.preparePendingFiltersDataSources(
            res,
            invoiceFiltersColumns,
          )),
        }));
      }),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      }),
    );
  }

  @Action(Invoices.GetManualInvoiceRecordFiltersDataSource)
  GetManualInvoiceRecordFiltersDataSource(
    { setState, dispatch, getState }: StateContext<InvoicesModel>,
    { organizationId }: Invoices.GetManualInvoiceRecordFiltersDataSource
  ): Observable<InvoiceManualPendingRecordsFilteringOptions | void> {
    return this.invoicesAPIService.getManualInvoicePendingFiltersDataSource(organizationId).pipe(
      map(payload => (InvoiceFiltersAdapter.prepareDateToManualPendingInvoice(payload))),
      tap(payload => {
        const { invoiceFiltersColumns } = getState();

        setState(patch({
          invoiceFiltersColumns: patch(this.invoicesFiltersService.prepareManualPendingInvoiceFiltersDataSources(
            payload,
            invoiceFiltersColumns,
          )),
        }));
      }),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
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
              }),
            }),
          }))
        )
      );
  }

  @Action(Invoices.ToggleManualInvoiceDialog)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
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
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
        }),
      );
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
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
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
  ): Observable<number[] | HttpErrorResponse> {
    return this.invoicesAPIService.saveManualInvoice(payload)
    .pipe(
      switchMap((res) => this.invoicesAPIService.saveManualInvoiceAttachments(
        files, isAgency ? res.organizationId : null,  res.timesheetId,)),
      tap(() => {
        ctx.dispatch(new ShowToast(MessageTypes.Success, ManualInvoiceMessages.successAdd));
        const tabIdx = ctx.getState().selectedTabIdx;

        if (isAgency && tabIdx === 0) {
          ctx.dispatch(new Invoices.GetManualInvoices(payload.organizationId));
        } else {
          ctx.dispatch(new Invoices.GetPendingInvoices(payload.organizationId));
        }
      }),
      catchError((err: HttpErrorResponse) => {
        ctx.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
        return throwError(() => err);
      }),
    );
  }

  @Action(Invoices.UpdateManualInvoice)
  UpdateManualInvoice(
    ctx: StateContext<InvoicesModel>,
    { payload, files, filesToDelete, isAgency }: Invoices.UpdateManualInvoice,
  ): Observable<number[] | HttpErrorResponse> {
    const organizationId = isAgency ? payload.organizationId : null;

    return this.invoicesAPIService.updateManualInvoice(payload)
      .pipe(
        switchMap(() => forkJoin([
          this.manualInvoiceAttachmentsApiService.deleteAttachments(
            filesToDelete.map((file: Attachment) => file.id),
            payload.timesheetId,
            organizationId
          ),
          this.invoicesAPIService.saveManualInvoiceAttachments(
            files, organizationId, payload.timesheetId
          ),
        ])),
        map((ids: [number[], number[]]) => ids.flat()),
        tap(() => ctx.dispatch([
          new ShowToast(MessageTypes.Success, ManualInvoiceMessages.successEdit),
          new Invoices.GetManualInvoices(payload.organizationId),
        ])),
        catchError((err: HttpErrorResponse) => {
          ctx.dispatch(
            new ShowToast(MessageTypes.Error, getAllErrors(err.error))
          );

          return throwError(() => err);
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
          return ctx.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
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
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      }),
    );
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
          organizationStructure: res,
          organizationLocations: InvoiceMetaAdapter.createLocationsStructure(res.regions),
          regions: res.regions,
        });
      }),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      }),
    );
  }

  @Action(Invoices.ClearOrganizationStructure)
  ClearOrganizationStructure({ patchState }: StateContext<InvoicesModel>): InvoicesModel {
    return patchState({ organizationStructure: null });
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
      tap((data: ManualInvoicesData) => {
        patchState({
          manualInvoicesData: data,
        });
        patchState({
          invoicesData: data,
        });
      }),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
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
      tap((data: PendingInvoicesData) => {
        patchState({
          pendingInvoicesData: data,
        });
        patchState({
          invoicesData: data,
        });
      }),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      }),
    );
  }

  @Action(Invoices.GetPendingApproval)
  GetPendingApproval(
    { patchState, getState, dispatch }: StateContext<InvoicesModel>,
    { payload }: Invoices.GetPendingApproval
  ): Observable<PendingApprovalInvoicesData | void> {
    const { invoicesFilters } = getState();

    return this.invoicesAPIService.getPendingApproval({
      ...invoicesFilters,
      ...payload,
    },
      getState().isAgencyArea,
    ).pipe(
      tap((data: PendingApprovalInvoicesData) => {
        patchState({
          pendingApprovalInvoicesData: data,
        });
        patchState({
          invoicesData: data,
        });
      }),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
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
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
        }),
      );
  }

  @Action(Invoices.ApproveInvoices)
  ApproveInvoices(
    { dispatch }: StateContext<InvoicesModel>,
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
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      }),
    );
  }

  @Action(Invoices.PreviewAttachment)
  PreviewAttachment(
    { dispatch }: StateContext<InvoicesModel>,
    { organizationId, payload: { id, fileName } }: Invoices.PreviewAttachment
  ): Observable<void> {
    return dispatch(
      new FileViewer.Open({
        fileName,
        getPDF: () => this.manualInvoiceAttachmentsApiService.downloadPDFAttachment(id, organizationId),
        getOriginal: () => this.manualInvoiceAttachmentsApiService.downloadAttachment(id, organizationId),
      })
    );
  }

  @Action(Invoices.DownloadAttachment)
  DownloadAttachment(
    { dispatch }: StateContext<InvoicesModel>,
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

  @Action(Invoices.DeleteAttachment)
  DeleteAttachment(
    { dispatch }: StateContext<InvoicesModel>,
    { invoiceId, fileId, organizationId }: Invoices.DeleteAttachment
  ): Observable<number | void> {
    return this.manualInvoiceAttachmentsApiService.deleteAttachment(fileId, invoiceId, organizationId)
      .pipe(
        tap(() => dispatch(
          new ShowToast(MessageTypes.Success, 'File successfully deleted')
        )),
        catchError(() => dispatch(
          new ShowToast(MessageTypes.Error, 'File not found')
        ))
      );
  }

  @Action(Invoices.PreviewMilesAttachment)
  PreviewMilesAttachment(
    { dispatch }: StateContext<InvoicesModel>,
    { invoiceId, organizationId, payload: { id, fileName } }: Invoices.PreviewMilesAttachment
  ): Observable<Blob | void> {
    return dispatch(
      new FileViewer.Open({
        fileName,
        getPDF: () => this.manualInvoiceAttachmentsApiService.downloadMilesPDFAttachment(invoiceId, id, organizationId),
        getOriginal: () => this.manualInvoiceAttachmentsApiService.downloadMilesAttachment(invoiceId, id, organizationId),
      })
    );
  }

  @Action(Invoices.DownloadMilesAttachment)
  DownloadMilesAttachment(
    { dispatch }: StateContext<InvoicesModel>,
    { invoiceId, organizationId, payload: { id, fileName } }: Invoices.DownloadMilesAttachment
  ): Observable<Blob | void> {
    return this.manualInvoiceAttachmentsApiService.downloadMilesAttachment(invoiceId, id, organizationId)
      .pipe(
        tap((file: Blob) => downloadBlobFile(file, fileName)),
        catchError(() => dispatch(
          new ShowToast(MessageTypes.Error, 'File not found')
        ))
      );
  }

  @Action(Invoices.GroupInvoices)
  GroupInvoices(
    { dispatch }: StateContext<InvoicesModel>,
    { payload  }: Invoices.GroupInvoices
  ): Observable<PendingApprovalInvoice[] | void> {
    return this.invoicesAPIService.groupInvoices(payload)
      .pipe(
        tap((res) => {
          dispatch(new ShowToast(MessageTypes.Success,
            `Invoice ${InvoiceMessageHelper.getInvoiceIds(res)} was created successfully`));
        }),
        catchError(({ error }: HttpErrorResponse) => dispatch(
          new ShowToast(MessageTypes.Error, getAllErrors(error))
        ))
      );
  }

  @Action(Invoices.ChangeInvoiceState)
  ChangeInvoiceState(
    { dispatch }: StateContext<InvoicesModel>,
    { invoiceId, stateId, orgId }: Invoices.ChangeInvoiceState,
  ): Observable<PendingApprovalInvoice | void> {
    const body: InvoiceStateDto = {
      invoiceId,
      targetState: stateId,
      organizationId: orgId,
    };

    return this.invoicesAPIService.changeInvoiceStatus(body)
      .pipe(
        tap((res) => {
          dispatch(new ShowToast(MessageTypes.Success, `Invoice ${res.formattedInvoiceId} status was changed successfully`));
        }),
        catchError(({ error }: HttpErrorResponse) => dispatch(
          new ShowToast(MessageTypes.Error, getAllErrors(error)),
        )),
      );
  }

  @Action(Invoices.GetPrintData)
  GetPrintingData(
    { patchState, dispatch }: StateContext<InvoicesModel>,
    { body, isAgency }: Invoices.GetPrintData,
  ): Observable<PrintInvoiceData[] | void> {
    return this.invoicesAPIService.getPrintData(body, isAgency)
    .pipe(
      tap((res) => {
        patchState({
          printData: res,
        });
      }),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      }),
    );
  }

  @Action(Invoices.SetIsAgencyArea)
  SetIsAgencyArea(
    { patchState }: StateContext<InvoicesModel>,
  { isAgency }: Invoices.SetIsAgencyArea
  ): void {
    patchState({
      isAgencyArea: isAgency,
    });
  }

  @Action(Invoices.SetInvoicePermissions)
  SetPermissions(
    { patchState, getState }: StateContext<InvoicesModel>,
    { payload }: Invoices.SetInvoicePermissions,
  ): void {
    const state = getState();

    patchState({
      permissions: {
        ...state.permissions,
        ...payload,
      },
    });
  }

  @Action(Invoices.SetTabIndex)
  SetTabIndex(
    { patchState }: StateContext<InvoicesModel>,
    { index }: Invoices.SetTabIndex,
  ): void {
    patchState({
      selectedTabIdx: index,
    });
  }

  @Action(Invoices.SavePayment)
  SavePayment(
    { dispatch }: StateContext<InvoicesModel>,
    { payload }: Invoices.SavePayment,
  ): Observable<void> {
    return this.invoicesAPIService.savePayment(payload)
    .pipe(
      tap(() => { dispatch(new ShowToast(MessageTypes.Success, 'Payment was saved successfully')); }),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      }),
    );
  }

  @Action(Invoices.OpenPaymentAddDialog)
  OpenPaymentDialog(
    { patchState }: StateContext<InvoicesModel>,
    { payload }: Invoices.OpenPaymentAddDialog,
  ): void {
    patchState({
      selectedPayment: payload,
    });
  }

  @Action(Invoices.ExportInvoices)
  ExportInvoices(
    { dispatch }: StateContext<InvoicesModel>,
    { payload, isAgency}: Invoices.ExportInvoices
  ): Observable<void | Blob> {
    return this.invoicesAPIService.exportInvoices(payload, isAgency).pipe(
      tap((file: Blob) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      }),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      }),
    );
  }
}
