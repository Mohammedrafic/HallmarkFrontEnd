import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';

import { Store } from '@ngxs/store';

import { CustomFormGroup, DataSourceItem } from '@core/interface';
import { TimesheetsService } from './timesheets.service';
import { TimesheetForm } from '../interface';
import { Timesheets } from '../store/actions/timesheets.actions';
import { TimesheetsTableFiltersColumns } from '../enums';

describe('TimesheetsService', () => {
  let service: TimesheetsService;
  let fb: FormBuilder;
  let storeMock: jasmine.SpyObj<Store>;

  beforeEach(() => {
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
      ],
      providers: [
        TimesheetsService,
        { provide: Store, useValue: storeSpy }
      ],
    });

    service = TestBed.inject(TimesheetsService);
    fb = TestBed.inject(FormBuilder);
    storeMock = TestBed.inject(Store) as jasmine.SpyObj<Store>;
  });

  it('should create TimesheetDetailsTableService', () => {
    expect(service).toBeTruthy();
  });

  it('createForm - should create a FormGroup with default values', () => {
    const expectedFormGroup = fb.group({
      searchTerm: [''],
      orderIds: [[]],
      statusIds: [[]],
      skillIds: [[]],
      departmentIds: [[]],
      agencyIds: [[]],
      regionsIds: [[]],
      locationIds: [[]],
      contactEmails: '',
    }) as CustomFormGroup<TimesheetForm>;

    const resultFormGroup = service.createForm();

    expect(resultFormGroup.value).toEqual(expectedFormGroup.value);
  });

  it('setDataSourceByFormKey - should dispatch SetFiltersDataSource action', () => {
    const key = TimesheetsTableFiltersColumns.OrderBy;
    const source: DataSourceItem[] = [];

    service.setDataSourceByFormKey(key, source);

    expect(storeMock.dispatch).toHaveBeenCalledWith(new Timesheets.SetFiltersDataSource(key, source));
  });

  it('getSelectedTimesheetRowStream - should return an Observable', () => {
    const observable = service.getSelectedTimesheetRowStream();

    expect(observable).toBeTruthy();
  });
});
