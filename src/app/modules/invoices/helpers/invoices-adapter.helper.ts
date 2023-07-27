import { DropdownOption } from '@core/interface';
import { ManualInvoiceReason } from '../interfaces';

export class InvoicesAdapter {
  static adaptReasonsToOptions(data: ManualInvoiceReason[]): DropdownOption[] {
    return data.map((item) => {
      return {
        text: item.reason,
        value: item.id,
      };
    });
  } 
}
