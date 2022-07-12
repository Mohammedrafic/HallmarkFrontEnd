import { Injectable } from '@angular/core';

import { filter, Observable, of, switchMap, take, tap, throttleTime } from 'rxjs';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

import { downloadBlobFile } from '@shared/utils/file.utils';
import { TimesheetsModel, TimeSheetsPage, } from '../model/timesheets.model';
import { TimesheetsApiService } from '../../services/timesheets-api.service';
import { Timesheets } from '../actions/timesheets.actions';
import { TimesheetDetails } from '../actions/timesheet-details.actions';
import { DialogAction, TimesheetsTableColumns, TIMETHEETS_STATUSES } from '../../enums';
import {
  approveTimesheetDialogData,
  DefaultFiltersState,
  DefaultTimesheetState,
  submitTimesheetDialogData
} from '../../constants';
import {
  CandidateHoursAndMilesData,
  CandidateInfo,
  DialogActionPayload,
  FilterColumns,
  FilterDataSource,
  TabCountConfig,
  Timesheet,
  TimesheetAttachments,
  TimesheetRecordsDto,
  TimesheetsFilterState,
  TimesheetUploadedFile
} from '../../interface';
import { ProfileTimesheetService } from '../../services/profile-timesheet.service';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { ConfirmService } from '@shared/services/confirm.service';
import { TimesheetDetailsApiService } from '../../services/timesheet-details-api.service';

@State<TimesheetsModel>({
  name: 'timesheets',
  defaults: DefaultTimesheetState,
})
@Injectable()
export class TimesheetsState {
  constructor(
    private timesheetsApiService: TimesheetsApiService,
    private timesheetDetailsApiService: TimesheetDetailsApiService,
    private profileTimesheetService: ProfileTimesheetService,
    private store: Store,
    private confirmService: ConfirmService,
  ) {
  }

  @Selector([TimesheetsState])
  static timesheets(state: TimesheetsModel): TimeSheetsPage | null {
    return state.timesheets;
  }

  @Selector([TimesheetsState])
  static timesheetsFilters(state: TimesheetsModel): TimesheetsFilterState {
    return state.timesheetsFilters;
  }

