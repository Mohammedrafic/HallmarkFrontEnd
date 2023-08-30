import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Observable, of } from 'rxjs';
import { NgxsModule,  Store } from '@ngxs/store';
import { SwitchComponent } from '@syncfusion/ej2-angular-buttons';
import Spy = jasmine.Spy;
import { MessageTypes } from '@shared/enums/message-types';

import { SettingsViewService } from '@shared/services';
import { AddDialogHelperService } from '@core/services';
import { ConfirmService } from '@shared/services/confirm.service';
import { DialogAction } from '@core/enums';
import { ProfileDetailsContainerComponent } from './profile-details-container.component';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { TimesheetDetailsApiService, TimesheetDetailsService, TimesheetsApiService } from '../../services';
import { ExportColumn } from '@shared/models/export.model';
import { AddRecordBillRate, Attachment, TabCountConfig, TimesheetDetailsModel } from '../../interface';
import { DropdownOption, FileForUpload } from '@core/interface';
import { TimesheetStatus } from '../../enums/timesheet-status.enum';
import {
  ConfirmApprovedTimesheetDeleteDialogContent,
  ConfirmDeleteTimesheetDialogContent,
  rejectTimesheetDialogData
} from '../../constants';
import {  TimeSheetsPage } from '../../store/model/timesheets.model';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { ShowToast } from '../../../../store/app.actions';
import { HourOccupationType, TimesheetTargetStatus } from '../../enums';
import * as TimesheetInt from '../../interface';

@Component({
  selector: 'app-export-dialog',
  template: '<ng-content></ng-content>'
})
class FakeExportDialogComponent {
  @Input() columns: ExportColumn[];
  @Input() fileName: string;
  @Output() cancel: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() export:EventEmitter<ExportColumn[]> = new EventEmitter<ExportColumn[]>();
}
@Component({
  selector: 'ejs-dialog',
  template: '<ng-content></ng-content>'
})
class FakeDialogComponent {
  @Input() target: HTMLElement;
  @Input() width: string;
  @Input() visible: boolean;
  @Input() isModal: boolean;
  @Input() animationSettings: { effect: string };
  @Output() open: EventEmitter<boolean> = new EventEmitter<boolean>();

  hide(): void {}
}

@Component({
  selector: 'app-upload-documents',
  template: ''
})
class FakeUploadDocumentsComponent {}

@Component({
  selector: 'app-file-viewer',
  template: ''
})
class FakeFileViewerComponent {}

@Component({
  selector: 'app-reject-reason-input-dialog',
  template: '<ng-content></ng-content>'
})
class FakeRejectReasonInputDialogComponent {
  @Output() rejectReasonChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() visible = false;
  @Input() container: HTMLElement;
}

@Component({
  selector: 'app-add-timesheet',
  template: '<ng-content></ng-content>'
})
class FakeAddTimesheetComponent {
 @Input() container: HTMLElement;
}

@Component({
  selector: 'ejs-switch',
  template: '',
})
class FakeSwitchComponent {
  writeValue(value: boolean): void {}
}

class MockRouter {
  events = of(new NavigationStart(1, ''));
}

class TimesheetDetailsStubService {
  watchRangeStream(): Observable<any> {
    return of({})
  }

  submitTimesheet(
    updateId: number,
    organizationId: number,
    isTimesheetOrMileagesUpdate: boolean
  ): Observable<void> {
    return of();
  }

  approveTimesheet(
    updateId: number,
    isTimesheetOrMileagesUpdate: boolean
  ): Observable<void> {
    return of();
  }

  orgSubmitEmptyTimesheet(): Observable<boolean> {
    return of(true);
  }
}

