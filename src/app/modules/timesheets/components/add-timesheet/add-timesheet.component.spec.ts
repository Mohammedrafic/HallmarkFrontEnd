import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable, of, throwError } from 'rxjs';
import { DialogModule } from '@syncfusion/ej2-angular-popups';

import { DateTimeHelper } from '@core/helpers';
import { AddDialogHelperService } from '@core/services';
import { CustomFormGroup } from '@core/interface';
import { MessageTypes } from '@shared/enums/message-types';
import { ConfirmService } from '@shared/services/confirm.service';
import { AddTimesheetComponent } from './add-timesheet.component';
import { AppState } from '../../../../store/app.state';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { TimesheetDetailsApiService, TimesheetsApiService } from '../../services';
import { AddTimesheetForm } from '../../interface';
import { RecordFields } from '../../enums';
import { ShowToast } from '../../../../store/app.actions';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';

class TimeSheetsStubApiService {
  addTimesheetRecord(): Observable<HttpErrorResponse> {
    return throwError(new HttpErrorResponse({
      error: {
        detail: "Overlapping records: Records in the Timesheets are overlapping which may lead to additional payment for the Candidate. Are you sure you like to proceed?",
        status: 403,
        title: "Forbidden",
      },
      status: 403
    }));
  }
}

class TimesheetDetailsStubApiService {
  getTimesheetDetails() {}
}

class ConfirmServiceStub {
  confirm():Observable<boolean> {
    return of(true);
  }
}

class AddDialogHelperStubService {
  createForm(type: RecordFields): CustomFormGroup<AddTimesheetForm> {
    if (type === RecordFields.Time) {
      return new FormGroup({
        day: new FormControl(null, Validators.required),
        timeIn: new FormControl(null, Validators.required),
        timeOut: new FormControl(null, Validators.required),
        departmentId: new FormControl(null, Validators.required),
        billRateConfigId: new FormControl(null, Validators.required),
        hadLunchBreak: new FormControl(null),
      }) as CustomFormGroup<AddTimesheetForm>;
    }

    return new FormGroup({
        timeIn: new FormControl(null, Validators.required),
        departmentId: new FormControl(null, Validators.required),
        description: new FormControl(null, [Validators.required, Validators.maxLength(250)]),
        value: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER)])
      }
    ) as CustomFormGroup<AddTimesheetForm>;
  }
}

