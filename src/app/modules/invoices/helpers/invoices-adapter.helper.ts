import { DropdownOption, ToggleOption, TypedValueGetterParams } from '@core/interface';
import { ManualInvoice, ManualInvoiceReason } from '../interfaces';

export class InvoicesAdapter {
  static adaptReasonsToOptions(data: ManualInvoiceReason[]): DropdownOption[] {
    return data.map((item) => {
      return {
        text: item.reason,
        value: item.id,
      };
    });
  } 
  static adaptvendorFeeToOptions(data: ManualInvoice[]): ToggleOption[] {
    return data.map((item) => {
      return {
        vendorFeeToggle: item.vendorFeeApplicable,
        value: item.id,
      };
    });
  }
}
