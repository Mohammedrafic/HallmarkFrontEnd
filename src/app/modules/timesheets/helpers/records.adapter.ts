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
      data.timeOut = RecordsAdapter.checkTimeOutDate(data.timeIn, data.timeOut);
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
      ...record.timeOut ? { timeOut: 
        RecordsAdapter.checkTimeOutDate(record.timeIn, record.timeOut)  } : { timeOut: new Date().toISOString()},
      ...record.description ? { description: record.description } : {},
    }; 
  }

  private static checkTimeOutDate(timeIn: string, timeOut: string): string {
    const dtaIn = DateTimeHelper.toUtcFormat(timeIn);
    const dateOut = DateTimeHelper.toUtcFormat(timeOut);

    if (dtaIn > dateOut) {
      return new Date(new Date(dateOut).setDate(new Date(dateOut).getDate() + 1)).toISOString();

    } else if ((Math.abs(new Date(dateOut).getTime() - new Date(dtaIn).getTime()) / 3600000) >= 24) {
      return new Date(new Date(dateOut).setDate(new Date(dateOut).getDate() - 1)).toISOString();
    }
    
    return DateTimeHelper.toUtcFormat(timeOut);
  }
}