describe('AddTimesheetComponent', () => {
  let component: AddTimesheetComponent;
  let fixture: ComponentFixture<AddTimesheetComponent>;
  let store: Store;
  let addDialogHelperService: AddDialogHelperService;

  const mockFormValue = {
    billRateConfigId: 1,
    day: "2023-08-20T00:00:00.000Z",
    departmentId: 3125,
    hadLunchBreak: true,
    timeIn: "2023-07-20T00:00:00.000Z",
    timeOut: "2023-08-21T00:00:00.000Z",
  };
  const stateWithEffectiveDate = {
    timesheets: {
      timesheetDetails: {
        organizationId: 230,
        id: 71079,
      },
      billRateTypes: [
        {
          disableMealBreak: false,
          disableTime: false,
          efectiveDate: "2023-08-20T00:00:00+00:00",
          text: "Regular",
          timeNotRequired: false,
          value: 1
        },
        {
          disableMealBreak: false,
          disableTime: false,
          efectiveDate: "2023-08-5T00:00:00+00:00",
          text: "Callback",
          timeNotRequired: false,
          value: 4
        },
        {
          disableMealBreak: false,
          disableTime: false,
          efectiveDate: "2023-05-01T00:00:00+00:00",
          text: "Orientation",
          timeNotRequired: false,
          value: 9
        },
        {
          disableMealBreak: true,
          disableTime: true,
          efectiveDate: "2023-04-01T00:00:00+00:00",
          text: "Missed Meal",
          timeNotRequired: true,
          value: 26
        },
        {
          disableMealBreak: true,
          disableTime: true,
          efectiveDate: "2023-04-01T00:00:00+00:00",
          text: "Resource Called Off",
          timeNotRequired: true,
          value: 28
        },
        {
          disableMealBreak: false,
          disableTime: false,
          efectiveDate: "2011-08-07T00:00:00+00:00",
          text: "Mileage",
          timeNotRequired: false,
          value: 11
        },
        {
          disableMealBreak: false,
          disableTime: false,
          efectiveDate: "2023-07-01T00:00:00+00:00",
          text: "Oncall",
          timeNotRequired: false,
          value: 7
        }
      ],
    }
  };
  const stateWithNotEffectiveDate = {
    timesheets: {
      timesheetDetails: {
        organizationId: 230,
        id: 71079,
      },
      billRateTypes: [
        {
          disableMealBreak: false,
          disableTime: false,
          efectiveDate: "2023-08-20T01:00:00+00:00",
          text: "Regular",
          timeNotRequired: false,
          value: 1
        },
        {
          disableMealBreak: false,
          disableTime: false,
          efectiveDate: "2023-08-20T02:00:00+00:00",
          text: "Callback",
          timeNotRequired: false,
          value: 4
        },
      ],
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        DialogModule,
        NgxsModule.forRoot([AppState, TimesheetsState], { developmentMode: true }),
      ],
      providers: [
        { provide: ConfirmService, useClass: ConfirmServiceStub },
        { provide: ActivatedRoute, useValue: { snapshot: { data: { isAgencyArea: false } } } },
        { provide: TimesheetDetailsApiService, useClass: TimesheetDetailsStubApiService },
        { provide: TimesheetsApiService, useClass: TimeSheetsStubApiService },
        { provide: AddDialogHelperService, useClass: AddDialogHelperStubService },
      ],
      declarations: [AddTimesheetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTimesheetComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    addDialogHelperService = TestBed.inject(AddDialogHelperService);

    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should be created component', () => {
    expect(component).toBeTruthy();
  });

  it('should mark form as touched and update validity if form is invalid', () => {
    component.form = addDialogHelperService.createForm(RecordFields.Time) as CustomFormGroup<AddTimesheetForm>;

    component.saveRecord();

    expect(component.form?.touched).toBe(true);
    expect(component.form?.valid).toBe(false);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should show error message if bill rate is not effective for the selected date', () => {
    component.form = addDialogHelperService.createForm(RecordFields.Time) as CustomFormGroup<AddTimesheetForm>;
    component.form?.patchValue(mockFormValue);

    store.reset(stateWithNotEffectiveDate);
    spyOn(DateTimeHelper, 'findPreviousNearestDateIndex').and.returnValue(0);

    component.saveRecord();

    expect(store.dispatch).toHaveBeenCalledWith(
      new ShowToast(MessageTypes.Error, 'Bill rate is not effective for this date')
    );
  });

  it('should dispatch AddTimesheetRecord if form is valid and bill rate is effective, not show confirm dialog', fakeAsync(() => {
    component.form = addDialogHelperService.createForm(RecordFields.Time) as CustomFormGroup<AddTimesheetForm>;
    component.form?.patchValue(mockFormValue);

    const expectedAddTimesheetRecordArgs = {
      timesheetId: 71079,
      organizationId: 230,
      type: 1,
      day: '2023-08-20T00:00:00.000Z',
      timeIn: '2023-08-20T00:00:00.000Z',
      timeOut: '2023-08-21T00:00:00.000Z',
      departmentId: 3125,
      billRateConfigId: 1,
      hadLunchBreak: false,
      isTimeInNull: false,
    };
    const addTimesheetRecordAction = new TimesheetDetails.AddTimesheetRecord(
      expectedAddTimesheetRecordArgs,
      false
    );

    store.reset(stateWithEffectiveDate);
    component.saveRecord();

    tick();

    expect(store.dispatch).toHaveBeenCalledWith(addTimesheetRecordAction);
    expect(store.dispatch).not.toHaveBeenCalledWith(
      new ShowToast(MessageTypes.Error, 'Bill rate is not effective for this date')
    );
  }));

  it('should dispatch AddTimesheetRecord if form is valid and bill rate is effective and show confirmation message', fakeAsync(() => {
    component.form = addDialogHelperService.createForm(RecordFields.Time) as CustomFormGroup<AddTimesheetForm>;
    component.form?.patchValue(mockFormValue);
    const expectedAddTimesheetRecordArgs = {
      timesheetId: 71079,
      organizationId: 230,
      type: 1,
      day: '2023-08-20T00:00:00.000Z',
      timeIn: '2023-08-20T00:00:00.000Z',
      timeOut: '2023-08-21T00:00:00.000Z',
      departmentId: 3125,
      billRateConfigId: 1,
      hadLunchBreak: false,
      isTimeInNull: false,
      forceUpdate: true,
    };
    const addTimesheetRecordAction = new TimesheetDetails.AddTimesheetRecord(
      expectedAddTimesheetRecordArgs,
      false
    );
    const forceAddRecordAction = new TimesheetDetails.ForceAddRecord(true);

    store.reset(stateWithEffectiveDate);
    component.saveRecord();

    tick();

    store.dispatch(forceAddRecordAction);

    tick();

    expect(store.dispatch).toHaveBeenCalledWith(addTimesheetRecordAction);
    expect(store.dispatch).not.toHaveBeenCalledWith(
      new ShowToast(MessageTypes.Error, 'Bill rate is not effective for this date')
    );
  }));
});
