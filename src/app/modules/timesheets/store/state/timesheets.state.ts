import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { catchError, debounceTime, forkJoin, mergeMap, Observable, of, switchMap, tap } from 'rxjs';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { RowNode } from '@ag-grid-community/core';
import { downloadBlobFile, saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { MessageTypes } from '@shared/enums/message-types';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ConfirmService } from '@shared/services/confirm.service';
import { getAllErrors } from '@shared/utils/error.utils';
import { FileViewer } from '@shared/modules/file-viewer/file-viewer.actions';
import { DialogAction } from '@core/enums';
import { reduceFiltersState } from '@core/helpers/functions.helper';
import { DataSourceItem, DropdownOption } from '@core/interface';

import { TimesheetsModel, TimeSheetsPage } from '../model/timesheets.model';
import { TimesheetDetailsApiService, TimesheetsApiService } from '../../services';
import { Timesheets } from '../actions/timesheets.actions';
import { TimesheetDetails } from '../actions/timesheet-details.actions';
import {
  FilteringOptionsFields,
  TimesheetsTableFiltersColumns,
  TimesheetTargetStatus,
} from '../../enums';
import {
  AddSuccessMessage, BulkApproveSuccessMessage, DefaultFiltersState, DefaultTimesheetCollection, DefaultTimesheetState,
  filteringOptionsMapping, GetBydateErrMessage, PutSuccess, SavedFiltersParams, TimesheetConfirmMessages,
} from '../../constants';
import {
  AddMileageDto,
  Attachment,
  CandidateHoursAndMilesData,
  CandidateInfo,
  CandidateMilesData,
  FilterColumns,
  TabCountConfig,
  Timesheet,
  TimesheetDetailsAddDialogState,
  TimesheetDetailsModel,
  TimesheetInvoice,
  TimesheetRecordsDto,
  TimesheetsFilteringOptions,
  TimesheetsFilterState,
  TimesheetStatistics,
  UploadDialogState,
} from '../../interface';
import { ShowToast } from '../../../../store/app.actions';
import { TimesheetStatus } from '../../enums/timesheet-status.enum';
import { filter } from 'rxjs/operators';

@State<TimesheetsModel>({
  name: 'timesheets',
  defaults: DefaultTimesheetState,
})
@Injectable()
export class TimesheetsState {
  constructor(
    private timesheetsApiService: TimesheetsApiService,
    private timesheetDetailsApiService: TimesheetDetailsApiService,
    private store: Store,
    private confirmService: ConfirmService
  ) {}

  @Selector([TimesheetsState])
  static timesheets(state: TimesheetsModel): TimeSheetsPage | null {
    return state.timesheets;
  }

  @Selector([TimesheetsState])
  static loading(state: TimesheetsModel): boolean {
    return state.loading;
  }

  @Selector([TimesheetsState])
  static timesheetsFilters(state: TimesheetsModel): TimesheetsFilterState | null {
    return state.timesheetsFilters;
  }

  @Selector([TimesheetsState])
  static timesheetsFiltersColumns(state: TimesheetsModel): FilterColumns {
    return state.timesheetsFiltersColumns;
  }

  @Selector([TimesheetsState])
  static filterOptions(state: TimesheetsModel): TimesheetsFilteringOptions | null {
    return state.filterOptions;
  }

  @Selector([TimesheetsState])
  static isTimesheetOpen(state: TimesheetsModel): boolean {
    return state.isTimeSheetOpen;
  }

  @Selector([TimesheetsState])
  static selectedTimeSheet(state: TimesheetsModel): Timesheet | null {
    return state.selectedTimeSheet;
  }

  @Selector([TimesheetsState])
  static tabCounts(state: TimesheetsModel): TabCountConfig | null {
    return state.tabCounts;
  }

  @Selector([TimesheetsState])
  static tmesheetRecords(state: TimesheetsModel): TimesheetRecordsDto {
    return state.timeSheetRecords;
  }

  @Selector([TimesheetsState])
  static candidateInfo(state: TimesheetsModel): CandidateInfo | null {
    return state.candidateInfo;
  }

  @Selector([TimesheetsState])
  static candidateHoursAndMilesData(state: TimesheetsModel): CandidateHoursAndMilesData | null {
    return state.candidateHoursAndMilesData;
  }

