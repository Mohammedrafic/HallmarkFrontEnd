import { Injectable } from '@angular/core';

import { catchError, filter, forkJoin, map, mergeMap, Observable, of, switchMap, take, tap, throttleTime } from 'rxjs';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { downloadBlobFile } from '@shared/utils/file.utils';
import { MessageTypes } from '@shared/enums/message-types';
import { ConfirmService } from '@shared/services/confirm.service';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { TimesheetsModel, TimeSheetsPage, } from '../model/timesheets.model';
import { TimesheetsApiService } from '../../services/timesheets-api.service';
import { Timesheets } from '../actions/timesheets.actions';
import { TimesheetDetails } from '../actions/timesheet-details.actions';
import {
  DialogAction,
  TimesheetsTableColumns,
  TIMETHEETS_STATUSES,
  RecordFields,
  TimesheetTargetStatus,
  TimesheetsTableFiltersColumns,
} from '../../enums';
import {
  AddSuccessMessage,
  approveTimesheetDialogData,
  DefaultFiltersState,
  DefaultTimesheetCollection,
  DefaultTimesheetState,
  rejectTimesheetDialogData,
  SavedFiltersParams,
  submitTimesheetDialogData
} from '../../constants';
import {
  CandidateHoursAndMilesData,
  CandidateInfo,
  CandidateMilesData,
  DataSourceItem,
  FilterColumns,
  FilterDataSource,
  TabCountConfig,
  Timesheet,
  TimesheetAttachment,
  TimesheetAttachments,
  TimesheetDetailsModel,
  TimesheetInvoice,
  TimesheetRecordsDto,
  TimesheetsFilterState,
  TimesheetStatistics,
  DropdownOption,
} from '../../interface';
import { ShowToast } from '../../../../store/app.actions';
import { TimesheetDetailsApiService } from '../../services/timesheet-details-api.service';
import { reduceFiltersState } from '../../helpers';
import { TimesheetStatus } from '../../enums/timesheet-status.enum';

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
    private confirmService: ConfirmService,
  ) {
  }

  @Selector([TimesheetsState])
  static timesheets(state: TimesheetsModel): TimeSheetsPage | null {
    return state.timesheets;
  }

  @Selector([TimesheetsState])
  static timesheetsFilters(state: TimesheetsModel): TimesheetsFilterState | null {
    return state.timesheetsFilters;
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
  static timeSheetAttachments(state: TimesheetsModel): TimesheetAttachment[] {
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
  static timesheetsFiltersColumns(state: TimesheetsModel): FilterColumns {
    return state.timesheetsFiltersColumns;
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
  static timesheetDetailsChartsVisible(state: TimesheetsModel): boolean {
    if (state?.timesheetDetails) {
      const { weekMiles = 0, cumulativeMiles = 0} = state.timesheetDetails.timesheetStatistic;
      return weekMiles + cumulativeMiles > 0;
    }

    return false;
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

  @Action(Timesheets.GetAll)
  GetTimesheets(
    { patchState, getState }: StateContext<TimesheetsModel>,
  ): Observable<TimeSheetsPage> {
    patchState({
      timesheets: DefaultTimesheetCollection,
    });

    const filters = getState().timesheetsFilters || {};

    return this.timesheetsApiService.getTimesheets(filters)
      .pipe(
        tap((res) => {
          patchState({
            timesheets: res,
          });
        }));
  }

  @Action(Timesheets.UpdateFiltersState)
  UpdateFiltersState(
    { setState, getState }: StateContext<TimesheetsModel>,
    { payload }: Timesheets.UpdateFiltersState,
  ): Observable<null> {
    const oldFilters: TimesheetsFilterState = getState().timesheetsFilters || DefaultFiltersState;
    let filters: TimesheetsFilterState = reduceFiltersState(oldFilters, SavedFiltersParams);

    filters = Object.assign({}, filters, payload);

    return of(null).pipe(
      throttleTime(100),
      tap(() => setState(patch<TimesheetsModel>({
        timesheetsFilters: payload ? filters : DefaultFiltersState,
      })))
    );
  }

  @Action(Timesheets.GetTabsCounts)
  GetTabsCounts({ patchState }: StateContext<TimesheetsModel>): Observable<TabCountConfig> {
    return this.timesheetsApiService.getTabsCounts()
      .pipe(
        tap((res) => patchState({
          tabCounts: res,
        }))
      );
  }

  @Action(TimesheetDetails.GetTimesheetRecords)
  GetTimesheetRecords(
    { patchState }: StateContext<TimesheetsModel>,
    { id, orgId, isAgency }: TimesheetDetails.GetTimesheetRecords
  ): Observable<TimesheetRecordsDto> {
    return this.timesheetsApiService.getTimesheetRecords(id, orgId, isAgency)
    .pipe(
      tap((res) => {
        patchState({
          timeSheetRecords: res,
        });
      }),
    )
  }

  @Action(TimesheetDetails.PutTimesheetRecords)
  PutTimesheetRecords(
    ctx: StateContext<TimesheetsModel>,
    { body, isAgency }: TimesheetDetails.PutTimesheetRecords,
  ): Observable<TimesheetRecordsDto> {
    return this.timesheetsApiService.putTimesheetRecords(body)
    .pipe(
      switchMap(() => {
        const state = ctx.getState();
        const { id, organizationId } = state.selectedTimeSheet as Timesheet;
        return this.store.dispatch(new TimesheetDetails.GetTimesheetRecords(id, organizationId, isAgency));
      }),
    )
  }

  @Action(Timesheets.DeleteProfileTimesheet)
  DeleteProfileTimesheet(
    ctx: StateContext<TimesheetsModel>,
    { profileId, profileTimesheetId }: Timesheets.DeleteProfileTimesheet
  ): Observable<null> {
    return this.timesheetsApiService.deleteProfileTimesheets(profileId, profileTimesheetId);
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
  ): Observable<[void, void]> {
    return this.timesheetDetailsApiService.getTimesheetDetails(timesheetId, orgId, isAgency)
      .pipe(
        map((data: TimesheetDetailsModel) =>{
          // TODO: remove
          data.attachments = [
            {
              id: 23,
              fileName: 'Test',
            }
          ];
          return data;
        }),
        tap((res: TimesheetDetailsModel) => ctx.patchState({
            timesheetDetails: res,
          }),
        ),
        mergeMap((res) => forkJoin([
          ctx.dispatch(new TimesheetDetails.GetBillRates(res.jobId, orgId, isAgency)),
          ctx.dispatch(new TimesheetDetails.GetCostCenters(res.jobId, orgId, isAgency)),
        ])),
      );
  }

  @Action(TimesheetDetails.AgencySubmitTimesheet)
  SubmitTimesheet(
    { getState, patchState }: StateContext<TimesheetsModel>,
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
    { getState, patchState }: StateContext<TimesheetsModel>,
    { id, orgId }: TimesheetDetails.OrganizationApproveTimesheet
  ): Observable<void> {
    return this.timesheetDetailsApiService.changeTimesheetStatus({
      timesheetId: id,
      organizationId: orgId,
      targetStatus: TimesheetTargetStatus.Approved,
      reason: null,
    });
  }

  @Action(TimesheetDetails.ChangeTimesheetStatus)
  ChangeTimesheetStatus(
    {}: StateContext<TimesheetsModel>,
    { payload }: TimesheetDetails.ChangeTimesheetStatus
  ): Observable<void> {
    return this.timesheetDetailsApiService.changeTimesheetStatus(payload);
  }

  @Action(TimesheetDetails.Export)
  ExportTimesheetDetails({}: StateContext<TimesheetsModel>, { payload }: TimesheetDetails.Export): Observable<Blob> {
    return this.timesheetDetailsApiService.export(payload)
      .pipe(
        tap((file: Blob) => {
          downloadBlobFile(file, `empty.${payload.exportFileType === ExportedFileType.csv ? 'csv' : 'xlsx'}`);
        })
      );
  }

  @Action(TimesheetDetails.UploadFiles)
  TimesheetUploadAttachments(
    { getState, patchState }: StateContext<TimesheetsModel>,
    { payload: { timesheetId, files, organizationId } }: TimesheetDetails.UploadFiles
  ): Observable<void> {
    return (organizationId ? this.timesheetDetailsApiService.agencyUploadFiles(timesheetId, organizationId, files)
      : this.timesheetDetailsApiService.organizationUploadFiles(timesheetId, files));
  }

  @Action(TimesheetDetails.DeleteAttachment)
  DeleteTimesheetAttachment(
    { getState, patchState }: StateContext<TimesheetsModel>,
    { payload }: TimesheetDetails.DeleteAttachment
  ): Observable<void> {
    return this.timesheetDetailsApiService.deleteAttachment(payload);
  }

  @Action(Timesheets.SetFiltersDataSource)
  SetFiltersDataSource(
    { setState }: StateContext<TimesheetsModel>,
    { payload }: Timesheets.SetFiltersDataSource
  ): Observable<FilterDataSource> {
    return this.timesheetsApiService.setDataSources(payload)
      .pipe(
        tap((res: FilterDataSource) => {
          Object.keys(res).forEach((key: string) => {
            setState(patch({
              timesheetsFiltersColumns: patch({
                [key]: patch({
                  dataSource: res[key as TimesheetsTableFiltersColumns],
                })
              })
            }))
          });
        })
      );
  }

  @Action(TimesheetDetails.GetBillRates)
  GetBillRates({ patchState }: StateContext<TimesheetsModel>,
      { jobId, orgId, isAgency }: TimesheetDetails.GetBillRates): Observable<DropdownOption[]> {
      return this.timesheetsApiService.getCandidateBillRates(jobId, orgId, isAgency)
      .pipe(
        tap((res) => patchState({
          billRateTypes: res,
        })),
      );
    }

  @Action(TimesheetDetails.GetCostCenters)
  GetCostCenters({ patchState }: StateContext<TimesheetsModel>,
    { jobId, orgId, isAgency}: TimesheetDetails.GetCostCenters,
  ) {
    return this.timesheetsApiService.getCandidateCostCenters(jobId, orgId, isAgency)
    .pipe(
      tap((res) => patchState({
        costCenterOptions: res,
      })),
    );
  }

  @Action(TimesheetDetails.DownloadAttachment)
  DownloadAttachment(
    { }: StateContext<TimesheetsModel>,
    { payload }: TimesheetDetails.DownloadAttachment
  ): Observable<Blob> {
    return this.timesheetDetailsApiService.downloadAttachment(payload)
      .pipe(
        tap((file: Blob) => this.store.dispatch(new TimesheetDetails.FileLoaded(file))),
        catchError(() => this.store.dispatch(
          new ShowToast(MessageTypes.Error, 'File not found'))
        ),
      );
  }

  @Action(TimesheetDetails.NoWorkPerformed)
  NoWorkPerformed(
    { }: StateContext<TimesheetsModel>,
    { timesheetId, organizationId }: TimesheetDetails.NoWorkPerformed
  ): Observable<void> {
    return this.timesheetDetailsApiService.noWorkPerformed(timesheetId, organizationId);
  }

  @Action(Timesheets.GetOrganizations)
  GetOrganizations({ patchState }: StateContext<TimesheetsModel>): Observable<DataSourceItem[]> {
    return this.timesheetsApiService.getOrganizations()
    .pipe(
      tap((organizations: DataSourceItem[]) => patchState({ organizations })),
    );
  }
  
  @Action(TimesheetDetails.AddTimesheetRecord)
  AddTimesheetRecord(ctx: StateContext<TimesheetsModel>, { body, isAgency }: TimesheetDetails.AddTimesheetRecord) {
    return this.timesheetsApiService.addTimesheetRecord(body)
    .pipe(
      tap(() => {
        this.store.dispatch([
          new ShowToast(MessageTypes.Success, AddSuccessMessage.successMessage),
        ]);
        const state = ctx.getState();
        const { id, organizationId } = state.selectedTimeSheet as Timesheet;
        ctx.dispatch(new TimesheetDetails.GetTimesheetRecords(id, organizationId, isAgency));
      })
    )
  }
}
