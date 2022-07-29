import { InvoiceRecord } from '../interfaces';
import { BillRateType } from '@shared/models';

export function generateInvoiceRecords(amount: number = 100): InvoiceRecord[] {
  return Array.from(Array(amount)).map<InvoiceRecord>((_, index: number) => {
    return {
      type: 'Timesheet',
      organization: `Org${index + 1}`,
      location: 'Thone - Johnson Memorial Hospital',
      department: 'Emergency Department',
      candidate: 'Adkins, Adele Blue',
      candidateFirstName: 'Adele Blue',
      candidateLastName: 'Adkins',
      skill: 'TestSkill',
      amount: 1400,
      startDate: '02/02/2022',
      hours: getRandomNumberInRange(20, 40),
      bonus: 0,
      rate: getRandomNumberInRange(36, 1400),
      timesheetId: 11,
      miles: 55,
      expenses: 36,
      agency: 'Test Agency',
      orderId: 2234,
      timesheetRecords: [
        {
          date: '07/01/2022',
          billRateType: BillRateType.Additional,
          timeIn: '10:00',
          timeOut: '18:00',
          rate: 65,
          value: 10,
          total: 10,
          comment: 'Some Expenses',
        },
        {
          date: '07/02/2022',
          billRateType: BillRateType.Fixed,
          timeIn: '10:00',
          timeOut: '19:00',
          rate: 70,
          value: 10,
          total: 10,
          comment: 'Some Expenses',
        }
      ]
    }
  });
}

function getRandomNumberInRange(start: number, end: number): number {
  return Math.floor(Math.random() * end) + start;
}
