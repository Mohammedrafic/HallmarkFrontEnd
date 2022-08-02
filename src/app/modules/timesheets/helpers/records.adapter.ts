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
    data.timeIn = DateTimeHelper.toUtcFormat(data.timeIn);
    if (data.timeOut) {
      data.timeOut = DateTimeHelper.toUtcFormat(data.timeOut);
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

  static adaptRecordsDiffs(records: RecordValue[], diffs: RecordValue[], deleteIds: number[]): RecordValue[] {
    return records.map((record) => {
      const updatedItem = diffs.find((item) => item.id === record.id);

      if (updatedItem) {
        return updatedItem
      }
        return record;
    }).filter((record) => !deleteIds.includes(record.id));
  }

  private static adaptRecordsToPut(record: RecordValue): PutRecord {
    return {
      id: record.id,
      timeIn: DateTimeHelper.toUtcFormat(record.timeIn),
      billRateConfigId: record.billRateConfigId,
      departmentId: record.departmentId,
      value: record.value,
      description: record.description,
      ...record.timeOut ? { timeOut: DateTimeHelper.toUtcFormat(record.timeOut)  } : { timeOut: new Date().toISOString()},
      ...record.description ? { description: record.description } : {},
    }; 
  }
}
