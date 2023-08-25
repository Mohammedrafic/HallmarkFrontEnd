import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { RecordFields } from '../enums';
import { CustomFormGroup } from '@core/interface';
import { AddRecordService } from './add-record.service';
import { AddTimesheetForm } from '../interface';


describe('AddRecordService', () => {
  let addRecordService: AddRecordService;
  let fb: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [AddRecordService, FormBuilder],
    });

    addRecordService = TestBed.inject(AddRecordService);
    fb = TestBed.inject(FormBuilder);
  });

  it('should be created', () => {
    expect(addRecordService).toBeTruthy();
  });

  it('should create Time form', () => {
    const form = addRecordService.createForm(RecordFields.Time);
    expect(form.get('day')).toBeTruthy();
    expect(form.get('timeIn')).toBeTruthy();
    expect(form.get('timeOut')).toBeTruthy();
    expect(form.get('departmentId')).toBeTruthy();
    expect(form.get('billRateConfigId')).toBeTruthy();
    expect(form.get('hadLunchBreak')).toBeTruthy();
  });

  it('should create Miles form', () => {
    const form = addRecordService.createForm(RecordFields.Miles);
    expect(form.get('timeIn')).toBeTruthy();
    expect(form.get('departmentId')).toBeTruthy();
    expect(form.get('value')).toBeTruthy();
  });

  it('should create default form', () => {
    const form = addRecordService.createForm('SomeOtherType' as RecordFields);
    expect(form.get('timeIn')).toBeTruthy();
    expect(form.get('departmentId')).toBeTruthy();
    expect(form.get('description')).toBeTruthy();
    expect(form.get('value')).toBeTruthy();
  });

  it('should remove time validators', () => {
    const form = fb.group({
      timeIn: ['', Validators.required],
      timeOut: ['', Validators.required],
    }) as CustomFormGroup<AddTimesheetForm>;

    addRecordService.removeTimeValidators(form);
    expect(form.get('timeIn')?.validator).toBeFalsy();
    expect(form.get('timeOut')?.validator).toBeFalsy();
  });

  it('should add time validators', () => {
    const form = fb.group({
      timeIn: [''],
      timeOut: [''],
    }) as CustomFormGroup<AddTimesheetForm>;

    addRecordService.addTimeValidators(form);
    expect(form.get('timeIn')?.hasValidator(Validators.required)).toBe(true);
    expect(form.get('timeOut')?.hasValidator(Validators.required)).toBe(true);
  });

  it('should add timeOut validator', () => {
    const form = fb.group({
      timeOut: [''],
    }) as CustomFormGroup<AddTimesheetForm>;

    addRecordService.addTimeOutValidator(form);
    expect(form.get('timeOut')?.hasValidator(Validators.required)).toBe(true);
  });

  it('should remove timeOut validator', () => {
    const form = fb.group({
      timeOut: ['', Validators.required],
    }) as CustomFormGroup<AddTimesheetForm>;

    addRecordService.removeTimeOutValidator(form);
    expect(form.get('timeOut')?.hasValidator(Validators.required)).toBe(false);
  });
});
