import { DateTimeHelper } from '@core/helpers';
import { RecordFields, RecordsMode } from './../enums';
import {
  AddRecordDto, AddTimsheetForm, PutRecord, PutRecordDto, RawTimsheetRecordsDto, RecordValue, TimesheetRecordsDto,
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
      records: diffs.map((item) => this.adaptRecordToPut(item)),
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

    if (type === RecordFields.Miles) {
      data.timeIn = DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(data.timeIn));
    }

    if (type === RecordFields.Time) {
      data.hadLunchBreak = !data.hadLunchBreak;
    }

    const dto: AddRecordDto = {
      timesheetId: sheetId,
      organizationId: orgId,
      type: MapedRecordsType[type],
      ...data,
    };

    return dto;
  }

  static adaptRecordsDto(data: RawTimsheetRecordsDto): TimesheetRecordsDto {
    const records: TimesheetRecordsDto = {
      [RecordFields.Time]: {
        [RecordsMode.Edit]: data.timesheets.map((item: RecordValue) => {
          const record = item;
          record.day = item['timeIn'] as string;

          return record;
        }),
        [RecordsMode.View]: data.timesheetsCalculated.map((item: RecordValue) => {
          const record = item;
          record.day = item['timeIn'] as string;

          return record;
        }),
      },
      [RecordFields.Miles]: {
        [RecordsMode.Edit]: data.miles.map((item: RecordValue) => {
          const record = item;
          record.day = item['timeIn'] as string;

          return record;
        }),
        [RecordsMode.View]: data.milesCalculated.map((item: RecordValue) => {
          const record = item;
          record.day = item['timeIn'] as string;

          return record;
        }),
      },
      [RecordFields.Expenses]: {
        [RecordsMode.Edit]: data.expenses.map((item: RecordValue) => {
          const record = item;
          record.day = item['timeIn'] as string;

          return record;
        }),
        [RecordsMode.View]: data.expensesCalculated.map((item: RecordValue) => {
          const record = item;
          record.day = item['timeIn'] as string;

          return record;
        }),
      }
    };
    return records;
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

  private static adaptRecordToPut(record: RecordValue): PutRecord {
    return {
      id: record.id,
      timeIn: DateTimeHelper.toUtcFormat(record.timeIn),
      billRateConfigId: record.billRateConfigId,
      departmentId: record.departmentId,
      value: record.value,
      description: record.description,
      timeOut: record.timeOut ? RecordsAdapter.checkTimeOutDate(record.timeIn, record.timeOut) : null,
      ...record.description && { description: record.description },
      ...record.hasOwnProperty('hadLunchBreak') && { hadLunchBreak: record.hadLunchBreak },
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