const timesheetDetailsMock: TimesheetDetailsModel = {
  id: 70180,
  mileageTimesheetId: 0,
  statusText: "Approved",
  mileageStatusText: "No mileages exist",
  canEditTimesheet: true,
  canEditMileage: true,
  canApproveTimesheet: false,
  canApproveMileage: true,
  allowDNWInTimesheets: false,
  agencyAbleSubmitWithoutAttachments: false,
  canUploadFiles: true,
  status: 6,
  mileageStatus: 0,
  agencyStatus: 2,
  rejectionReason: "",
  organizationId: 78,
  candidateId: 84,
  candidateFirstName: "Sarah",
  candidateLastName: "Shulz",
  candidateMiddleName: 'test',
  isEmpty: false,
  noWorkPerformed: false,
  departmentId: 2928,
  orderCostCenterId: 1,
  skillId: 35,
  orderType: 3,
  jobId: 497,
  orderId: 28356,
  formattedId: "MED-458-1",
  orderTitle: "Gynecologist",
  orderRegionName: "Alabama",
  orderLocationName: "Utah",
  orderDepartmentName: "Surgical (id1)",
  orderSkillAbbreviation: "Heari",
  orderSkillName: "Hearing Tech Cert",
  jobStartDate: "2023-05-28T00:00:00+00:00",
  jobEndDate: "2023-08-26T00:00:00+00:00",
  weekStartDate: "2023-07-31T00:00:00+00:00",
  weekEndDate: "2023-08-06T00:00:00+00:00",
  unitName: "Solid Nurses",
  timesheetStatistic: {
    weekHours: 1.500000000000000,
    cumulativeHours: 74.366666666666670,
    weekMiles: 0,
    cumulativeMiles: 0,
    weekCharge: 0,
    cumulativeCharge: 0,
    timesheetStatisticDetails: [
      {
        billRateConfigId: 4,
        billRateConfigName: "Callback" as HourOccupationType,
        weekHours: 0,
        cumulativeHours: 0
      },
      {
        billRateConfigId: 7,
        billRateConfigName: "Oncall" as HourOccupationType,
        weekHours: 0,
        cumulativeHours: 0
      },
      {
        billRateConfigId: 5,
        billRateConfigName: "Charge" as HourOccupationType,
        weekHours: 0,
        cumulativeHours: 0
      },
      {
        billRateConfigId: 1,
        billRateConfigName: "Regular" as HourOccupationType,
        weekHours: 1.500000000000000,
        cumulativeHours: 66.366666666666670
      },
      {
        billRateConfigId: 6,
        billRateConfigName: "Holiday" as HourOccupationType,
        weekHours: 0,
        cumulativeHours: 0
      },
      {
        billRateConfigId: 10,
        billRateConfigName: "Preceptor" as HourOccupationType,
        weekHours: 0,
        cumulativeHours: 0
      },
      {
        billRateConfigId: 14,
        billRateConfigName: "Weekly OT" as HourOccupationType,
        weekHours: 0,
        cumulativeHours: 0
      },
      {
        billRateConfigId: 9,
        billRateConfigName: "Orientation" as HourOccupationType,
        weekHours: 0,
        cumulativeHours: 8.000000000000000
      }
    ]
  },
  attachments: [
    {
      id: 581,
      fileName: "3f5c7a77-2d93-422a-adce-4b65f61618fb.png",
      lastModifiedAt: "2023-08-25T10:43:14.8657692+00:00"
    } as Attachment,
  ],
  invoices: [],
  candidateWorkPeriods: [
    {
      weekStartDate: "2023-05-22T00:00:00+00:00",
      weekEndDate: "2023-05-28T00:00:00+00:00"
    },
    {
      weekStartDate: "2023-05-22T00:00:00+00:00",
      weekEndDate: "2023-05-28T00:00:00+00:00"
    },
    {
      weekStartDate: "2023-05-22T00:00:00+00:00",
      weekEndDate: "2023-05-28T00:00:00+00:00"
    },
    {
      weekStartDate: "2023-05-22T00:00:00+00:00",
      weekEndDate: "2023-05-28T00:00:00+00:00"
    },
    {
      weekStartDate: "2023-05-22T00:00:00+00:00",
      weekEndDate: "2023-05-28T00:00:00+00:00"
    },
    {
      weekStartDate: "2023-05-29T00:00:00+00:00",
      weekEndDate: "2023-06-04T00:00:00+00:00"
    },
    {
      weekStartDate: "2023-05-29T00:00:00+00:00",
      weekEndDate: "2023-06-04T00:00:00+00:00"
    },
    {
      weekStartDate: "2023-05-29T00:00:00+00:00",
      weekEndDate: "2023-06-04T00:00:00+00:00"
    },
    {
      weekStartDate: "2023-05-29T00:00:00+00:00",
      weekEndDate: "2023-06-04T00:00:00+00:00"
    },
  ]
};

