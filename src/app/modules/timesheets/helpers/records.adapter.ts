import { DateTimeHelper } from '@core/helpers';
import { MappedRecordsType } from '../constants';
import { RecordFields, RecordsMode } from '../enums';
import {
  AddRecordDto, AddTimesheetForm, PutRecord, PutRecordDto, RawTimesheetRecordsDto, RecordDto, RecordValue,
  TimesheetRecordsDto,
} from '../interface';

export class RecordsAdapter {
  static adaptRecordPutDto(
    recordsToUpdate: RecordValue[], orgId: number, sheetId: number, type: RecordFields, delIds: number[]): PutRecordDto {
    return {
      timesheetId: sheetId,
      organizationId: orgId,
      type: MappedRecordsType[type],
      deleteIds: delIds,
      records: recordsToUpdate.map((record) => this.adaptRecordToPut(record)),
    };
  }

  static adaptRecordAddDto(
    data: AddTimesheetForm,
    orgId: number,
    sheetId: number,
    type: RecordFields,
    timeIsNull: boolean,
    ): AddRecordDto {
    // Lines 28-32 timeIn and timeOut get converted form Date object to string here.
    if (type === RecordFields.Time) {
      data.timeIn = data.timeIn ? DateTimeHelper.setUtcTimeZone(data.timeIn)
      : DateTimeHelper.setUtcTimeZone(data.day as Date);
      data.timeOut =  data.timeOut ?  data.timeOut : DateTimeHelper.setUtcTimeZone(data.day as Date);
      data.day = DateTimeHelper.setUtcTimeZone(data.day as Date);
    }

    // As day may differ timeIn date should be the same.
    if (data.day && data.timeIn) {
      data.timeIn = this.getDateFromParts(DateTimeHelper.setUtcTimeZone(data.day), data.timeIn as string);
    }

    if (data.timeOut) {
      data.timeOut = RecordsAdapter.checkTimeOutDate(data.timeIn as string, data.timeOut as string);
    }

    if (type === RecordFields.Miles) {
      data.timeIn = DateTimeHelper.setUtcTimeZone(DateTimeHelper.setInitDateHours(data.timeIn));
    }

    if (type === RecordFields.Time) {
      data.hadLunchBreak = !data.hadLunchBreak;
    }

    const dto: AddRecordDto = {
      timesheetId: sheetId,
      organizationId: orgId,
      type: MappedRecordsType[type],
      ...data,
      isTimeInNull: timeIsNull,
    } as AddRecordDto;

    return dto;
  }

  static adaptRecordsDto(data: RawTimesheetRecordsDto): TimesheetRecordsDto {
    const records: TimesheetRecordsDto = {
      [RecordFields.Time]: {
        [RecordsMode.Edit]: data.timesheets.map((item: RecordDto) => {
          return ({
            ...item,
            day: item.timeIn,
            isTimeInNull: !!item['isTimeInNull'],
          });
        }),
        [RecordsMode.View]: data.timesheetsCalculated.map((item: RecordDto) => {
          return ({
            ...item,
            day: item.timeIn,
          });
        }),
      },
      [RecordFields.HistoricalData]: {
        [RecordsMode.Edit]: [],
        [RecordsMode.View]: data.invoiceHistoricalRecords.map((item: RecordDto) => {
          return ({
            ...item,
            day: item.timeIn,
          });
        }),
      },
      [RecordFields.Miles]: {
        [RecordsMode.Edit]: data.miles.map((item: RecordDto) => {
          return ({
            ...item,
            day: item.timeIn,
          });
        }),
        [RecordsMode.View]: data.milesCalculated.map((item: RecordDto) => {
          return ({
            ...item,
            day: item.timeIn,
          });
        }),
      },
      [RecordFields.Expenses]: {
        [RecordsMode.Edit]: data.expenses.map((item: RecordDto) => {
          return ({
            ...item,
            day: item.timeIn,
          });
        }),
        [RecordsMode.View]: data.expensesCalculated.map((item: RecordDto) => {
          return ({
            ...item,
            day: item.timeIn,
          });
        }),
      },
    };
    return records;
  }

  static adaptRecordsDiffs(records: RecordValue[], diffs: RecordValue[], deleteIds: number[]): RecordValue[] {
    return records.map((record) => {
      const updatedItem = diffs.find((item) => item.id === record.id);

      if (updatedItem) {
        return updatedItem;
      }

      return record;
    }).filter((record) => !deleteIds.includes(record.id));
  }

  private static adaptRecordToPut(record: RecordValue): PutRecord {
    const timeIn = record.timeIn || record.day;

    return {
      id: record.id,
      timeIn: DateTimeHelper.setUtcTimeZone(timeIn),
      isTimeInNull: !record.timeOut,
      billRateConfigId: record.billRateConfigId,
      departmentId: record.departmentId,
      value: record.value,
      timeOut: record.timeOut ? RecordsAdapter.checkTimeOutDate(timeIn, record.timeOut) : null,
      ...record.description ? { description: record.description } : {},
      ...Object.prototype.hasOwnProperty.call(record, 'hadLunchBreak') ?  { hadLunchBreak: record.hadLunchBreak } : {},
    };
  }

  private static checkTimeOutDate(timeIn: string, timeOut: string): string {
    const dateIn = DateTimeHelper.setUtcTimeZone(timeIn);
    let dateOut = DateTimeHelper.setUtcTimeZone(timeOut);
    dateOut = this.getDateFromParts(dateIn, dateOut);

    // if date in more then date out it means that time out is on another day.
    if (dateIn >= dateOut) {
      return new Date(new Date(dateOut).setDate(new Date(dateOut).getDate() + 1)).toISOString();
    }

    return dateOut;
  }

  private static getDateFromParts(dateIn: string, dateOut: string): string {
    const splitDate = dateIn.split('T')[0];
    const splitTime = dateOut.split('T')[1];

    return `${splitDate}T${splitTime}`;
  }
}
