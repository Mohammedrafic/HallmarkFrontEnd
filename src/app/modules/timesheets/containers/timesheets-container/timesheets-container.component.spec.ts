import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Navigation, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { NgxsModule, Store } from '@ngxs/store';
import { FeatherModule } from 'angular-feather';

import { DialogAction, FilterPageName } from '@core/enums';
import { GRID_CONFIG } from '@shared/constants';
import { TimesheetsContainerComponent } from './timesheets-container.component';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { TimesheetDetailsApiService, TimesheetsApiService, TimesheetsService } from '../../services';
import { TabConfig, Timesheet, TimesheetGridSelections, TimesheetsSelectedRowEvent } from '../../interface';
import { Timesheets } from '../../store/actions/timesheets.actions';
import * as PreservedFilters from '../../../../store/preserved-filters.actions';
import { ShowFilterDialog } from '../../../../store/app.actions';

@Component({
  selector: 'app-date-range-week-picker',
  template: '<ng-content></ng-content>'
})
class FakeDateWeekPickerComponent {
  @Output() range: EventEmitter<string[]> = new EventEmitter<string[]>();
}

@Component({
  selector: 'app-timesheets-tabs',
  template: '<ng-content></ng-content>'
})
class FakeTimesheetsTabsComponent {
  @Input() tabConfig: TabConfig[];
  @Input() isDisabled = false;
  @Output() changeTab: EventEmitter<number> = new EventEmitter<number>();
}

@Component({
  selector: 'app-page-toolbar',
  template: ''
})
class FakePageToolbarComponent{}

@Component({
    selector: 'app-timesheet-grid-export',
    template: '<ng-content></ng-content>'
})
class FakeTimesheetGridExportComponent {
  @Input() activeTabIdx: number;
  @Input() selectedRows: TimesheetGridSelections;
  @Input() isAgency: boolean;
  @Input() public organizationId: number;
  @Output() readonly resetTableSelection: EventEmitter<void> = new EventEmitter<void>();
}

@Component({
  selector: 'app-timesheets-filter-dialog',
  template: '<ng-content></ng-content>'
})
class FakeTimesheetsFilterDialogComponent {
  @Input() activeTabIdx: number;
  @Input() orgId: number;
  @Input() isAgency: boolean;
  @Output() appliedFiltersAmount: EventEmitter<number> = new EventEmitter<number>();
  @Output() resetFilters: EventEmitter<void> = new EventEmitter<void>();
  @Output() updateTableByFilters: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
}

@Component({
  selector: 'app-profile-details-container',
  template: '<ng-content></ng-content>'
})
class FakeProfileDetailsContainerComponent {
  @Input() currentSelectedRowIndex: number;
  @Input() maxRowIndex: number = GRID_CONFIG.initialRowsPerPage;
  @Output() readonly nextPreviousOrderEvent = new EventEmitter<boolean>();
}

class RouterStub {
  getCurrentNavigation(): Navigation | null {
    return null;
  }
}

class ActivatedRouteStub {
  public get snapshot() {
    return {
      data: {
        isAgencyArea: false
      },
    }
  }
}