  @Selector([TimesheetsState])
  static timeSheetAttachments(state: TimesheetsModel): Attachment[] {
    return state.candidateAttachments.attachments;
  }

  @Selector([TimesheetsState])
  static timeSheetInvoices(state: TimesheetsModel): TimesheetInvoice[] {
    return state.candidateInvoices;
  }

  @Selector([TimesheetsState])
  static billRateTypes(state: TimesheetsModel): unknown {
    return state.billRateTypes;
  }

  @Selector([TimesheetsState])
  static timesheetDetails(state: TimesheetsModel): TimesheetDetailsModel | null {
    return state.timesheetDetails;
  }

  @Selector([TimesheetsState])
  static timesheetDetailsMilesStatistics(state: TimesheetsModel): CandidateMilesData | null {
    const statistics: TimesheetStatistics | null = state?.timesheetDetails?.timesheetStatistic ?? null;
    const { weekMiles = 0, cumulativeMiles = 0, weekCharge = 0, cumulativeCharge = 0 } = statistics || {};

    return weekMiles || cumulativeMiles || weekCharge || cumulativeCharge ? {
      weekMiles,
      cumulativeMiles,
      weekCharge,
      cumulativeCharge,
    } : null;
  }

  @Selector([TimesheetsState])
  static addDialogOpen(state: TimesheetsModel): TimesheetDetailsAddDialogState {
    return {
      state: state.isAddDialogOpen.action,
      type: state.isAddDialogOpen.dialogType,
      startDate: state.isAddDialogOpen.startDate,
      endDate: state.isAddDialogOpen.endDate,
      orderCostCenterId: state.isAddDialogOpen.orderConstCenterId,
    };
  }

  @Selector([TimesheetsState])
  static uploadDialogOpen(state: TimesheetsModel): UploadDialogState {
    return {
      state: state.isUploadDialogOpen.action,
      itemId: state.isUploadDialogOpen.itemId,
      recordAttachments: state.isUploadDialogOpen.recordAttachments,
    };
  }

  @Selector([TimesheetsState])
  static costCenters(state: TimesheetsModel): unknown {
    return state.costCenterOptions;
  }

  @Selector([TimesheetsState])
  static organizations(state: TimesheetsModel): DataSourceItem[] {
    return state.organizations;
  }

  @Selector([TimesheetsState])
  static selectedOrganization(state: TimesheetsModel): number {
    return state.selectedOrganizationId;
  }

  @Action(Timesheets.GetAll)
  GetTimesheets(
    { patchState, getState, dispatch }: StateContext<TimesheetsModel>,
  ): Observable<TimeSheetsPage | void> {
    patchState({
      timesheets: DefaultTimesheetCollection,
      loading: true,
    });

    const filters = getState().timesheetsFilters || {};

    return this.timesheetsApiService.getTimesheets(filters)
      .pipe(
        tap((res: TimeSheetsPage) => {
          patchState({
            timesheets: res,
            loading: false,
          });

          dispatch(new Timesheets.GetTabsCounts());
        }),
        catchError((err: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
        }),
      );
  }

  @Action(Timesheets.GetTabsCounts)
  GetTabsCounts(
    { patchState, getState, dispatch }: StateContext<TimesheetsModel>,
  ): Observable<TabCountConfig | void> {
    const filters = getState().timesheetsFilters || {};

    return this.timesheetsApiService.getTabsCounts(filters)
      .pipe(
        tap((res: TabCountConfig) => {
          patchState({
            tabCounts: res,
          });
        }),
        catchError((err: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
        }),
      );
  }

  @Action(Timesheets.UpdateFiltersState)
  UpdateFiltersState(
    { setState, getState }: StateContext<TimesheetsModel>,
    { payload, saveStatuses, saveOrganizationId, usePrevFiltersState }: Timesheets.UpdateFiltersState,
  ): Observable<null> {
    const oldFilters: TimesheetsFilterState = getState().timesheetsFilters || DefaultFiltersState;

    let filters: TimesheetsFilterState;

    if (!usePrevFiltersState) {
      const savedFiltersKeys = SavedFiltersParams.filter(
        (key: TimesheetsTableFiltersColumns) => saveStatuses || key !== TimesheetsTableFiltersColumns.StatusIds
      );

      filters = reduceFiltersState(oldFilters, savedFiltersKeys);
      filters = Object.assign({}, filters, payload);
    } else {
      filters = Object.assign({}, oldFilters, payload);
    }

    const timesheetsFilters = payload ?
      filters :
      Object.assign({}, DefaultFiltersState, saveOrganizationId && {
        organizationId: oldFilters.organizationId,
      });

    return of(null).pipe(
      tap(() =>
        setState(patch<TimesheetsModel>({
          timesheetsFilters,
        })
      )),
    );
  }