  @Selector([TimesheetsState])
  static isTimesheetOpen(state: TimesheetsModel): DialogActionPayload {
    return { dialogState: state.isTimeSheetOpen, id: state.selectedTimeSheetId };
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
  static timeSheetAttachments(state: TimesheetsModel): TimesheetUploadedFile[] {
    return state.candidateAttachments.attachments;
  }

  @Selector([TimesheetsState])
  static costCenterOptions(state: TimesheetsModel): unknown {
    return state.costCenterOptions;
  }

  @Selector([TimesheetsState])
  static billRateTypes(state: TimesheetsModel): unknown {
    return state.billRateTypes;
  }

  @Selector([TimesheetsState])
  static timesheetsFiltersColumns(state: TimesheetsModel): FilterColumns {
    return state.timesheetsFiltersColumns;
  }

  @Action(Timesheets.GetAll)
  GetTimesheets(
    { patchState, getState }: StateContext<TimesheetsModel>,
  ): Observable<TimeSheetsPage> {
    const filters = getState().timesheetsFilters;

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
    { setState }: StateContext<TimesheetsModel>,
    { payload }: Timesheets.UpdateFiltersState,
  ): Observable<null> {
    return of(null).pipe(
      throttleTime(100),
      tap(() => setState(patch({
        timesheetsFilters: payload ? patch(payload) : DefaultFiltersState,
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
  GetTimesheetRecords({ patchState }: StateContext<TimesheetsModel>, id: number): Observable<TimesheetRecordsDto> {
    return this.timesheetsApiService.getTimesheetRecords(id)
    .pipe(
      tap((res) => {
        patchState({
          timeSheetRecords: res,
        });
      })
    )
  }

  @Action(Timesheets.PostProfileTimesheet)
  PostProfileTimesheet(
    ctx: StateContext<TimesheetsModel>,
    { payload }: Timesheets.PostProfileTimesheet
  ): Observable<null> {
    return this.timesheetsApiService.postProfileTimesheets(payload);
  }

  @Action(TimesheetDetails.PatchTimesheetRecords)
  PatchTimesheetRecords(
    ctx: StateContext<TimesheetsModel>,
    { id, recordsToUpdate }: TimesheetDetails.PatchTimesheetRecords,
  ): Observable<TimesheetRecordsDto> {
    return this.timesheetsApiService.patchTimesheetRecords(id, recordsToUpdate)
    .pipe(
      switchMap(() => this.store.dispatch(new TimesheetDetails.GetTimesheetRecords(id))),
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
    { action, id }: { action: DialogAction, id: number}): void {
    patchState({
      isTimeSheetOpen: action === DialogAction.Open,
      selectedTimeSheetId: id,
    });
  }

  @Action(Timesheets.ToggleTimesheetAddDialog)
  ToggleAddDialog({ patchState }: StateContext<TimesheetsModel>, action: DialogAction): void {
    patchState({
      isAddDialogOpen: action === DialogAction.Open,
    });
  }

  @Action(Timesheets.DeleteTimesheet)
  DeleteTimesheet({ getState, patchState }: StateContext<TimesheetsModel>, {timesheetId}: Timesheets.DeleteTimesheet): void {
    const state = getState();
    const timesheets = state.timesheets as TimeSheetsPage;

    patchState({
      timesheets: {
        ...timesheets,
        items: (timesheets.items || []).filter(item => item.id !== timesheetId),
      }
    });
  }

  @Action(TimesheetDetails.AgencySubmitTimesheet)
  SubmitTimesheet({getState, patchState}: StateContext<TimesheetsModel>, { id }: TimesheetDetails.AgencySubmitTimesheet): void {
    const {title, submitButtonText, confirmMessage, successMessage} = submitTimesheetDialogData;
    const state = getState();
    const timesheets = state.timesheets as TimeSheetsPage;

    this.confirmService.confirm(confirmMessage, {
      title,
      okButtonLabel: submitButtonText,
      okButtonClass: 'delete-button'
    })
      .pipe(
        take(1),
        filter((submitted: boolean) => submitted),
        switchMap(() => this.timesheetDetailsApiService.agencySubmitTimesheet(id))
      )
      .subscribe(() => {
        patchState({
          timesheets: {
            ...timesheets,
            items: timesheets.items.map((item) => {
              if (item.id === id) {
                item.statusText = TIMETHEETS_STATUSES.PENDING_APPROVE;
                item.status = TIMETHEETS_STATUSES.PENDING_APPROVE;
              }

              return item;
            }),
          }
        });

        this.store.dispatch([
          new ShowToast(MessageTypes.Success, successMessage),
          new Timesheets.ToggleCandidateDialog(DialogAction.Close)
        ]);
      });
  }

  @Action(TimesheetDetails.OrganizationApproveTimesheet)
  ApproveTimesheet({getState, patchState}: StateContext<TimesheetsModel>, { id }: TimesheetDetails.OrganizationApproveTimesheet): void {
    const {title, submitButtonText, confirmMessage, successMessage} = approveTimesheetDialogData;
    const state = getState();
    const timesheets = state.timesheets as TimeSheetsPage;

    this.confirmService.confirm(confirmMessage, {
      title,
      okButtonLabel: submitButtonText,
      okButtonClass: 'delete-button'
    })
      .pipe(
        take(1),
        filter((submitted: boolean) => submitted),
        switchMap(() => this.timesheetDetailsApiService.organizationApproveTimesheet(id))
      )
      .subscribe(() => {
        this.store.dispatch([
          new ShowToast(MessageTypes.Success, successMessage),
          new Timesheets.ToggleCandidateDialog(DialogAction.Close)
        ]);
        patchState({
          timesheets: {
            ...timesheets,
            items: timesheets.items.map(item => {
              if (item.id === id) {
                item.statusText = TIMETHEETS_STATUSES.ORG_APPROVED;
                item.status = TIMETHEETS_STATUSES.ORG_APPROVED;
              }

              return item;
            })
          }
        });
      });
  }

  @Action(TimesheetDetails.RejectTimesheet)
  RejectTimesheet({getState, patchState}: StateContext<TimesheetsModel>, { id }: TimesheetDetails.RejectTimesheet): void {
    const state = getState();
    const timesheets = state.timesheets as TimeSheetsPage;

    this.timesheetDetailsApiService.rejectTimesheet(id)
      .subscribe(() => {
        patchState({
          timesheets: {
            ...timesheets,
            items: timesheets.items.map((item: Timesheet) => {
              if (item.id === id) {
                item.status = TIMETHEETS_STATUSES.REJECTED;
                item.statusText = TIMETHEETS_STATUSES.REJECTED;
              }

              return item;
            }),
          }
        });

        this.store.dispatch(new Timesheets.ToggleCandidateDialog(DialogAction.Close));
      });
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

  @Action(TimesheetDetails.GetCandidateInfo)
  GetCandidateInfo({ patchState }: StateContext<TimesheetsModel>, id: number): Observable<CandidateInfo> {
    return this.timesheetsApiService.getCandidateInfo(id)
    .pipe(
      tap((res) => {
        patchState({
          candidateInfo: res,
        });
      })
    )
  }

  @Action(TimesheetDetails.GetCandidateChartData)
  GetCandidateChartData({ patchState }: StateContext<TimesheetsModel>, id: number): Observable<CandidateHoursAndMilesData> {
    return this.timesheetsApiService.getCandidateHoursAndMilesData(id)
    .pipe(
      tap((res) => {
        patchState({
          candidateHoursAndMilesData: res,
        });
      })
    )
  }

  @Action(TimesheetDetails.GetCandidateAttachments)
  GetCandidateAttachments({ patchState }: StateContext<TimesheetsModel>, id: number): Observable<TimesheetAttachments> {
    return this.timesheetsApiService.getCandidateAttachments(id)
    .pipe(
      tap((res) => {
        patchState({
          candidateAttachments: res,
        });
      })
    )
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
                  dataSource: res[key as TimesheetsTableColumns],
                })
              })
            }))
          });
        })
      );
  }
}
