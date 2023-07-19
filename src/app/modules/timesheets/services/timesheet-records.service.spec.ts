import {TestBed} from '@angular/core/testing';
import {FormBuilder} from '@angular/forms';

import {ColDef} from '@ag-grid-community/core';

import {TimesheetRecordsService} from './timesheet-records.service';
import {RecordValue, TimesheetRecordsDto} from '../interface';
import {RecordFields, RecordsMode, RecordStatus} from '../enums';
import {TimesheetRecordsColdef} from '../constants';
import {TabComponent} from '@syncfusion/ej2-angular-navigations';
import {DropdownOption} from '@core/interface';
import {GridDateEditorComponent} from '../components/cell-editors/grid-date-editor/grid-date-editor.component';
import {EditFieldTypes} from '@core/enums';

describe('TimesheetRecordsService', () => {
  let records: TimesheetRecordsDto;
  let colDefs: ColDef[];
  let service: TimesheetRecordsService;
  const tabComponent = {
    hideTab: () => {},
  } as unknown as TabComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [FormBuilder, TimesheetRecordsService],
    });

    service = TestBed.inject(TimesheetRecordsService);
    records = {
      timesheets: {
        editMode: [
          {
            id: 25146,
            timeIn: '2023-03-12T07:00:00+00:00',
            timeOut: '2023-03-12T14:00:00+00:00',
            billRateConfigId: 1452,
            billRateConfigName: 'Regular',
            departmentId: 144678931556,
            costCenterName: 'DEP 04',
            extDepartmentId: 'DEP 03',
            costCenterFormattedName: 'DEP 04-DEP 03',
            billRate: 0,
            total: 0,
            value: 7,
            isGenerated: true,
            timesheetRecordId: null,
            state: 0,
            hadLunchBreak: true,
            isTimeInNull: false,
            stateText: RecordStatus.None,
            location: 'test',
            disableMealBreak: false,
            doNotRequireTime: false,
            disableTime: false,
            day: '2023-03-12T00:00:00+00:00'
          },
          {
            id: 25,
            timeIn: '2023-03-12T00:00:00+00:00',
            timeOut: null,
            billRateConfigId: 1,
            billRateConfigName: 'Regular',
            departmentId: 144674,
            costCenterName: 'DEP 04',
            extDepartmentId: 'DEP 03',
            costCenterFormattedName: 'DEP 04-DEP 03',
            billRate: 0,
            total: 0,
            value: 0,
            isGenerated: true,
            timesheetRecordId: null,
            location: 'test',
            state: 0,
            hadLunchBreak: true,
            isTimeInNull: false,
            stateText: RecordStatus.None,
            disableMealBreak: false,
            doNotRequireTime: false,
            disableTime: false,
            day: '2023-03-12T00:00:00+00:00'
          },
          {
            id: 146,
            timeIn: '2023-03-12T00:00:00+00:00',
            timeOut: null,
            billRateConfigId: 1,
            billRateConfigName: 'Regular',
            departmentId: 144674,
            costCenterName: 'DEP 04',
            extDepartmentId: 'DEP 03',
            costCenterFormattedName: 'DEP 04-DEP 03',
            billRate: 0,
            total: 0,
            value: 0,
            location: 'test',
            isGenerated: true,
            timesheetRecordId: null,
            state: 0,
            hadLunchBreak: true,
            isTimeInNull: false,
            stateText: RecordStatus.None,
            disableMealBreak: false,
            doNotRequireTime: false,
            disableTime: false,
            day: '2023-03-12T00:00:00+00:00'
          },
        ],
        viewMode: []
      },
      miles: {
        editMode: [],
        viewMode: []
      },
      expenses: {
        editMode: [],
        viewMode: []
      }
    };
    colDefs = TimesheetRecordsColdef(false);
  });

  it('should create TimesheetRecordsService', () => {
    expect(service).toBeTruthy();
  });

  it('createEditForm should create object with 3 forms and set values form records', () => {
    const forms = service.createEditForm(records, RecordFields.Time, colDefs);
    const keys = Object.keys(forms);

    expect(keys.length).toBe(3);
    expect(forms['25146'].get('timeIn')?.value).toBe('2023-03-12T07:00:00+00:00');
    expect(forms['25146'].get('timeOut')?.value).toBe('2023-03-12T14:00:00+00:00');
    expect(forms['25146'].get('billRateConfigId')?.value).toBe(1452);
    expect(forms['25146'].get('departmentId')?.value).toBe(144678931556);
  });

  it('findDiffs should find differences between form values and initial data', () => {
    const forms = service.createEditForm(records, RecordFields.Time, colDefs);
    const editColDefs = service.createEditColDef(true, RecordFields.Time, forms, colDefs)
    forms['25'].get('timeIn')?.patchValue('2023-04-12T14:00:00+00:00');
    forms['146'].get('billRateConfigId')?.patchValue(45);
    const diffs= service.findDiffs(records[RecordFields.Time][RecordsMode.Edit], forms, editColDefs);

    expect(diffs.length).toBe(2);
    expect(diffs[0].id).toBe(25);
    expect(diffs[1].id).toBe(146);
  });

  it('findDiffs should not find any differences', () => {
    const forms = service.createEditForm(records, RecordFields.Time, colDefs);
    const editColDefs = service.createEditColDef(true, RecordFields.Time, forms, colDefs)
    const diffs = service.findDiffs(records[RecordFields.Time][RecordsMode.Edit], forms, editColDefs);

    expect(diffs.length).toBe(0);
  });

  it('findDiffs should not find diffs in timeIn field if isTimeInNull set to true in data', () => {
    records[RecordFields.Time][RecordsMode.Edit][0].isTimeInNull = true;
    const forms = service.createEditForm(records, RecordFields.Time, colDefs);
    const editColDefs = service.createEditColDef(true, RecordFields.Time, forms, colDefs);
    const diffs = service.findDiffs(records[RecordFields.Time][RecordsMode.Edit], forms, editColDefs);

    expect(diffs.length).toBe(0);
  });

  it('findDiffs should not find diffs when time out field was changed several times but it has initial value', () => {
    const forms = service.createEditForm(records, RecordFields.Time, colDefs);
    const editColDefs = service.createEditColDef(true, RecordFields.Time, forms, colDefs);
    forms['25146'].get('timeOut')?.patchValue('2023-03-12T14:00:00.000Z');
    const diffs = service.findDiffs(records[RecordFields.Time][RecordsMode.Edit], forms, editColDefs);

    expect(diffs.length).toBe(0);
  });

  it('findDiffs should find diffs when time out field was changed ', () => {
    const forms = service.createEditForm(records, RecordFields.Time, colDefs);
    const editColDefs = service.createEditColDef(true, RecordFields.Time, forms, colDefs);
    forms['25146'].get('timeOut')?.patchValue('2023-03-12T15:00:00.000Z');
    const diffs = service.findDiffs(records[RecordFields.Time][RecordsMode.Edit], forms, editColDefs);

    expect(diffs.length).toBe(1);
  });

  it('controlTabsVisibility should hide mileage and expenses tabs', () => {
    const rates: DropdownOption[] = [{ text: 'test', value: 1 }, { text: 'test2', value: 2 }];
    const spy = spyOn(tabComponent, 'hideTab');

    service.controlTabsVisibility(rates, tabComponent, records);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith(1, true);
    expect(spy).toHaveBeenCalledWith(2, true);
  });

  it('controlTabsVisibility should show mileage and expenses tabs', () => {
    const rates: DropdownOption[] = [{ text: 'test', value: 1 }, { text: 'Mileage', value: 2 }];
    records[RecordFields.Expenses][RecordsMode.View].push({} as unknown as RecordValue)
    const spy = spyOn(tabComponent, 'hideTab');

    service.controlTabsVisibility(rates, tabComponent, records);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith(1, false);
    expect(spy).toHaveBeenCalledWith(2, false);
  });

  it('checkForStatus should return true for record with Deleted status', () => {
    records[RecordFields.Time][RecordsMode.Edit][1].stateText = RecordStatus.Deleted;
    const result = service.checkForStatus(records[RecordFields.Time][RecordsMode.Edit]);

    expect(result).toBe(true);
  });

  it('checkForStatus should return true for record with New status', () => {
    records[RecordFields.Time][RecordsMode.Edit][1].stateText = RecordStatus.New;
    const result = service.checkForStatus(records[RecordFields.Time][RecordsMode.Edit]);

    expect(result).toBe(true);
  });

  it('checkForStatus should return false for record with None status', () => {
    records[RecordFields.Time][RecordsMode.Edit][1].stateText = RecordStatus.None;
    const result = service.checkForStatus(records[RecordFields.Time][RecordsMode.Edit]);

    expect(result).toBe(false);
  });

  it('createEditColDef should set enabled state for hadLunchBreak checkbox definition', () => {
    const forms = service.createEditForm(records, RecordFields.Time, colDefs);
    const editColDefs = service.createEditColDef(true, RecordFields.Time, forms, colDefs);
    const hadLunchBreakDef = editColDefs.find((def) => def.field === 'hadLunchBreak');

    expect(hadLunchBreakDef?.cellRendererParams.disabled).toBe(false);
  });

  it('createEditColDef should set disabled state for hadLunchBreak checkbox definition', () => {
    const forms = service.createEditForm(records, RecordFields.Time, colDefs);
    const editColDefs = service.createEditColDef(false, RecordFields.Time, forms, colDefs);
    const hadLunchBreakDef = editColDefs.find((def) => def.field === 'hadLunchBreak');

    expect(hadLunchBreakDef?.cellRendererParams.disabled).toBe(true);
  });

  it('createEditColDef should set bill rate name col def field renderer params and cell renderer in edit mode',
    () => {
    const forms = service.createEditForm(records, RecordFields.Time, colDefs);
    const editColDefs = service.createEditColDef(true, RecordFields.Time, forms, colDefs);
    const billRateDef = editColDefs.find((def) => def.field === 'billRateConfigId');

    expect(billRateDef).toBeTruthy();
    expect(billRateDef?.cellRenderer).toBeTruthy();
    expect(billRateDef?.cellRendererParams).toBeTruthy();
    expect(billRateDef?.cellRendererParams.editMode).toBe(true);
    expect(billRateDef?.cellRendererParams.isEditable).toBe(true);
    expect(billRateDef?.cellRendererParams.storeField).toBe('billRateTypes');
  });

  it('createEditColDef should delete cellRenderer and cellRendererParams fields and change field name in view mode',
    () => {
      const forms = service.createEditForm(records, RecordFields.Time, colDefs);
      const editColDefs = service.createEditColDef(false, RecordFields.Time, forms, colDefs);
      const billRateDef = editColDefs.find((def) => def.field === 'billRateConfigName');

      expect(billRateDef).toBeTruthy();
      expect(billRateDef?.cellRendererParams).toBeFalsy();
      expect(billRateDef?.cellRenderer).toBeFalsy();
    });

  it('should set isEditable flag and form group for editable definitions', () => {
    const definitions: ColDef[] = [{
      field: 'timeIn',
      headerName: 'Time in',
      width: 125,
      minWidth: 85,
      cellRenderer: GridDateEditorComponent,
      type: 'rightAligned',
      headerClass: 'custom-wrap',
      cellRendererParams: {
        editMode: true,
        isEditable: false,
        type: EditFieldTypes.Time,
      },
    },
    {
      field: 'timeOut',
      headerName: 'Time out',
      width: 125,
      minWidth: 85,
      cellRenderer: GridDateEditorComponent,
      type: 'rightAligned',
      headerClass: 'custom-wrap',
      cellRendererParams: {
        editMode: true,
        isEditable: false,
        type: EditFieldTypes.DateTime,
      },
    }] as ColDef[];
    const forms = service.createEditForm(records, RecordFields.Time, definitions);
    const editColDefs = service.createEditColDef(true, RecordFields.Time, forms, definitions);

    expect(editColDefs.length).toBe(2);
    expect(editColDefs[0].cellRendererParams.isEditable).toBe(true);
    expect(editColDefs[0].cellRendererParams.formGroup).toBeTruthy();
    expect(editColDefs[1].cellRendererParams.isEditable).toBe(true);
    expect(editColDefs[1].cellRendererParams.formGroup).toBeTruthy();
  });
});

