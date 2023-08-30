import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Observable, of } from 'rxjs';
import { NgxsModule, Store } from '@ngxs/store';

import { DropdownOption } from '@core/interface';
import { FileViewerData } from '@shared/modules/file-viewer/file-viewer-data.interface';
import { DateWeekService } from '@core/services';
import { ConfirmService } from '@shared/services/confirm.service';
import { MessageTypes } from '@shared/enums/message-types';
import { FileViewer } from '@shared/modules/file-viewer/file-viewer.actions';
import { TimesheetDetailsService } from './timesheet-details.service';
import { TimesheetDetailsApiService } from './timesheet-details-api.service';
import { TimesheetDetails } from '../store/actions/timesheet-details.actions';
import { Timesheets } from '../store/actions/timesheets.actions';
import { ShowToast } from '../../../store/app.actions';
import { AppState } from '../../../store/app.state';
import { TimesheetsState } from '../store/state/timesheets.state';
import { TimesheetsApiService } from './timesheets-api.service';
import { TimeSheetsPage } from '../store/model/timesheets.model';
import { AddRecordBillRate, Attachment, TabCountConfig, TimesheetDetailsModel } from '../interface';
import { HourOccupationType } from '../enums';
import DeleteAttachment = TimesheetDetails.DeleteAttachment;
import GetTimesheetDetails = Timesheets.GetTimesheetDetails;
import DownloadAttachment = TimesheetDetails.DownloadAttachment;

class ConfirmServiceStub {
  confirm(): Observable<boolean> {
    return of(true);
  }
}

class TimesheetDetailsApiStubService {
  changeTimesheetStatus(): Observable<void> {
    return of();
  }

  deleteAttachment(): Observable<void> {
    return of();
  }

  downloadAttachment(): Observable<void> {
  return of();
}

  getTimesheetDetails(): Observable<TimesheetDetailsModel> {
    return of({} as TimesheetDetailsModel);
  }
}

class TimesheetsApiStubService {
  getTimesheets(): Observable<TimeSheetsPage> {
    return of({} as TimeSheetsPage);
  }

  getTabsCounts(): Observable<TabCountConfig> {
    return of({} as TabCountConfig);
  }

  getCandidateCostCenters(): Observable<DropdownOption[]> {
    return of([]);
  }

  getCandidateBillRates(): Observable<AddRecordBillRate[]> {
    return of([]);
  }
}

class FileViewerStub {
  Open(args: FileViewerData){
    return {
      ...args,
      getPDF: jasmine.createSpy('getPDF').and.returnValue(of(new Blob())),
      getOriginal: jasmine.createSpy('getOriginal').and.returnValue(of(new Blob())),
    };
  }
}

class DateWeekStubService {}