class TimesheetDetailsApiStubService {
  getDetailsByDate(): Observable<TimesheetDetailsModel> {
    return of({} as TimesheetDetailsModel);
  }

  noWorkPerformed(): Observable<void> {
    return of();
  }

  changeTimesheetStatus(): Observable<void> {
    return of();
  }

  agencyUploadFiles(): Observable<void> {
    return of();
  }

  getTimesheetDetails(): Observable<TimesheetDetailsModel> {
    return of({
      status: TimesheetStatus.Approved,
      organizationId: 1,
      candidateWorkPeriods: [
        {
          weekEndDate:"2023-08-05T00:00:00+00:00",
          weekStartDate:"2023-07-30T00:00:00+00:00"
        }
    ]
    } as TimesheetDetailsModel);
  }
}

class TimesheetsApiStubService {
  getCandidateCostCenters(): Observable<DropdownOption[]> {
    return of([]);
  }

  getCandidateBillRates(): Observable<AddRecordBillRate[]> {
    return of([]);
  }

  getTimesheets(): Observable<TimeSheetsPage> {
    return of({} as TimeSheetsPage);
  }

  getTabsCounts(): Observable<TabCountConfig> {
    return of({} as TabCountConfig);
  }
}

class ConfirmServiceStub {
  confirm(): Observable<boolean> {
    return of(true);
  }
}

class SettingsViewStubService {
  getViewSettingKey(): Observable<Record<string, string>> {
    return of({
      TimesheetSubmissionProcess: "Test"
    })
  }
}

