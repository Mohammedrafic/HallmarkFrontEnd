import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { catchError, debounceTime, EMPTY, empty, forkJoin, mergeMap, Observable, of, switchMap, tap, throttleTime, throwError } from 'rxjs';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { downloadBlobFile } from '@shared/utils/file.utils';
import { MessageTypes } from '@shared/enums/message-types';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { DialogAction } from '@core/enums';
import { DataSourceItem, DropdownOption } from '@core/interface';

import { TimesheetsModel, TimeSheetsPage } from '../model/timesheets.model';
import { TimesheetsApiService } from '../../services';
import { Timesheets } from '../actions/timesheets.actions';
import { TimesheetDetails } from '../actions/timesheet-details.actions';
import {
  FilteringOptionsFields,
  RecordFields,
  TimesheetsTableFiltersColumns,
  TimesheetTargetStatus,
} from '../../enums';
import {
  AddSuccessMessage,
  DefaultFiltersState,
  DefaultTimesheetCollection,
  DefaultTimesheetState,
  filteringOptionsMapping,
  GetBydateErrMessage,
  PutSuccess,
  SavedFiltersParams
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
  TimesheetDetailsModel,
  TimesheetInvoice,
  TimesheetRecordsDto,
  TimesheetsFilteringOptions,
  TimesheetsFilterState,
  TimesheetStatistics
} from '../../interface';
import { ShowToast } from '../../../../store/app.actions';
import { TimesheetDetailsApiService } from '../../services';
import { getAllErrors } from '@shared/utils/error.utils';
import { reduceFiltersState } from '@core/helpers/functions.helper';

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
      cumulativeCharge
    } : null;
  }

  @Selector([TimesheetsState])
  static addDialogOpen(state: TimesheetsModel): { state: boolean, type: RecordFields, initDate: string } {
    return {
      state: state.isAddDialogOpen.action,
      type: state.isAddDialogOpen.dialogType,
      initDate: state.isAddDialogOpen.initTime,
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
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
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
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
        }),
      );
  }

  @Action(Timesheets.UpdateFiltersState)
  UpdateFiltersState(
    { setState, getState }: StateContext<TimesheetsModel>,
    { payload, saveStatuses, saveOrganizationId }: Timesheets.UpdateFiltersState,
  ): Observable<null> {
    const oldFilters: TimesheetsFilterState = getState().timesheetsFilters || DefaultFiltersState;
    const savedFiltersKeys = SavedFiltersParams.filter((key: TimesheetsTableFiltersColumns) =>
      saveStatuses || key !== TimesheetsTableFiltersColumns.StatusIds
    );
    let filters: TimesheetsFilterState = reduceFiltersState(oldFilters, savedFiltersKeys);
    filters = Object.assign({}, filters, payload);

    return of(null).pipe(
      throttleTime(100),
      tap(() =>
        setState(patch<TimesheetsModel>({
          timesheetsFilters: payload ?
            filters :
            Object.assign({}, DefaultFiltersState, saveOrganizationId && {
              organizationId: oldFilters.organizationId,
            }),
        })
      )),
    );
  }

  @Action(Timesheets.ResetFiltersState)
  ResetFiltersState(
    { setState }: StateContext<TimesheetsModel>,
  ): Observable<null> {
    return of(null).pipe(
      throttleTime(100),
      tap(() => setState(patch<TimesheetsModel>({
        timesheetsFilters: null
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
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
      }),
    )
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
        return ctx.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
      }),
    )
  }

  @Action(Timesheets.DeleteProfileTimesheet)
  DeleteProfileTimesheet(
    ctx: StateContext<TimesheetsModel>,
    { profileId, profileTimesheetId }: Timesheets.DeleteProfileTimesheet
  ): Observable<null | void> {
    return this.timesheetsApiService.deleteProfileTimesheets(profileId, profileTimesheetId)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        return ctx.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
      }),
    )
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
    { action, type, dateTime }: { action: DialogAction, type: RecordFields, dateTime: string}): void {
    patchState({
      isAddDialogOpen: {
        action: action === DialogAction.Open,
        dialogType: type,
        initTime: dateTime,
      },
    });
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
          return ctx.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
        }),
      )
  }

  @Action(TimesheetDetails.AgencySubmitTimesheet)
  SubmitTimesheet(
    {  dispatch }: StateContext<TimesheetsModel>,
    { id, orgId }: TimesheetDetails.AgencySubmitTimesheet
  ): Observable<void> {
    return this.timesheetDetailsApiService.changeTimesheetStatus({
      timesheetId: id,
      organizationId: orgId,
      targetStatus: TimesheetTargetStatus.Submitted,
      reason: null,
    })
    .pipe(
      catchError((err: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
      }),
    );
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
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
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
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
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
          return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)))
        }),
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
    { setState, getState, dispatch }: StateContext<TimesheetsModel>): Observable<TimesheetsFilteringOptions | void> {
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
      }),
      catchError((err: HttpErrorResponse) => dispatch(
        new ShowToast(MessageTypes.Error, getAllErrors(err.error)),
      )),
    );
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
              })
            })
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
      )
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
    )
  }

  @Action(Timesheets.GetOrganizations)
  GetOrganizations({ patchState, dispatch }: StateContext<TimesheetsModel>): Observable<DataSourceItem[] | void> {
    return this.timesheetsApiService.getOrganizations()
    .pipe(
      tap((organizations: DataSourceItem[]) => patchState({
        organizations,
        selectedOrganizationId: organizations[0]?.id,
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
    { timesheetIds }: Timesheets.BulkApprove
  ): Observable<void> {
    return this.timesheetsApiService.postBulkApprove(timesheetIds)
    .pipe(
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
            ctx.dispatch(new Timesheets.GetAll())
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
    )
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
                isNotExist: true,
                timesheetStatistic: {
                  cumulativeCharge: 0,
                  cumulativeHours: 0,
                  cumulativeMiles: 0,
                  weekCharge: 0,
                  weekHours: 0,
                  weekMiles: 0,
                  timesheetStatisticDetails: [],
                }
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
              }
            })
          }
          return ctx.dispatch(new ShowToast(MessageTypes.Error, GetBydateErrMessage));
        })
      );
  }
}