describe('TimesheetDetailsService', () => {
  let service: TimesheetDetailsService;
  let confirmService: ConfirmService;
  let store: Store;
  let storeDispatchSpy: jasmine.Spy;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgxsModule.forRoot([AppState, TimesheetsState], { developmentMode: true }),
      ],
      providers: [
        TimesheetDetailsService,
        { provide: ConfirmService, useClass: ConfirmServiceStub },
        { provide: TimesheetDetailsApiService, useClass: TimesheetDetailsApiStubService },
        { provide: DateWeekService, useClass: DateWeekStubService },
        { provide: TimesheetsApiService , useClass: TimesheetsApiStubService },
        { provide: FileViewer, useClass: FileViewerStub }
      ]
    });

    service = TestBed.inject(TimesheetDetailsService);
    store = TestBed.inject(Store);
    confirmService = TestBed.inject(ConfirmService);

    storeDispatchSpy = spyOn(store, 'dispatch').and.callThrough();
  });

  afterEach(() => {
    storeDispatchSpy.calls.reset();
  });

  it('should create TimesheetDetailsService', () => {
    expect(service).toBeTruthy();
  });

  it('approveTimesheet - should approve timesheet', fakeAsync(() => {
    const fakeTimesheetId = 1;
    const fakeIsTimesheetOrMileagesUpdate = true;
    const fakeApproveDialogData = {
      title: 'Approve Timesheet',
      submitButtonText: 'Approve',
      confirmMessage: 'Are you sure you want to approve this timesheet?',
      successMessage: 'Success. Timesheet Approved',
    };
    const fakeDispatchAction = new TimesheetDetails.OrganizationApproveTimesheet(fakeTimesheetId, null);
    const fakeToastAction = new ShowToast(MessageTypes.Success, fakeApproveDialogData.successMessage);
    const fakeGetAllAction = new Timesheets.GetAll();

    spyOn(confirmService, 'confirm').and.returnValue(of(true));

    service.approveTimesheet(fakeTimesheetId, fakeIsTimesheetOrMileagesUpdate).subscribe();

    tick();

    expect(confirmService.confirm).toHaveBeenCalledWith(
      fakeApproveDialogData.confirmMessage,
      {
        title: fakeApproveDialogData.title,
        okButtonLabel: fakeApproveDialogData.submitButtonText,
        okButtonClass: 'delete-button',
      }
    );

    expect(store.dispatch).toHaveBeenCalledWith(fakeDispatchAction);
    expect(store.dispatch).toHaveBeenCalledWith([fakeToastAction, fakeGetAllAction]);
  }));

  it('submitTimesheet - should submit timesheet', fakeAsync(() => {
    const fakeTimesheetId = 1;
    const fakeOrgId = 2;
    const fakeIsTimesheetOrMileagesUpdate = true;
    const fakeSubmitDialogData = {
      title: 'Submit Timesheet',
      submitButtonText: 'Submit',
      confirmMessage: 'Are you sure you want to submit this timesheet?',
      successMessage: 'Success. Timesheet Submitted',
    };
    const fakeDispatchAction = new TimesheetDetails.AgencySubmitTimesheet(fakeTimesheetId, fakeOrgId);
    const fakeToastAction = new ShowToast(MessageTypes.Success, fakeSubmitDialogData.successMessage);
    const fakeGetAllAction = new Timesheets.GetAll();

    spyOn(confirmService, 'confirm').and.returnValue(of(true));

    service.submitTimesheet(fakeTimesheetId, fakeOrgId, fakeIsTimesheetOrMileagesUpdate).subscribe();

    tick();

    expect(confirmService.confirm).toHaveBeenCalledOnceWith(
      fakeSubmitDialogData.confirmMessage,
      {
        title: fakeSubmitDialogData.title,
        okButtonLabel: fakeSubmitDialogData.submitButtonText,
        okButtonClass: 'delete-button',
      }
    );

    expect(store.dispatch).toHaveBeenCalledWith(fakeDispatchAction);
    expect(store.dispatch).toHaveBeenCalledWith([fakeToastAction, fakeGetAllAction]);
  }));

  it('getAttachmentsListConfig - should return AttachmentsListConfig with delete, download, and preview methods', () => {
    const fakeTimesheetId = 1;
    const fakeOrganizationId = 2;
    const fakeIsAgency = true;
    const fakeAttachment: Attachment = { id: 123, fileName: 'attachment.pdf' };
    const fakeDeleteDispatchAction = new TimesheetDetails.DeleteAttachment({
      fileId: fakeAttachment.id,
      organizationId: fakeOrganizationId,
      timesheetId: fakeTimesheetId,
    });
    const fakeGetTimesheetDetailsDispatchAction = new Timesheets.GetTimesheetDetails(
      fakeTimesheetId,
      fakeOrganizationId,
      fakeIsAgency,
    );
    const fakeDownloadDispatchAction = new TimesheetDetails.DownloadAttachment({
      fileId: fakeAttachment.id,
      fileName: fakeAttachment.fileName,
      organizationId: fakeOrganizationId,
    });
    const attachmentsListConfigs = {
      delete: jasmine.createSpy('delete'),
      download: jasmine.createSpy('download'),
      preview:  jasmine.createSpy('preview'),
    };

    spyOn(confirmService, 'confirm').and.returnValue(of(true));

    service.getAttachmentsListConfig(fakeTimesheetId,fakeOrganizationId, fakeIsAgency);

    store.dispatch([
      new DeleteAttachment({
        fileId: fakeAttachment.id,
        organizationId: fakeOrganizationId,
        timesheetId: fakeTimesheetId,
      }),
      new DownloadAttachment({
        fileId: fakeAttachment.id,
        fileName: fakeAttachment.fileName,
        organizationId: fakeOrganizationId,
      }),
      new GetTimesheetDetails(fakeTimesheetId, fakeOrganizationId, true),
    ]);

    attachmentsListConfigs.delete(fakeAttachment);
    attachmentsListConfigs.download(fakeAttachment);
    attachmentsListConfigs.preview(fakeAttachment);

    expect(store.dispatch).toHaveBeenCalledWith([
      fakeDeleteDispatchAction,
      fakeDownloadDispatchAction,
      fakeGetTimesheetDetailsDispatchAction,
    ]);
  });

  it('createChartItems - should create chart items when statistic is provided', () => {
    const statistic = [
      { cumulativeHours: 10, weekHours: 5, billRateConfigName: HourOccupationType.Regular, billRateConfigId: 4 },
      { cumulativeHours: 20, weekHours: 8, billRateConfigName: HourOccupationType.Charge, billRateConfigId: 4 },
    ];
    const chartItems = service.createChartItems(statistic);
    const itemsWithHours = chartItems.filter(item => item.cumulativeHours || item.weekHours);
    const items = chartItems.find(item => item.billRateConfigName === HourOccupationType.Regular);

    expect(chartItems.length).toBeGreaterThan(0);
    expect(chartItems.length).toBe(statistic.length);
    expect(chartItems[0].cumulativeHours).toBe(20);
    expect(chartItems[chartItems.length - 1].cumulativeHours).toBe(10);
    expect(itemsWithHours.length).toBe(chartItems.length);
    expect(items?.weekHours).toBe(5);
  });

  it('createChartItems - should create default chart items when statistic is null or empty', () => {
    const chartItems = service.createChartItems(null);
    const regularItem = chartItems.find(item => item.billRateConfigName === HourOccupationType.Regular);

    expect(chartItems[0].cumulativeHours).toBe(0);
    expect(chartItems[0].weekHours).toBe(0);
    expect(regularItem?.cumulativeHours).toBe(0);
    expect(regularItem?.weekHours).toBe(0);
  });
});
