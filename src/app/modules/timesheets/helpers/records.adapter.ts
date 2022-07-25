import { DateTimeHelper } from '@core/helpers';
import { RecordFields } from './../enums';
import {
  AddRecordDto, AddTimsheetForm, PutRecord, PutRecordDto, RecordValue, TimesheetRecordsDto,
} from '../interface';
import { MapedRecordsType } from '../constants';

export class RecordsAdapter {
  static adaptRecordPutDto(
    diffs: RecordValue[], orgId: number, sheetId: number, type: RecordFields, delIds: number[]): PutRecordDto {
    return {
      timesheetId: sheetId,
      organizationId: orgId,
      type: MapedRecordsType[type],
      deleteIds: delIds,
      records: diffs.map((item) => this.adaptRecordsToPut(item)),
    }
  }
  
  static adaptRecordAddDto(
    data: AddTimsheetForm,
    orgId: number,
    sheetId: number,
    type: RecordFields,
    ): AddRecordDto {
    data.timeIn = DateTimeHelper.toUtc(data.timeIn);
    if (data.timeOut) {
      data.timeOut = DateTimeHelper.toUtc(data.timeOut);
    }
    return {
      timesheetId: sheetId,
      organizationId: orgId,
      type: MapedRecordsType[type],
      ...data,
    }
  }

  static adaptRecordsDto(data: TimesheetRecordsDto): TimesheetRecordsDto {
    data.timesheets.forEach((item: RecordValue) => {
      item.day = item['timeIn'] as string
    });
    data.miles.forEach((item: RecordValue) => {
      item.day = item['timeIn'] as string;
    });
    data.expenses.forEach((item: RecordValue) => {
      item.day = item['timeIn'] as string;
    });
    return data;
  }

  private static adaptRecordsToPut(record: RecordValue): PutRecord {
    return {
      id: record.id,
      timeIn: DateTimeHelper.toUtc(record.timeIn),
      billRateId: record.billRateId,
      departmentId: record.departmentId,
      value: record.value,
      description: record.description,
      ...record.timeOut ? { timeOut: DateTimeHelper.toUtc(record.timeOut)  } : { timeOut: new Date().toISOString()},
      ...record.description ? { description: record.description } : {},
    }; 
  }
}
