import { DateTimeHelper } from '@core/helpers';
import { AddManInvoiceForm, ManualInvoiceMeta, ManualInvoicePostDto } from '../interfaces';

export class ManualInvoiceAdapter {
  static adapPostDto(formData: AddManInvoiceForm,
    rawData: ManualInvoiceMeta[], orgId: number): ManualInvoicePostDto | null {
    const jobPosition = rawData.find((item) => {
        return ((item.orderId === Number(formData.orderId) || `${item.orderId}-${item.jobId}` === formData.orderId)
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