describe('ProfileDetailsContainerComponent', () => {
  let component: ProfileDetailsContainerComponent;
  let fixture: ComponentFixture<ProfileDetailsContainerComponent>;
  let store: Store;
  let confirmService: ConfirmService;
  let timesheetDetailsService: TimesheetDetailsService;
  let dispatchSpy: Spy;

  const stateWithNoWorkPerformed = {
    timesheetDetails: {
      isEmpty: true,
      noWorkPerformed: false
    }
  }
  const initialState = {
    timesheetDetails: timesheetDetailsMock
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgxsModule.forRoot([TimesheetsState], { developmentMode: true }),
      ],
      providers: [
        BreakpointObserver,
        { provide: ConfirmService, useClass: ConfirmServiceStub },
        { provide: Router, useValue: {}},
        { provide: TimesheetDetailsService, useClass: TimesheetDetailsStubService},
        { provide: SettingsViewService, useClass: SettingsViewStubService},
        { provide: TimesheetsApiService, useClass: TimesheetsApiStubService},
        { provide: TimesheetDetailsApiService, useClass: TimesheetDetailsApiStubService},
        { provide:  AddDialogHelperService, useValue: {}},
        { provide: ActivatedRoute, useValue: { snapshot: { data: { isAgencyArea: false } } }},
        { provide: Router, useClass: MockRouter },
      ],
      declarations: [
        ProfileDetailsContainerComponent,
        FakeUploadDocumentsComponent,
        FakeRejectReasonInputDialogComponent,
        FakeAddTimesheetComponent,
        FakeDialogComponent,
        FakeExportDialogComponent,
        FakeFileViewerComponent
      ]
    }).compileComponents();

    const mockElement = document.createElement('div');
    document.body.querySelector = jasmine.createSpy('HTMLElement').and.returnValue(mockElement);

    fixture = TestBed.createComponent(ProfileDetailsContainerComponent);
    component = fixture.componentInstance;
    confirmService = TestBed.inject(ConfirmService);
    timesheetDetailsService = TestBed.inject(TimesheetDetailsService);

    store = TestBed.inject(Store);
    dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();
  });

  it('should be created component', () => {
    expect(component).toBeTruthy();
  });

  it('onDWNCheckboxSelectedChange - should call confirmService.confirm and perform necessary actions when checked is true', () => {
    const timesheetDetails$ = of({
      status: TimesheetStatus.Approved,
      organizationId: 1,
      candidateWorkPeriods: [
        {
          weekEndDate:"2023-08-05T00:00:00+00:00",
          weekStartDate:"2023-07-30T00:00:00+00:00"
        }
      ]
    }) as Observable<TimesheetDetailsModel>;
    const switchComponent = new FakeSwitchComponent();
    const approved = true;

    component.timesheetId = 1;
    component.organizationId = 1;
    spyOnProperty(component, 'timesheetDetails$').and.returnValue(timesheetDetails$);
    spyOn(confirmService, 'confirm').and.returnValue(of(true));

    component.onDWNCheckboxSelectedChange({ checked: true }, switchComponent as SwitchComponent);

    expect(confirmService.confirm).toHaveBeenCalledWith(
      approved ? ConfirmApprovedTimesheetDeleteDialogContent : ConfirmDeleteTimesheetDialogContent,
      {
        title: 'Delete Timesheet',
        okButtonLabel: approved ? 'Yes' : 'Proceed',
        okButtonClass: 'delete-button',
      }
    );

    expect(store.dispatch).toHaveBeenCalledTimes(6);
    expect(dispatchSpy.calls.argsFor(2)[0]).toEqual(
      new TimesheetDetails.NoWorkPerformed(true, 1, 1)
    );
    expect(dispatchSpy.calls.argsFor(3)[0]).toEqual(
      new Timesheets.GetAll()
    );
    expect(dispatchSpy.calls.argsFor(4)[0]).toEqual(
      new Timesheets.GetTimesheetDetails(1,1,false)
    );
    expect(dispatchSpy.calls.argsFor(5)[0]).toEqual(
      new Timesheets.ToggleCandidateDialog(DialogAction.Close)
    );
  });

  it('onDWNCheckboxSelectedChange - should perform necessary actions when checked is false',() => {
    const switchComponent = new FakeSwitchComponent();
    component.timesheetId = 1;
    component.organizationId = 1;

    component.onDWNCheckboxSelectedChange({ checked: false }, switchComponent as SwitchComponent);


    expect(store.dispatch).toHaveBeenCalledTimes(4);
    expect(dispatchSpy.calls.argsFor(2)[0]).toEqual(
      new TimesheetDetails.NoWorkPerformed(false, 1, 1)
    );
    expect(dispatchSpy.calls.argsFor(3)[0]).toEqual(
      new Timesheets.GetTimesheetDetails(1,1,false)
    );
    expect(dispatchSpy.calls.argsFor(4)[0]).not.toEqual(
      new Timesheets.ToggleCandidateDialog(DialogAction.Close)
    );
  });

  it('handleReject - should handle reject correctly', () => {
    const reason = 'Rejected for some reason';
    component.timesheetId = 1;
    component.organizationId = 1;
    component.handleReject(reason);


    expect(dispatchSpy.calls.argsFor(2)[0]).toEqual(
      new TimesheetDetails.ChangeTimesheetStatus({
        timesheetId: 1,
        organizationId: 1,
        targetStatus: TimesheetTargetStatus.Rejected,
        reason
      })
    );
    expect(dispatchSpy.calls.argsFor(3)[0]).toEqual([
        new ShowToast(
          MessageTypes.Success,
          rejectTimesheetDialogData(true).successMessage
        ),
        new Timesheets.GetAll()
    ]);
  });

  it('handleApprove - should handle approve correctly', () => {
    const isTimesheetOrMileagesUpdate = true;
    const updateId = isTimesheetOrMileagesUpdate ? component.timesheetId : component.mileageTimesheetId;

    spyOn(TimesheetDetailsStubService.prototype, 'submitTimesheet').and.returnValue(of());

    component.organizationId = 1;
    component.handleApprove(isTimesheetOrMileagesUpdate);

    expect(TimesheetDetailsStubService.prototype.submitTimesheet).toHaveBeenCalledWith(
      updateId,
      component.organizationId,
      isTimesheetOrMileagesUpdate
    );
    expect(dispatchSpy.calls.argsFor(0)[0]).toEqual(
      new Timesheets.ToggleCandidateDialog(DialogAction.Close)
    );
  });

   it('handleApprove - should handle approve without organizationId correctly', () => {
    const isTimesheetOrMileagesUpdate = false;
    const updateId = isTimesheetOrMileagesUpdate ? component.timesheetId : component.mileageTimesheetId;
    component.organizationId = null;

    spyOn(TimesheetDetailsStubService.prototype, 'approveTimesheet').and.returnValue(of());

    component.handleApprove(isTimesheetOrMileagesUpdate);

    expect(TimesheetDetailsStubService.prototype.approveTimesheet).toHaveBeenCalledWith(
      updateId,
      isTimesheetOrMileagesUpdate
    );
     expect(dispatchSpy.calls.argsFor(0)[0]).toEqual(
       new Timesheets.ToggleCandidateDialog(DialogAction.Close)
     );
  });

  it('orgSubmit - should call orgSubmitEmptyTimesheetWarning when timesheetDetails is empty and not noWorkPerformed', () => {
    store.reset(stateWithNoWorkPerformed);

    component.orgSubmit();

   expect(store.dispatch).not.toHaveBeenCalledWith(new Timesheets.GetAll())
  });

  it('orgSubmit - should call orgSubmitTimesheet when timesheetDetails is not empty', fakeAsync(() => {
    store.reset(initialState);

    spyOn(timesheetDetailsService, 'submitTimesheet').and.callFake(() => {
      store.dispatch(new Timesheets.GetAll());
      return of();
    });

    component.orgSubmit();

    tick();

    expect(store.dispatch).toHaveBeenCalledWith(new Timesheets.GetAll());
  }));

  it('onFilesSelected - should dispatch actions and subscribe to them on onFilesSelected method', fakeAsync(() => {
    store.reset(initialState);
    const timesheetId = 1;
    const organizationId = 2;
    const files: FileForUpload[] = [];

    component.timesheetId = timesheetId;
    component.organizationId = organizationId;

    const uploadFilesAction = new TimesheetDetails.UploadFiles({
      timesheetId,
      organizationId,
      files,
    });
    const getTimesheetDetailsAction = new Timesheets.GetTimesheetDetails(timesheetId, organizationId, false);

    component.onFilesSelected(files);

    expect(dispatchSpy.calls.argsFor(2)[0]).toEqual(
      uploadFilesAction
    )
    tick();

    expect(store.dispatch).toHaveBeenCalledWith(getTimesheetDetailsAction);
  }));

  it('saveFilesOnRecord - should dispatch actions and subscribe to them on saveFilesOnRecord method', () => {
    const uploadData = {
      fileForUpload: [],
      filesForDelete: [],
    };
    component.organizationId = 1;

    const uploadMilesAttachmentsAction = new Timesheets.UploadMilesAttachments(
      uploadData.fileForUpload,
      component.organizationId
    );
    const getTimesheetDetailsAction = new Timesheets.GetTimesheetDetails(
      component.timesheetId,
      component.organizationId as number,
      component.isAgency
    );

    component.saveFilesOnRecord(uploadData as TimesheetInt.UploadDocumentsModel);

    expect(dispatchSpy.calls.argsFor(2)[0]).toEqual([
        uploadMilesAttachmentsAction,
    ]);
    expect(dispatchSpy.calls.argsFor(3)[0]).toEqual(
      getTimesheetDetailsAction
    );
  });
})