describe('TimesheetsContainerComponent', () => {
  let component: TimesheetsContainerComponent;
  let fixture: ComponentFixture<TimesheetsContainerComponent>;
  let timesheetsServiceMock: jasmine.SpyObj<TimesheetsService>;
  let storeMock: jasmine.SpyObj<Store>;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'selectSnapshot']);
    const timesheetsServiceSpy = jasmine.createSpyObj(
      'TimesheetsService', ['setCurrentSelectedIndexValue', 'getSelectedTimesheetRowStream']
    );

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FeatherModule.pick({}),
        NgxsModule.forRoot([TimesheetsState], { developmentMode: true }),
      ],
      declarations: [
        TimesheetsContainerComponent,
        FakeTimesheetsFilterDialogComponent,
        FakeProfileDetailsContainerComponent,
        FakeTimesheetGridExportComponent,
        FakePageToolbarComponent,
        FakeTimesheetsTabsComponent,
        FakeDateWeekPickerComponent
      ],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: TimesheetsService, useValue: timesheetsServiceSpy},
        { provide: ActivatedRoute, useClass: ActivatedRouteStub},
        { provide: Location, useValue: {}},
        { provide: Router, useClass: RouterStub},
        { provide: TimesheetsApiService, useValue: {}},
        { provide: TimesheetDetailsApiService, useValue: {}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TimesheetsContainerComponent);
    component = fixture.componentInstance;
    timesheetsServiceMock = TestBed.inject(TimesheetsService) as jasmine.SpyObj<TimesheetsService>;
    storeMock = TestBed.inject(Store) as jasmine.SpyObj<Store>;

    storeMock.selectSnapshot.and.returnValue({
      isNotPreserved: false,
      state: { statusIds: [1, 2, 3] }
    });
  });

  it('should be created component', () => {
    expect(component).toBeTruthy();
  });

  it('handleChangeTab - should set activeTabIdx', () => {
    const tabIndex = 1;

    component.handleChangeTab(tabIndex);

    expect(component.activeTabIdx).toBe(tabIndex);
  });

  it('handleChangeTab - should call dispatch with correct actions and values', () => {
    const tabIndex = 1;
    const expectedFilters = {
      statusIds: [2, 3],
    };

    component.handleChangeTab(tabIndex);

    const dispatchCalls = storeMock.dispatch.calls.all();
    const updateFiltersStateCall = dispatchCalls.find(call =>
      call.args[0] instanceof Timesheets.UpdateFiltersState
    );

    expect(updateFiltersStateCall).toBeDefined();
    expect(updateFiltersStateCall?.args[0]).toEqual(
      new Timesheets.UpdateFiltersState(expectedFilters, true, true)
    );
  });

  it('resetFilters - should call dispatch with correct actions to reset filters', () => {
    component.resetFilters();

    const dispatchForClearFilters = storeMock.dispatch.calls.argsFor(1)[0];

    const updateFiltersStateAction = new Timesheets.UpdateFiltersState({}, false, false);
    const clearPageFiltersAction = new PreservedFilters.ClearPageFilters(FilterPageName.TimesheetsVMSOrganization);

    expect(dispatchForClearFilters).toEqual([updateFiltersStateAction, clearPageFiltersAction]);
  });

  it('updateTableByFilters - should update table by filters', () => {
    const filters = {
      pageNumber: 1,
      pageSize: 100,
      orderIds: '222',
    }

    component.updateTableByFilters(filters);

    const saveFiltersAction = new PreservedFilters.SaveFiltersByPageName(
        FilterPageName.TimesheetsVMSOrganization,
      { ...filters, orderIds: filters.orderIds ? [filters.orderIds] : filters.orderIds }
    );

    const updateFiltersAction = new Timesheets.UpdateFiltersState(
      { ...filters, orderIds: filters.orderIds ? [filters.orderIds as string] : filters.orderIds },
      component.activeTabIdx !== 0
    );

    const showFilterDialogAction = new ShowFilterDialog(false);

    expect(storeMock.dispatch.calls.count()).toBe(3);
    expect(storeMock.dispatch.calls.argsFor(1)[0]).toEqual([
      saveFiltersAction,
      updateFiltersAction
    ]);
    expect(storeMock.dispatch.calls.argsFor(2)[0]).toEqual(showFilterDialogAction);
  });

  it('rowSelected - should call necessary methods on rowSelected', () => {
    const selectedRow = {
      rowIndex: 1,
      data: { } as Timesheet,
    };

    component.rowSelected(selectedRow as TimesheetsSelectedRowEvent);

    expect(timesheetsServiceMock.setCurrentSelectedIndexValue).toHaveBeenCalledWith(selectedRow.rowIndex);
    expect(storeMock.dispatch).toHaveBeenCalledWith(new Timesheets.ToggleCandidateDialog(DialogAction.Open, selectedRow.data));
  });
});
