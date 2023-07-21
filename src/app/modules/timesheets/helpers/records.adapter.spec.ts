import { RecordFields, RecordStatus } from '../enums';
import { AddRecordDto, AddTimesheetForm, PutRecord, RawTimesheetRecordsDto, RecordValue } from '../interface';
import { RecordsAdapter } from './records.adapter';

describe('RecordsAdapter', () => {
    const diffs: RecordValue[] = [
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
          day: '2023-03-12T07:00:00+07:00'
        },
        {
          id: 25,
          timeIn: '2023-03-13T08:00:00-06:00',
          timeOut: '2023-03-13T17:00:00-06:00',
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
          day: '2023-03-13T08:00:00+00:00'
        },
        {
          id: 146,
          timeIn: '2023-03-14T00:00:00+00:00',
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
          day: '2023-03-14T00:00:00+00:00'
        },
    ];

    it('adaptRecordPutDto should adapt records for update put dto', () => {
        const result = RecordsAdapter.adaptRecordPutDto(diffs, 158, 12, RecordFields.Time, [45, 65]);

        expect(result.timesheetId).toBe(12);
        expect(result.organizationId).toBe(158);
        expect(result.deleteIds?.length).toBe(2);
        expect(result.forceUpdate).toBe(undefined);
        expect(result.type).toBe(1);
        expect(result.records?.length).toBe(3);
        expect((result.records as PutRecord[])[0].timeIn).toBe('2023-03-12T07:00:00.000Z');
        expect((result.records as PutRecord[])[0].timeOut).toBe('2023-03-12T14:00:00.000Z');
        expect((result.records as PutRecord[])[2].isTimeInNull).toBe(true);
    });

    it('adaptRecordPutDto should adapt record set description and hadLunchBreak properties', () => {
      const diff: RecordValue[] = [{
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
        description: 'testing description',
        timesheetRecordId: null,
        state: 0,
        hadLunchBreak: false,
        isTimeInNull: false,
        stateText: RecordStatus.None,
        location: 'test',
        disableMealBreak: false,
        doNotRequireTime: false,
        disableTime: false,
        day: '2023-03-12T07:00:00+07:00'
      }];
      const result = RecordsAdapter.adaptRecordPutDto(diff, 158, 12, RecordFields.Time, []);
      const  resultRecords = result.records as PutRecord[];

      expect(resultRecords.length).toBe(1);
      expect(resultRecords[0].hadLunchBreak).toBe(false);
      expect(resultRecords[0].description).toBe('testing description');
    });

    it('adaptRecordPutDto should not set description and hadLunchBreak properties', () => {
      const diff: RecordValue[] = [{
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
        isTimeInNull: false,
        stateText: RecordStatus.None,
        location: 'test',
        disableMealBreak: false,
        doNotRequireTime: false,
        disableTime: false,
        day: '2023-03-12T07:00:00+07:00'
      }];
      const result = RecordsAdapter.adaptRecordPutDto(diff, 158, 12, RecordFields.Time, []);
      const  resultRecords = result.records as PutRecord[];

      expect(Object.prototype.hasOwnProperty.call(resultRecords[0], 'hadLunchBreak')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(resultRecords[0], 'description')).toBe(false);
    });

    it('adaptRecordPutDto should set timeOut to next day then timeIn value', () => {
      const diff: RecordValue[] = [{
        id: 25146,
        timeIn: '2023-03-12T17:00:00+00:00',
        timeOut: '2023-03-12T08:00:00+00:00',
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
        isTimeInNull: false,
        stateText: RecordStatus.None,
        location: 'test',
        disableMealBreak: false,
        doNotRequireTime: false,
        disableTime: false,
        day: '2023-03-12T07:00:00+07:00'
      }];
      const result = RecordsAdapter.adaptRecordPutDto(diff, 158, 12, RecordFields.Time, []);
      const resultRecords = result.records as PutRecord[];

      expect(resultRecords[0].timeOut).toBe('2023-03-13T08:00:00.000Z');
    });

    it('adaptRecordAddDto should adapt timesheet add record for post call', () => {
      const addRecord: AddTimesheetForm = {
          timeIn: new Date('2023-06-20T00:45:00'),
          timeOut: new Date('2023-06-20T03:30:00'),
          departmentId: 178,
          billRateConfigId: 2,
          hadLunchBreak: true,
          day: new Date('2023-06-21T00:00:00'),
      };
      const expected: AddRecordDto = {
        timesheetId: 65,
        organizationId: 158,
        type: 1,
        isTimeInNull: false,
        timeIn: '2023-06-21T00:45:00.000Z',
        timeOut: '2023-06-21T03:30:00.000Z',
        departmentId: 178,
        billRateConfigId: 2,
        hadLunchBreak: false,
        day: '2023-06-21T00:00:00.000Z',
      };

      const result = RecordsAdapter.adaptRecordAddDto(addRecord, 158, 65, RecordFields.Time, false);
      expect(result).toEqual(expected);
    });

    it('adaptRecordAddDto should set time to zero for miles record', () => {
      const addData: AddTimesheetForm = {
        departmentId: 69,
        timeIn: new Date('2023-06-20T04:00:00.000Z'),
        value: 21,
      };

      const result = RecordsAdapter.adaptRecordAddDto(addData, 158, 65, RecordFields.Miles, false);
      expect(result.timeIn).toBe('2023-06-20T00:00:00.000Z');
      expect(result.organizationId).toBe(158);
      expect(result.timesheetId).toBe(65);
      expect(result.type).toBe(2);
    });

    it('adaptRecordsDto should adapt incoming timesheet records data', () => {
      const incomingData: RawTimesheetRecordsDto= {
        expenses: [],
        expensesCalculated: [],
        timesheets: [
          {
            id: 57204,
            timeIn: "2023-07-02T00:00:00+00:00",
            timeOut: "2023-07-03T09:15:00+00:0",
            billRateConfigId: 11,
            billRateConfigName: "Regular",
            departmentId: 69,
            costCenterName: "Surgery",
            extDepartmentId: "000007",
            costCenterFormattedName: "Surgery-000007",
            billRate: 0,
            total: 0,
            description: '',
            value: 12,
            isGenerated: false,
            timesheetRecordId: null,
            state: 0,
            hadLunchBreak: false,
            isTimeInNull: true,
            stateText: RecordStatus.None,
            location: "East West",
            disableMealBreak: false,
            doNotRequireTime: false,
            disableTime: false,
          },
        ],
        timesheetsCalculated: [
          {
            id: 57204,
            timeIn: "2023-07-01T00:00:00+00:00",
            timeOut: "2023-07-03T09:15:00+00:0",
            billRateConfigId: 11,
            billRateConfigName: "Regular",
            departmentId: 69,
            costCenterName: "Surgery",
            extDepartmentId: "000007",
            costCenterFormattedName: "Surgery-000007",
            billRate: 0,
            total: 0,
            description: '',
            value: 12,
            isGenerated: false,
            timesheetRecordId: null,
            state: 0,
            hadLunchBreak: false,
            isTimeInNull: true,
            stateText: RecordStatus.None,
            location: "East West",
            disableMealBreak: false,
            doNotRequireTime: false,
            disableTime: false,
          },
        ],
        miles: [
          {
            id: 57204,
            timeIn: "2023-07-01T00:00:00+00:00",
            timeOut: null,
            billRateConfigId: 11,
            billRateConfigName: "Mileage",
            departmentId: 69,
            costCenterName: "Surgery",
            extDepartmentId: "000007",
            costCenterFormattedName: "Surgery-000007",
            billRate: 0,
            total: 0,
            description: '',
            value: 12,
            isGenerated: false,
            timesheetRecordId: null,
            state: 0,
            hadLunchBreak: false,
            isTimeInNull: true,
            stateText: RecordStatus.None,
            location: "East West",
            disableMealBreak: false,
            doNotRequireTime: false,
            disableTime: false,
          },
        ],
        milesCalculated: [
          {
            id: 57204,
            timeIn: "2023-07-01T00:00:00+00:00",
            timeOut: null,
            billRateConfigId: 11,
            billRateConfigName: "Mileage",
            departmentId: 69,
            costCenterName: "Surgery",
            extDepartmentId: "000007",
            costCenterFormattedName: "Surgery-000007",
            billRate: 0,
            total: 0,
            description: '',
            value: 12,
            isGenerated: false,
            timesheetRecordId: null,
            state: 0,
            hadLunchBreak: false,
            isTimeInNull: true,
            stateText: RecordStatus.None,
            location: "East West",
            disableMealBreak: false,
            doNotRequireTime: false,
            disableTime: false,
          },
        ]
      };
      const result = RecordsAdapter.adaptRecordsDto(incomingData);

      expect(result.timesheets.editMode[0].day).toBe('2023-07-02T00:00:00+00:00');
      expect(result.timesheets.viewMode[0].day).toBe('2023-07-01T00:00:00+00:00');
      expect(result.miles.viewMode[0].day).toBe('2023-07-01T00:00:00+00:00');
      expect(result.miles.editMode[0].day).toBe('2023-07-01T00:00:00+00:00');
    });

    it('adaptRecordsDiffs should exclude records that are going to be deleted', () => {
      const records: RecordValue[] = [
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
          day: '2023-03-12T07:00:00+07:00'
        },
        {
          id: 25,
          timeIn: '2023-03-13T08:00:00-06:00',
          timeOut: '2023-03-13T17:00:00-06:00',
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
          day: '2023-03-13T08:00:00+00:00'
        },
        {
          id: 146,
          timeIn: '2023-03-14T00:00:00+00:00',
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
          day: '2023-03-14T00:00:00+00:00'
        },
      ];
      const idsToDelete = [146, 25];
      const result = RecordsAdapter.adaptRecordsDiffs(records, diffs, idsToDelete);
      const expected = diffs[0];

      expect(result.length).toBe(1);
      expect(records[0]).toEqual(diffs[0]);
    });
});
