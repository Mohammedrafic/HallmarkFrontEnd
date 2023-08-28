import { TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';

import { Store } from '@ngxs/store';
import { ColDef } from '@ag-grid-community/core';

import { TimesheetDetailsTableService } from './timesheet-details-table.service';
import { RecordFields } from '../enums';
import { Timesheets } from '../store/actions/timesheets.actions';

describe('TimesheetDetailsTableService', () => {
  let service: TimesheetDetailsTableService;
  let storeMock: jasmine.SpyObj<Store>;

  const cellRenderMockParams = {
    data: {
      attachments: [],
      timesheetRecordId: 1
    }
  };
  const attachmentMock = {
    id: 1,
    fileName: 'Test'
  };

  beforeEach(() => {
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch']);

    TestBed.configureTestingModule({
      providers: [
        TimesheetDetailsTableService,
        { provide: Store, useValue: storeSpy }
      ]
    });

    service = TestBed.inject(TimesheetDetailsTableService);
    storeMock = TestBed.inject(Store) as jasmine.SpyObj<Store>;
  });

  it('should create TimesheetDetailsTableService', () => {
    expect(service).toBeTruthy();
  });

  it('should return a configuration object', () => {
    const config = service.getTableRecordsConfig();
    expect(config).toBeDefined();
    expect(config[RecordFields.Time]).toBeTruthy();
    expect(config[RecordFields.HistoricalData]).toBeTruthy();
    expect(config[RecordFields.Miles]).toBeTruthy();
    expect(config[RecordFields.Expenses]).toBeTruthy();
  });

  it('should return column definitions for miles', () => {
    const colDefs = service.milesRecordsColDef();
    expect(colDefs).toBeTruthy();
  });

  it('should include attachmentsCol when status is available', () => {
    const colDefs = service.milesRecordsColDef(true);
    const hasAttachmentsCol = colDefs.some(def => def.field === 'attachments');
    expect(hasAttachmentsCol).toBeTrue();
  });

  it('should set validators correctly for amountColdef', () => {
    const colDefs = service.milesRecordsColDef();
    const amountCol = colDefs.find(def => def.field === 'value') as ColDef;
    const inputEditorParams = amountCol.cellRendererParams;

    const expectedValidators = [
      Validators.min(0),
      Validators.max(Number.MAX_SAFE_INTEGER),
      Validators.required
    ];

    expect(inputEditorParams.validators.map((validator: Function) => validator.name))
      .toEqual(expectedValidators.map((expectedValidator: Function) => expectedValidator.name));
  });

  it('should include attachmentsCol with correct cellRendererParams', () => {
    const organizationId = 123;
    const colDefs = service.milesRecordsColDef(true, organizationId);
    const attachmentsColDef = colDefs.find(def => def.field === 'attachments');
    expect(attachmentsColDef).toBeTruthy();

    const attachmentsRendererParamsFunction = attachmentsColDef?.cellRendererParams;
    expect(attachmentsRendererParamsFunction).toBeTruthy();

    const attachmentsRendererParams = attachmentsRendererParamsFunction(cellRenderMockParams);
    expect(attachmentsRendererParams).toBeTruthy();

    const { attachmentsListConfig } = attachmentsRendererParams;
    expect(attachmentsListConfig).toBeTruthy();

    attachmentsListConfig.download(attachmentMock);
    expect(storeMock.dispatch).toHaveBeenCalledWith(
      new Timesheets.DownloadRecordAttachment(1, organizationId, attachmentMock)
    );

    attachmentsListConfig.preview(attachmentMock);
    expect(storeMock.dispatch).toHaveBeenCalledWith(
      new Timesheets.PreviewAttachment(1, organizationId, attachmentMock)
    );
  });
});
