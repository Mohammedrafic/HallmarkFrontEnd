import { BillRate, BillRateCategory, BillRateType, BillRateUnit } from './../../../shared/models/bill-rate.model';
import { CandidateInfo, CostCenterOption, TimesheetRecordsDto } from '../interface';

export const CandidateMockInfo: CandidateInfo = {
  id: 102,
  imgPath: 'https://ej2.syncfusion.com/angular/documentation/samples/avatar/getting-started-cs1/pic01.png',
  orderId: '22-13-756',
  status: 'Onboard',
  timesheetStatus: 'Incomplete',
  firstName: 'Paul',
  lastName: 'Sanders',
  jobTitle: 'Surgeon',
  location: 'Pretty one',
  department: 'Surgery',
  skill: 'Surgeon',
  startDate: 'Thu Jul 05 2022 12:36:26 GMT+0300',
  endDate: 'Fri Jul 08 2022 12:36:26 GMT+0300',
  unitName: 'Some Agency',
  rejectReason: null,
};

export const CostCenterOptions: CostCenterOption[] = [
  {
    id: 17,
    name: 'FAV-1345'
  },
  {
    id: 19,
    name: '08-74'
  },
  {
    id: 63,
    name: '17-22'
  },
  {
    id: 64,
    name: '03-12'
  },
  {
    id: 65,
    name: '44-52'
  },
  {
    id: 66,
    name: '67-89'
  },
];

export const BillRatesOptions: BillRate[] = [
  {
    id: 78,
    billRateGroupId: 564,
    billRateConfigId: 272,
    billRateConfig: {
      id: 444,
      category: BillRateCategory.BaseRate,
      title: 'Regular',
      type: BillRateType.Times,
      unit: BillRateUnit.Currency,
      intervalMin: false,
      intervalMax: false,
      considerForOT: false,
    },
    rateHour: 50,
    intervalMin: null,
    intervalMax: null,
    effectiveDate: '2026-06-12',
  },
  {
    id: 79,
    billRateGroupId: 565,
    billRateConfigId: 272,
    billRateConfig: {
      id: 445,
      category: BillRateCategory.BaseRate,
      title: 'OnCall',
      type: BillRateType.Times,
      unit: BillRateUnit.Currency,
      intervalMin: false,
      intervalMax: false,
      considerForOT: false,
    },
    rateHour: 50,
    intervalMin: null,
    intervalMax: null,
    effectiveDate: '2026-06-12',
  },
  {
    id: 80,
    billRateGroupId: 565,
    billRateConfigId: 272,
    billRateConfig: {
      id: 446,
      category: BillRateCategory.Overtime,
      title: 'Miles',
      type: BillRateType.Additional,
      unit: BillRateUnit.Currency,
      intervalMin: false,
      intervalMax: false,
      considerForOT: false,
    },
    rateHour: 50,
    intervalMin: null,
    intervalMax: null,
    effectiveDate: '2026-06-12',
  },
];
