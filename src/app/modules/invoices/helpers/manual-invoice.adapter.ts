import { DateTimeHelper } from '@core/helpers';
import { AddManInvoiceForm, ManualInvoiceMeta, ManualInvoicePostDto } from '../interfaces';

export class ManualInvoiceAdapter {
  static adapPostDto(formData: AddManInvoiceForm,
    rawData: ManualInvoiceMeta[], orgId: number): ManualInvoicePostDto | null {
    const order = formData.orderId.split('-')[0];

    const jobPosition = rawData.find((item) => {
        return (item.orderId === Number(order)
        && item.candidateId === Number(formData.nameId));
    });

    if (jobPosition) {
      const dto: ManualInvoicePostDto = {
        organizationId: orgId,
        jobId: jobPosition.jobId,
        amount: Number(formData.value),
        serviceDate: DateTimeHelper.toUtcFormat(formData.date),
        linkedInvoiceId: Number(formData.link),
        vendorFeeApplicable: !!formData.vendorFee,
        manualInvoiceReasonId: formData.reasonId,
        comment: formData.description,
        departmentId: formData.departmentId,
      };
      return dto;
    } else {
      return null;
    }

  }
}