  @Action(Timesheets.ResetFiltersState)
  ResetFiltersState(
    { setState }: StateContext<TimesheetsModel>,
  ): Observable<null> {
    return of(null).pipe(
      tap(() => setState(patch<TimesheetsModel>({
        timesheetsFilters: null,
      })))
    );
  }

  @Action(TimesheetDetails.GetTimesheetRecords)
  GetTimesheetRecords(
    { patchState, dispatch }: StateContext<TimesheetsModel>,
    { id, orgId, isAgency }: TimesheetDetails.GetTimesheetRecords
  ): Observable<TimesheetRecordsDto | void> {
    return this.timesheetsApiService.getTimesheetRecords(id, orgId, isAgency)
    .pipe(
      tap((res) => {
        patchState({
          timeSheetRecords: res,
        });
      }),
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      }),
    );
  }

  @Action(TimesheetDetails.PutTimesheetRecords)
  PutTimesheetRecords(
    ctx: StateContext<TimesheetsModel>,
    { body, isAgency }: TimesheetDetails.PutTimesheetRecords,
  ): Observable<TimesheetRecordsDto | void> {
    return this.timesheetsApiService.putTimesheetRecords(body)
    .pipe(
      switchMap(() => {
        const state = ctx.getState();
        const { id, organizationId } = state.timesheetDetails as TimesheetDetailsModel;
        /**
         * TODO: make all messages for toast in one constant.
         */
        ctx.dispatch(new ShowToast(MessageTypes.Success, PutSuccess.successMessage));
        ctx.dispatch(new Timesheets.GetTimesheetDetails(id, body.organizationId, isAgency));
        return ctx.dispatch(new TimesheetDetails.GetTimesheetRecords(id, organizationId, isAgency));
      }),
      catchError((err: HttpErrorResponse) => {
        return ctx.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      }),
    );
  }

  @Action(Timesheets.DeleteProfileTimesheet)
  DeleteProfileTimesheet(
    ctx: StateContext<TimesheetsModel>,
    { profileId, profileTimesheetId }: Timesheets.DeleteProfileTimesheet
  ): Observable<null | void> {
    return this.timesheetsApiService.deleteProfileTimesheets(profileId, profileTimesheetId)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        return ctx.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      }),
    );
  }

  @Action(Timesheets.ToggleCandidateDialog)
  ToggleCandidateDialog({ patchState }: StateContext<TimesheetsModel>,
    { action, timesheet }: Timesheets.ToggleCandidateDialog): void {
    patchState({
      isTimeSheetOpen: action === DialogAction.Open,
      selectedTimeSheet: timesheet,
    });
  }

  @Action(Timesheets.ToggleTimesheetAddDialog)
  ToggleAddDialog({ patchState }: StateContext<TimesheetsModel>,
    { action, type, startDate, endDate, orderConstCenterId }: Timesheets.ToggleTimesheetAddDialog): void {
    patchState({
      isAddDialogOpen: {
        action: action === DialogAction.Open,
        dialogType: type,
        startDate: startDate,
        endDate: endDate,
        orderConstCenterId: orderConstCenterId,
      },
    });
  }

  @Action(Timesheets.ToggleTimesheetUploadAttachmentsDialog)
  ToggleTimesheetUploadAttachmentsDialog({ patchState }: StateContext<TimesheetsModel>,
    { action, timesheetAttachments }: Timesheets.ToggleTimesheetUploadAttachmentsDialog): void {
    patchState({
      isUploadDialogOpen: {
        action: action === DialogAction.Open,
        itemId: timesheetAttachments?.id as number || null,
        recordAttachments: timesheetAttachments?.attachments || null,
      },
    });
  }

  @Action(Timesheets.UploadMilesAttachments)
  UploadMilesAttachments(
    { getState }: StateContext<TimesheetsModel>,
    { files, organizationId }: Timesheets.UploadMilesAttachments
  ): Observable<void> | void {
    const { itemId } = getState().isUploadDialogOpen;

    if (!files?.length) {
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file.blob, file.fileName));

    return this.timesheetsApiService.uploadMilesAttachments(itemId, formData, organizationId);
  }

  @Action(Timesheets.DeleteMilesAttachment)
  DeleteMilesAttachment(
    { getState }: StateContext<TimesheetsModel>,
    { fileId, organizationId }: Timesheets.DeleteMilesAttachment
  ): Observable<void> {
    const { itemId } = getState().isUploadDialogOpen;

    return this.timesheetsApiService.deleteMilesAttachment(itemId, fileId, organizationId);
  }

  @Action(Timesheets.GetTimesheetDetails)
  GetTimesheetDetails(
    ctx: StateContext<TimesheetsModel>,
    { timesheetId, orgId, isAgency }: Timesheets.GetTimesheetDetails
  ): Observable<[void, void] | void> {
    return this.timesheetDetailsApiService.getTimesheetDetails(timesheetId, orgId, isAgency)
      .pipe(
        tap((res: TimesheetDetailsModel) => ctx.patchState({
            timesheetDetails: res,
          }),
        ),
        mergeMap((res) => forkJoin([
          ctx.dispatch(new TimesheetDetails.GetBillRates(res.jobId, orgId, isAgency)),
          ctx.dispatch(new TimesheetDetails.GetCostCenters(res.jobId, orgId, isAgency)),
        ])),
        catchError((err: HttpErrorResponse) => {
          ctx.patchState({
            timesheetDetails: null,
          });

          return ctx.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
        }),
      );
  }

  @Action(TimesheetDetails.AgencySubmitTimesheet)
  SubmitTimesheet(
    ctx: StateContext<TimesheetsModel>,
    { id, orgId }: TimesheetDetails.AgencySubmitTimesheet
  ): Observable<void> {
    return this.timesheetDetailsApiService.changeTimesheetStatus({
      timesheetId: id,
      organizationId: orgId,
      targetStatus: TimesheetTargetStatus.Submitted,
      reason: null,
    });
  }

  @Action(TimesheetDetails.OrganizationApproveTimesheet)
  ApproveTimesheet(
    { dispatch }: StateContext<TimesheetsModel>,
    { id, orgId }: TimesheetDetails.OrganizationApproveTimesheet
  ): Observable<void> {
    return this.timesheetDetailsApiService.changeTimesheetStatus({
      timesheetId: id,
      organizationId: orgId,
      targetStatus: TimesheetTargetStatus.Approved,
      reason: null,
    })
    .pipe(
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      }),
    );
  }

  @Action(TimesheetDetails.ChangeTimesheetStatus)
  ChangeTimesheetStatus(
    { dispatch }: StateContext<TimesheetsModel>,
    { payload }: TimesheetDetails.ChangeTimesheetStatus
  ): Observable<void> {
    return this.timesheetDetailsApiService.changeTimesheetStatus(payload)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      }),
    );
  }

  @Action(TimesheetDetails.Export)
  ExportTimesheetDetails({ dispatch }: StateContext<TimesheetsModel>,
    { payload }: TimesheetDetails.Export): Observable<Blob | void> {
    return this.timesheetDetailsApiService.export(payload)
      .pipe(
        tap((file: Blob) => {
          downloadBlobFile(file, `empty.${payload.exportFileType === ExportedFileType.csv ? 'csv' : 'xlsx'}`);
        }),
        catchError((err: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
        }),
      );
  }

  @Action(Timesheets.PreviewAttachment)
  PreviewAttachment(
    { dispatch }: StateContext<TimesheetsModel>,
    { timesheetRecordId, organizationId, payload: { id, fileName } }: Timesheets.PreviewAttachment
  ): Observable<void> {
    return dispatch(
      new FileViewer.Open({
        fileName,
        getPDF: () => this.timesheetDetailsApiService.downloadRecordPDFAttachment({
          timesheetRecordId,
          fileId: id,
          organizationId,
        }),
        getOriginal: () => this.timesheetDetailsApiService.downloadRecordAttachment({
          timesheetRecordId,
          fileId: id,
          organizationId,
        }),
      })
    );
  }

  @Action(Timesheets.DownloadRecordAttachment)
  DownloadRecordAttachment(
    { dispatch }: StateContext<TimesheetsModel>,
    { timesheetRecordId, organizationId, payload: { id, fileName } }: Timesheets.DownloadRecordAttachment
  ): Observable<void | Blob> {
    return this.timesheetDetailsApiService.downloadRecordAttachment({
      timesheetRecordId, fileId: id, organizationId,
    }).pipe(
      tap((file: Blob) => downloadBlobFile(file, fileName)),
      catchError(() => dispatch(
        new ShowToast(MessageTypes.Error, 'File not found')
      ))
    );
  }

  @Action(Timesheets.DeleteRecordAttachment)
  DeleteRecordAttachment(
    { dispatch }: StateContext<TimesheetsModel>,
    { timesheetRecordId, organizationId, payload: { id } }: Timesheets.DeleteRecordAttachment
  ): Observable<void | Blob> {
    return this.timesheetDetailsApiService.deleteRecordAttachment({
      timesheetId: timesheetRecordId,
      fileId: id,
      organizationId,
    }).pipe(
      catchError(() => dispatch(
        new ShowToast(MessageTypes.Error, 'File not found')
      )),
    );
  }

  @Action(TimesheetDetails.UploadFiles)
  TimesheetUploadAttachments(
    { dispatch }: StateContext<TimesheetsModel>,
    { payload: { timesheetId, files, organizationId } }: TimesheetDetails.UploadFiles
  ): Observable<void> {
    return (organizationId ? this.timesheetDetailsApiService.agencyUploadFiles(timesheetId, organizationId, files)
      : this.timesheetDetailsApiService.organizationUploadFiles(timesheetId, files))
      .pipe(
        catchError((err: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
        }),
      );
  }

  @Action(TimesheetDetails.DeleteAttachment)
  DeleteTimesheetAttachment(
    { dispatch }: StateContext<TimesheetsModel>,
    { payload }: TimesheetDetails.DeleteAttachment
  ): Observable<void> {
    return this.timesheetDetailsApiService.deleteAttachment(payload)
      .pipe(
        catchError(() => dispatch(
          new ShowToast(MessageTypes.Error, 'File not found')
        )),
      );
  }

  @Action(Timesheets.GetFiltersDataSource)
  GetFiltersDataSource(
    { setState, getState, dispatch, patchState }: StateContext<TimesheetsModel>): Observable<TimesheetsFilteringOptions | void> {
    const selectedOrganizationId = getState().selectedOrganizationId;

    return this.timesheetsApiService.getFiltersDataSource(selectedOrganizationId).pipe(
      tap((res) => {
        setState(patch({
          timesheetsFiltersColumns: patch(Object.keys(res).reduce((acc: any, key) => {
            acc[filteringOptionsMapping.get((key as FilteringOptionsFields)) as TimesheetsTableFiltersColumns] = patch({
              dataSource: res[key as FilteringOptionsFields],
            });
            return acc;
          }, {})),
        }));
        patchState({filterOptions: res});
      }),
      catchError((err: HttpErrorResponse) => dispatch(
        new ShowToast(MessageTypes.Error, getAllErrors(err.error)),
      )),
    );
  }

  @Action(Timesheets.ResetFilterOptions)
  SetFilterColumnDataSource({ patchState }: StateContext<TimesheetsModel>): TimesheetsModel {
    return patchState({ filterOptions: null });
  }

  @Action(Timesheets.SetFiltersDataSource)
  SetFiltersDataSource(
    { setState }: StateContext<TimesheetsModel>,
    { columnKey, dataSource }: Timesheets.SetFiltersDataSource
  ): Observable<null> {
    return of(null)
      .pipe(
        debounceTime(100),
        tap(() =>
          setState(patch({
            timesheetsFiltersColumns: patch({
              [columnKey]: patch({
                dataSource: dataSource,
              }),
            }),
          }))
        )
      );
  }

  @Action(TimesheetDetails.GetBillRates)
  GetBillRates({ patchState, dispatch }: StateContext<TimesheetsModel>,
      { jobId, orgId, isAgency }: TimesheetDetails.GetBillRates): Observable<DropdownOption[] | void> {
      return this.timesheetsApiService.getCandidateBillRates(jobId, orgId, isAgency)
      .pipe(
        tap((res) => patchState({
          billRateTypes: res,
        })),
        catchError((err: HttpErrorResponse) => dispatch(
          new ShowToast(MessageTypes.Error, getAllErrors(err.error)),
        )),
      );
    }

  @Action(TimesheetDetails.GetCostCenters)
  GetCostCenters({ patchState, dispatch }: StateContext<TimesheetsModel>,
    { jobId, orgId, isAgency}: TimesheetDetails.GetCostCenters,
  ): Observable<DropdownOption[] | void> {
    return this.timesheetsApiService.getCandidateCostCenters(jobId, orgId, isAgency)
    .pipe(
      tap((res) => patchState({
        costCenterOptions: res,
      })),
      catchError((err: HttpErrorResponse) => dispatch(
        new ShowToast(MessageTypes.Error, getAllErrors(err.error)),
      )),
    );
  }

  @Action(TimesheetDetails.DownloadAttachment)
  DownloadAttachment(
    { dispatch }: StateContext<TimesheetsModel>,
    { payload }: TimesheetDetails.DownloadAttachment
  ): Observable<Blob | void> {
    return this.timesheetDetailsApiService.downloadAttachment(payload)
      .pipe(
        tap((file: Blob) => downloadBlobFile(file, payload.fileName)),
        catchError((err: HttpErrorResponse) => dispatch(
          new ShowToast(MessageTypes.Error, getAllErrors(err.error))
        )),
      );
  }

  @Action(TimesheetDetails.NoWorkPerformed)
  NoWorkPerformed(
    { dispatch }: StateContext<TimesheetsModel>,
    { noWorkPerformed, timesheetId, organizationId }: TimesheetDetails.NoWorkPerformed
  ): Observable<void> {
    return this.timesheetDetailsApiService.noWorkPerformed(noWorkPerformed, timesheetId, organizationId)
    .pipe(
      catchError((err: HttpErrorResponse) => dispatch(
        new ShowToast(MessageTypes.Error, getAllErrors(err.error))
      )),
    );
  }

  @Action(Timesheets.GetOrganizations)
  GetOrganizations({ patchState, dispatch }: StateContext<TimesheetsModel>): Observable<DataSourceItem[] | void> {
    return this.timesheetsApiService.getOrganizations()
    .pipe(
      tap((organizations: DataSourceItem[]) => patchState({
        organizations,
      })),
      catchError((err: HttpErrorResponse) => dispatch(
        new ShowToast(MessageTypes.Error, getAllErrors(err.error))
      )),
    );
  }

  @Action(Timesheets.SelectOrganization)
  SelectOrganization(
    { patchState }: StateContext<TimesheetsModel>,
    { id }: Timesheets.SelectOrganization
  ): Observable<null> {
    return of(null).pipe(
      debounceTime(100),
      tap(() => patchState({
        selectedOrganizationId: id,
      }))
    );
  }

  @Action(Timesheets.BulkApprove)
  BulkApprove(
    { dispatch }: StateContext<TimesheetsModel>,
    { selectedTimesheets }: Timesheets.BulkApprove
  ): Observable<void> {
    const timesheetIds = selectedTimesheets.map((el: RowNode) => el.data.id);
    const showWarning = selectedTimesheets.some((el: RowNode) =>
      el.data.status !== TimesheetStatus.PendingApproval
      && el.data.status !== TimesheetStatus.PendingApprovalAsterix
    );

    const stream = showWarning ? this.confirmService.confirm(TimesheetConfirmMessages.confirmBulkApprove, {
      title: 'Timesheets Approval',
      okButtonLabel: 'Yes',
      okButtonClass: '',
    }) : of(true);

    return stream.pipe(
      filter(Boolean),
      switchMap(() => this.timesheetsApiService.postBulkApprove(timesheetIds)),
      tap(() => {
        dispatch([
          new ShowToast(MessageTypes.Success, BulkApproveSuccessMessage.successMessage),
          new Timesheets.GetAll(),
        ]);
      }),
      catchError((err: HttpErrorResponse) => dispatch(
        new ShowToast(MessageTypes.Error, getAllErrors(err.error))
      )),
    );
  }

  @Action(TimesheetDetails.AddTimesheetRecord)
  AddTimesheetRecord(ctx: StateContext<TimesheetsModel>,
    { body, isAgency }: TimesheetDetails.AddTimesheetRecord
  ): Observable<void> {
      const timesheetDetails = ctx.getState().timesheetDetails as TimesheetDetailsModel;

    const { organizationId, jobId, weekStartDate } = timesheetDetails;
    const creatBody: AddMileageDto = {
      organizationId: organizationId,
      jobId: jobId,
      weekStartDate: weekStartDate,
    };

    if (body.type === 2 && timesheetDetails.mileageTimesheetId) {
      body.timesheetId = timesheetDetails.mileageTimesheetId;
    }

    return (body.type === 2 && !timesheetDetails.mileageTimesheetId ?
      this.timesheetDetailsApiService.createMilesEntity(creatBody)
      .pipe(
        switchMap((data) => {
          body.timesheetId = data.timesheetId;
          return this.timesheetsApiService.addTimesheetRecord(body);
        })
      ) : this.timesheetsApiService.addTimesheetRecord(body))
      .pipe(
        tap(() => {
          const state = ctx.getState();
          const { id, organizationId } = state.timesheetDetails as TimesheetDetailsModel;

          if (body.type === 2 && !timesheetDetails.mileageTimesheetId) {
            ctx.dispatch(new Timesheets.GetAll());
          }

          ctx.dispatch([
            new ShowToast(MessageTypes.Success, AddSuccessMessage.successMessage),
            new Timesheets.GetTimesheetDetails(id, body.organizationId, isAgency),
            new TimesheetDetails.GetTimesheetRecords(id, organizationId, isAgency),
          ]);
        }),
      catchError((err: HttpErrorResponse) => {
        return ctx.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      })
    );
  }

  @Action(TimesheetDetails.GetDetailsByDate)
  GetDetailsByDate(
    ctx: StateContext<TimesheetsModel>,
    { orgId, startdate, jobId, isAgency }: TimesheetDetails.GetDetailsByDate,
  ): Observable<[void, void] | void> {
    return this.timesheetDetailsApiService.getDetailsByDate(orgId, startdate, jobId)
      .pipe(
        tap((res: TimesheetDetailsModel) => ctx.patchState({
            timesheetDetails: res,
          }),
        ),
        mergeMap((res) => forkJoin([
          ctx.dispatch(new TimesheetDetails.GetBillRates(res.jobId, orgId, isAgency)),
          ctx.dispatch(new TimesheetDetails.GetCostCenters(res.jobId, orgId, isAgency)),
        ])),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 400) {
            ctx.patchState({
              timesheetDetails: {
                ...ctx.getState().timesheetDetails as TimesheetDetailsModel,
                status: 0,
                statusText: '',
                rejectionReason: undefined,
                noWorkPerformed: false,
                canEditMileage: false,
                canEditTimesheet: false,
                canApproveMileage: false,
                canApproveTimesheet: false,
                canUploadFiles: false,
                isNotExist: true,
                timesheetStatistic: {
                  cumulativeCharge: 0,
                  cumulativeHours: 0,
                  cumulativeMiles: 0,
                  weekCharge: 0,
                  weekHours: 0,
                  weekMiles: 0,
                  timesheetStatisticDetails: [],
                },
              },
              timeSheetRecords: {
                timesheets: {
                  editMode: [],
                  viewMode: [],
                },
                miles: {
                  editMode: [],
                  viewMode: [],
                },
                expenses: {
                  editMode: [],
                  viewMode: [],
                },
              },
            });
          }
          return ctx.dispatch(new ShowToast(MessageTypes.Error, GetBydateErrMessage));
        })
      );
  }
  @Action(Timesheets.ExportTimesheets)
  ExportTimeSheets(
    { dispatch }: StateContext<TimesheetsModel>,
    { payload}: Timesheets.ExportTimesheets
  ): Observable<void | Blob> {
    return this.timesheetsApiService.exportTimeSheets(payload).pipe(
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
