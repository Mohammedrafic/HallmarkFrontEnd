import { DateTimeHelper } from '@core/helpers';
import { CustomFormGroup } from '@core/interface';
import { CheckForm, PaymentForm } from '../components/invoice-add-payment';
import { InvoicePaymentData, PaymentCreationDto } from '../interfaces';

export class PaymentsAdapter {
  static adaptPaymentForPost(
    check: CheckForm,
    payments: Record<string, CustomFormGroup<PaymentForm>>,
    orgId: number,
    invoiceData: InvoicePaymentData[]): PaymentCreationDto {
      const dto: PaymentCreationDto = {
        check: {
          checkNumber: check.checkNumber,
          initialAmount: check.initialAmount,
          checkDate: DateTimeHelper.toUtcFormat(DateTimeHelper.setInitHours(check.checkDate.toString())),
          paymentMode: check.paymentMode,
          isRefund: check.isRefund,
          ...check.id ? { id: check.id } : {},
        },
        payments: [],
      };

      Object.keys(payments).forEach((invoiceFormatedId) => {
        const formValue = payments[invoiceFormatedId].value;
        const { agencySuffix, checkId, invoiceId } = invoiceData
        .find((item) => item.invoiceNumber === invoiceFormatedId) as InvoicePaymentData;

        dto.payments.push({
          id: payments[invoiceFormatedId].get('id')?.value,
          invoiceId: invoiceId,
          checkId: checkId,
          agencySuffix: agencySuffix,
          paymentDate: DateTimeHelper.toUtcFormat(DateTimeHelper.setInitHours(check.date.toString())),
          payment: formValue.amount,
          organizationId: orgId,
        });
      });

      return dto;
  }
}