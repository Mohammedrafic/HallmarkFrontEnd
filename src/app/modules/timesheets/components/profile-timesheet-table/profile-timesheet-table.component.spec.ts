import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FeatherModule } from 'angular-feather';
import { MoreVertical, } from 'angular-feather/icons';
import { FormControl, FormGroup } from '@angular/forms';

import { NgxsModule, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { MenuEventArgs, SelectingEventArgs, TabAllModule, TabComponent, TabModule } from '@syncfusion/ej2-angular-navigations';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownButtonModule } from '@syncfusion/ej2-angular-splitbuttons';
import { ColDef, GridApi } from '@ag-grid-community/core';
import { GridAllModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { AgGridModule } from '@ag-grid-community/angular';

import { SettingsViewService } from '@shared/services';
import { GridModule } from '@shared/components/grid/grid.module';
import { ConfirmService } from '@shared/services/confirm.service';
import { ProfileTimesheetTableComponent } from './profile-timesheet-table.component';
import { AppState } from '../../../../store/app.state';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { TimesheetDetailsApiService, TimesheetDetailsTableService, TimesheetRecordsService, TimesheetsApiService } from '../../services';
import { Attachment, RecordValue, TimesheetDetailsModel, TimesheetRecordsDto } from '../../interface';
import { HourOccupationType, RecordFields, RecordsMode } from '../../enums';
import { TimesheetConfirmMessages, TimesheetRecordsColdef } from '../../constants';
import { TimesheetStatus } from '../../enums/timesheet-status.enum';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';

const gridIcons = {
  MoreVertical,
};

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

class TimesheetDetailsTableStubService {
  getTableRecordsConfig():
    Record<string, ColDef[]> {
    return {
      [RecordFields.Time]: TimesheetRecordsColdef as unknown as ColDef[],
      [RecordFields.HistoricalData]: [],
      [RecordFields.Miles]: [],
      [RecordFields.Expenses]: [],
    };
  }
}

class TimesheetRecordsStubService {
  checkFormsValidation(): boolean {
    return true;
  }

  findDiffs(): RecordValue[] {
    return [];
  }

  getCurrentTabName(): RecordFields {
   return  RecordFields.Time;
  }

  createEditForm(): FormGroup {
    return new FormGroup({
      459611: new FormGroup({
        billRateConfigId: new FormControl(1),
        departmentId: new FormControl(3125),
        hadLunchBreak: new FormControl(true),
        id: new FormControl(459611),
        isTimeInNull: new FormControl(true),
        timeIn: new FormControl(),
        timeOut: new FormControl(),
      })
    })
  }

  watchFormChanges(): Observable<unknown> {
    return of([]);
 }

  checkIfFormTouched(): boolean {
    return true;
  }

  checkForStatus(): boolean {
    return false;
  }

  createEditColDef(): ColDef[] {
    return [
      {
        field: "day",
        filter: true,
        headerClass: "custom-wrap",
        headerName: "Day",
        minWidth: 80,
        resizable: true,
        sortable: true,
        width: 80,
      }
    ]
  }
}

class ConfirmServiceStub {
  confirm(): Observable<boolean> {
    return of(true);
  }
}

class TimesheetDetailsStubApiService {
  recalculateTimesheet(): Observable<boolean>{
    return of(true);
  }
}
describe('ProfileTimesheetTableComponent', () => {
  let component: ProfileTimesheetTableComponent;
  let fixture: ComponentFixture<ProfileTimesheetTableComponent>;
  let confirmService: ConfirmService;
  let timesheetRecordService: TimesheetRecordsService
  let store: Store;
  let gridApi: jasmine.SpyObj<GridApi>;
  let tabComponent: jasmine.SpyObj<TabComponent>;

  const initialState = {
    timesheets: {
      timesheetDetails: {
        organizationId: 123,
        weekStartDate: '2023-08-27T00:00:00+00:00',
        weekEndDate: '2023-09-02T00:00:00+00:00',
        jobEndDate: '2023-09-01T00:00:00+00:00',
        jobStartDate: '2023-08-01T00:00:00+00:00'
      }
    }
  }

  beforeEach(async () => {
    const tabComponentSpy = jasmine.createSpyObj('TabComponent', ['select']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TabAllModule,
        TabModule,
        ButtonModule,
        TabAllModule,
        DropDownButtonModule,
        GridAllModule,
        PagerModule,
        AgGridModule,
        GridModule,
        FeatherModule.pick(gridIcons),
        NgxsModule.forRoot([AppState, TimesheetsState], { developmentMode: true }),
      ],
      providers: [
        BreakpointObserver,
        { provide: ConfirmService, useClass: ConfirmServiceStub },
        { provide: TimesheetDetailsTableService, useClass: TimesheetDetailsTableStubService },
        { provide: TimesheetRecordsService, useClass: TimesheetRecordsStubService },
        { provide: SettingsViewService, useValue: {}},
        { provide: TimesheetsApiService, useValue: {}},
        { provide: TimesheetDetailsApiService, useClass: TimesheetDetailsStubApiService},
        { provide: TabComponent, useValue: tabComponentSpy }
      ],
      declarations: [ProfileTimesheetTableComponent],
    }).compileComponents();

    const mockElement = document.createElement('div');
    document.body.querySelector = jasmine.createSpy('HTMLElement').and.returnValue(mockElement);

    fixture = TestBed.createComponent(ProfileTimesheetTableComponent);
    component = fixture.componentInstance;
    component.timesheetDetails = timesheetDetailsMock;

    gridApi = jasmine.createSpyObj('GridApi', ['setRowData', 'setColumnDefs']);
    Object.defineProperty(component, 'gridApi', { value: gridApi });

    confirmService = TestBed.inject(ConfirmService);
    timesheetRecordService = TestBed.inject(TimesheetRecordsService);
    tabComponent = TestBed.inject(TabComponent) as jasmine.SpyObj<TabComponent>;
    store = TestBed.inject(Store);

    spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();
  });

  it('should be created component', () => {
    expect(component).toBeTruthy();
  });

  it('onTabSelect - should handle tab change with unsaved changes', () => {
    const selectEvent = {
      selectedIndex: 1,
      previousIndex: 0
    };

    spyOn(confirmService, 'confirm').and.returnValue(of(false));
    store.reset(initialState);

    component.onTabSelect(selectEvent as SelectingEventArgs);

    expect(confirmService.confirm).not.toHaveBeenCalledWith(
      TimesheetConfirmMessages.confirmTabChange,
      {
        title: 'Unsaved Progress',
        okButtonLabel: 'Proceed',
        okButtonClass: 'delete-button',
      }
    );
    expect(tabComponent.select).not.toHaveBeenCalledWith(selectEvent.selectedIndex);
  });


  it('onTabSelect - should handle tab change with saved changes', () => {
    const selectEvent = {
      selectedIndex: 1,
      previousIndex: 0
    };

    spyOn(confirmService, 'confirm').and.returnValue(of(true));
    store.reset(initialState);
    Object.defineProperty(component, 'isChangesSaved', { value: false });

    component.onTabSelect(selectEvent as SelectingEventArgs);

    expect(confirmService.confirm).toHaveBeenCalledWith(
      TimesheetConfirmMessages.confirmTabChange,
      {
        title: 'Unsaved Progress',
        okButtonLabel: 'Proceed',
        okButtonClass: 'delete-button',
      }
    );
  });

  it('saveChanges - should not call confirmService.confirm and form invalid', () => {
    spyOn(timesheetRecordService, 'checkFormsValidation').and.returnValue(true);
    spyOn(confirmService, 'confirm');

    component.currentTab = RecordFields.Miles;
    component.saveChanges();

    expect(confirmService.confirm).not.toHaveBeenCalled()
  });

  it('saveChanges - should call confirmService.confirm when checkTabStatusApproved is true and form valid', () => {
    component.timesheetDetails.status = TimesheetStatus.Approved;
    spyOn(confirmService, 'confirm').and.returnValue(of(true));

    component.saveChanges();

    expect(confirmService.confirm).toHaveBeenCalledWith(
      TimesheetConfirmMessages.confirmEdit,
      jasmine.objectContaining({
        title: 'Edit Timesheet',
        okButtonLabel: 'Yes',
        okButtonClass: 'delete-button',
      })
    );
  });

  it('deleteRecord - should call confirmService.confirm for delete record', () => {
    spyOn(confirmService, 'confirm').and.returnValue(of(true));

    component.deleteRecord(1);

    expect(confirmService.confirm).toHaveBeenCalledWith(
      TimesheetConfirmMessages.confirmRecordDelete,
      jasmine.objectContaining({
        title: 'Delete Record',
        okButtonLabel: 'Proceed',
        okButtonClass: 'delete-button',
      })
    );
  });

  it('deleteRecord - should delete record and update arrays', () => {
    const fakeId = 1;
    const fakeRecord = { id: fakeId } as RecordValue;
    component.recordsToShow = {
      [RecordFields.Time]: {
        [RecordsMode.Edit]: [fakeRecord],
        [RecordsMode.View]: [fakeRecord],
      }
    } as TimesheetRecordsDto;

    spyOn(confirmService, 'confirm').and.returnValue(of(true));

    component.deleteRecord(fakeId);

    expect(confirmService.confirm).toHaveBeenCalledWith(
      TimesheetConfirmMessages.confirmRecordDelete,
      {
        title: 'Delete Record',
        okButtonLabel: 'Proceed',
        okButtonClass: 'delete-button',
      }
    );

    expect(component.recordsToShow[RecordFields.Time][RecordsMode.View]).toEqual([]);
  });


  it('selectDropDownBtnActionItem - should call recalculateTimesheets when Recalculate is selected', () => {
    const menuEventArgs = { item: { text: 'Recalculate' } } as MenuEventArgs;
    spyOn(confirmService, 'confirm').and.returnValue(of(true));

    component.selectDropDownBtnActionItem(menuEventArgs);

    expect(confirmService.confirm).toHaveBeenCalledOnceWith(
      TimesheetConfirmMessages.recalcTimesheets,
      {
        title: 'Recalculate Timesheets',
        okButtonLabel: 'Proceed',
        okButtonClass: 'delete-button',
      }
    );
    expect(store.dispatch).toHaveBeenCalledOnceWith(
      new TimesheetDetails.RecalculateTimesheets(component.timesheetDetails.jobId)
    );
  });

  it('selectDropDownBtnActionItem - should call openAddDialog when Add Record is selected', () => {
    const menuEventArgs = { item: { text: 'Add Record' } } as MenuEventArgs;
    spyOn(component, 'openAddDialog');

    component.selectDropDownBtnActionItem(menuEventArgs);

    expect(component.openAddDialog).toHaveBeenCalled();
  });

  it('selectDropDownBtnActionItem - should call editTimesheets when Edit is selected', () => {
    const menuEventArgs = { item: { text: 'Edit' } } as MenuEventArgs;
    spyOn(component, 'editTimesheets');

    component.selectDropDownBtnActionItem(menuEventArgs);

    expect(component.editTimesheets).toHaveBeenCalled();
  });

  it('recalculateTimesheets - should dispatch RecalculateTimesheets action when confirmed', () => {
    spyOn(confirmService, 'confirm').and.returnValue(of(true));

    component.recalculateTimesheets();

    expect(confirmService.confirm).toHaveBeenCalledWith(
      TimesheetConfirmMessages.recalcTimesheets,
      {
        title: 'Recalculate Timesheets',
        okButtonLabel: 'Proceed',
        okButtonClass: 'delete-button',
      }
    );
    expect(store.dispatch).toHaveBeenCalledWith(
      new TimesheetDetails.RecalculateTimesheets(component.timesheetDetails.jobId)
    );
  });

  it('openAddDialog - should emit openAddSideDialog event with correct data', () => {
    spyOn(component.openAddSideDialog, 'emit');

    store.reset(initialState);
    component.openAddDialog();

    expect(component.openAddSideDialog.emit).toHaveBeenCalledWith({
      currentTab: RecordFields.Time,
      startDate: '2023-08-27T00:00:00+00:00',
      endDate: '2023-09-01T00:00:00+00:00',
    });
  });

  it('should set edit mode properties and update grid data', () => {
    const mockRecords = {
      timesheets: {
        editMode: [
          { id: 1, name: 'Record 1' },
          { id: 2, name: 'Record 2' }
        ],
        viewMode: [
          { id: 1, name: 'Record 1' },
          { id: 2, name: 'Record 2' }
        ],
      },
    };

    component.currentMode = RecordsMode.Edit;
    spyOn(JSON, 'parse').and.returnValue(mockRecords);
    store.reset(initialState);

    component.editTimesheets();

    expect(component.isEditOn).toBeTrue();
    expect(component.currentMode).toBe(RecordsMode.Edit);
    expect(component.recordsToShow).toEqual(mockRecords as any);
    expect(gridApi.setRowData).toHaveBeenCalledWith(mockRecords[RecordFields.Time][RecordsMode.Edit]);
  });
});
