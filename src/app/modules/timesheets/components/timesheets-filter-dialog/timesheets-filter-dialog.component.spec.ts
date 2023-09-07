import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { NgxsModule, Store } from '@ngxs/store';
import { AutoCompleteAllModule, MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, of } from 'rxjs';

import { FilteredItem } from '@shared/models/filter.model';
import { CustomFormGroup } from '@core/interface';
import { AddDialogHelperService } from '@core/services';
import { FilterService } from '@shared/services/filter.service';
import { FilteredUser } from '@shared/models/user.model';
import { FiltersDialogHelperService } from '@core/services/filters-dialog-helper.service';
import { APP_FILTERS_CONFIG } from '@core/constants/filters-helper.constant';
import { TimesheetsFilterDialogComponent } from './timesheets-filter-dialog.component';
import { TimesheetsTableFiltersColumns } from '../../enums';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { TimesheetDetailsApiService, TimesheetsApiService, TimesheetsService } from '../../services';
import { FilterColumns } from '../../interface';
import { Timesheets } from '../../store/actions/timesheets.actions';


@Component({
  selector: 'app-filter-dialog',
  template: '<ng-content></ng-content>'
})
class FakeFilterDialogComponent {
  @Input() items: FilteredItem[] | null = [];
  @Input() count: number | undefined | null = 0;
  @Input() targetElement: HTMLElement | null;
  @Output() clearAllFiltersClicked: EventEmitter<void> = new EventEmitter();
  @Output() applyFilterClicked: EventEmitter<void> = new EventEmitter();
  @Output() deleteFilter: EventEmitter<FilteredItem> = new EventEmitter();
}

const emptyForm = new FormGroup({
  searchTerm: new FormControl(''),
  orderIds: new FormControl([]),
  statusIds: new FormControl([]),
  skillIds: new FormControl([]),
  departmentIds: new FormControl([]),
  agencyIds: new FormControl([]),
  regionsIds: new FormControl([]),
  locationIds: new FormControl([]),
  contactEmails: new FormControl(''),
}) as CustomFormGroup<FilterColumns>;

const filteredColumns = {
  searchTerm: { type: 0, valueType: 1 },
  orderIds: { type: 0, valueType: 1 },
  statusIds: { type: 2, valueType: 0, valueField: 'name', valueId: 'id' },
  skillIds: { type: 2, valueType: 0, valueField: 'name', valueId: 'masterSkillsId' },
  departmentIds: { type: 2, valueType: 0, valueField: 'name', valueId: 'id' },
  agencyIds: { type: 2, valueType: 0, valueField: 'name', valueId: 'id' },
  regionsIds: { type: 2, valueType: 0, valueField: 'name', valueId: 'id' },
  locationIds: { type: 2, valueType: 0, valueField: 'name', valueId: 'id' },
  contactEmails: { type: 6, valueType: 0, valueField: 'fullName', valueId: 'email' }
};

class FiltersDialogHelperStubService {
  createForm(): CustomFormGroup<FilterColumns> {
    return emptyForm;
  }
}

class FilterStubService {
  getUsersListBySearchTerm(text: string): Observable<FilteredUser[]> {
    return of([{
      fullName: 'Test',
      email: 'test@mail.com',
      userId: '1'
    }]);
  }
}

describe('TimesheetsFilterDialogComponent', () => {
  const devMode = true;
  let component: TimesheetsFilterDialogComponent;
  let fixture: ComponentFixture<TimesheetsFilterDialogComponent>;
  let store: Store;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MultiSelectModule,
        AutoCompleteAllModule,
        ReactiveFormsModule,
        NgxsModule.forRoot([TimesheetsState], { developmentMode: !devMode})
      ],
      declarations: [
        TimesheetsFilterDialogComponent,
        FakeFilterDialogComponent
      ],
      providers: [
        TimesheetsService,
        { provide: APP_FILTERS_CONFIG, useValue: TimesheetsTableFiltersColumns },
        { provide: TimesheetsApiService, useValue: {}},
        { provide: AddDialogHelperService, useValue: {} },
        { provide: FiltersDialogHelperService, useValue: {}, },
        { provide: FilterService, useClass: FilterStubService},
        { provide: TimesheetDetailsApiService, useValue: {}},
        { provide: FiltersDialogHelperService, useClass: FiltersDialogHelperStubService},
        { provide: ActivatedRoute, useValue: { snapshot: { data: { isAgencyArea: false }}}},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimesheetsFilterDialogComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);

    spyOn(store, 'dispatch').and.callThrough();
  });

  it('should be created component', () => {
    expect(component).toBeTruthy();
  });

  it('should setup correct initial data for components', () => {
    const searchSpy = spyOn(component.userSearch$, 'subscribe');
    const orgIdSpy = spyOn(component.organizationId$, 'subscribe');
    const activeTabSpy = spyOn(component['activeTab$'], 'subscribe');

    component.ngOnInit();

    const regionControl = component.formGroup.get('regionsIds') as FormControl;
    const locationControl = component.formGroup.get('locationIds') as FormControl;
    const valueChangesRegionSpy = spyOn(regionControl.valueChanges, 'subscribe');
    const valueChangesLocationSpy = spyOn(locationControl.valueChanges, 'subscribe');

    expect(component.formGroup).toEqual(emptyForm);
    expect(component.filterColumns).toEqual(filteredColumns as FilterColumns);

    store.dispatch(new Timesheets.SetFiltersDataSource(
      TimesheetsTableFiltersColumns.ContactEmails,
      []
    ));
    expect(searchSpy).toHaveBeenCalled();
    expect(component.filterColumns.contactEmails.dataSource).toEqual([]);

    expect(orgIdSpy).toHaveBeenCalled();
    expect(valueChangesRegionSpy).not.toHaveBeenCalled();
    expect(valueChangesLocationSpy).not.toHaveBeenCalled();
    expect(activeTabSpy).toHaveBeenCalled();
  });

  it('should call userSearch$.next with provided args', () => {
    const args = {
      cancel: false,
      name: "filtering",
      preventDefaultAction: false,
      text: "test",
      baseEventArgs: {},
      updateData: () => {},
    };

    const userSearchSpy = spyOn(component.userSearch$, 'next');

    component.contactPersonFiltering(args);

     expect(userSearchSpy).toHaveBeenCalledWith(args);
  });

  it('should call private methods when trigerred userSearch$.next', fakeAsync(() => {
    const args = {
      cancel: false,
      name: "filtering",
      preventDefaultAction: false,
      text: "test",
      baseEventArgs: {},
      updateData: () => {},
    };

    component.formGroup = emptyForm

    store.dispatch(new Timesheets.SetFiltersDataSource(
      TimesheetsTableFiltersColumns.ContactEmails,
      []
    ));

    component.contactPersonFiltering(args);
    fixture.detectChanges();

    component.userSearch$.next(args);

    expect(component.filterColumns.contactEmails.dataSource).toEqual([]);

    tick(500);

    expect(component.filterColumns.contactEmails.dataSource).toEqual([{ fullName: 'Test', email: 'test@mail.com', userId: '1' }]);

    flush();
  }));
});
