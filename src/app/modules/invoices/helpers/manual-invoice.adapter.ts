import { DateTimeHelper } from '@core/helpers';
import { AddManInvoiceForm, ManualInvoiceMeta, ManualInvoicePostDto } from '../interfaces';

export class ManualInvoiceAdapter {
  static parseOrderId(id: string): [string | null, number | null, number | null] {
    const orgPrefix = id.match(/[A-Z]+/g)?.[0] ?? null;
    const orderId = Number(id.match(/\d+/g)?.[0]) || null;
    const positionValue = Number(id.match(/\d+/g)?.[1]);
    const position = isNaN(positionValue) ? null : positionValue;

    return [orgPrefix, orderId, position];
  }

  static adapPostDto(formData: AddManInvoiceForm,
    rawData: ManualInvoiceMeta[], orgId: number): ManualInvoicePostDto | null {
    const order = ManualInvoiceAdapter.parseOrderId(formData.orderId)[1];

    const jobPosition = rawData.find((item) => {
        return (item.orderPublicId === order
        && item.candidateId === Number(formData.nameId));
    });

    if (jobPosition) {
      const dto: ManualInvoicePostDto = {
        organizationId: orgId,
        jobId: jobPosition.jobId,
        amount: Number(formData.value),
        serviceDate: DateTimeHelper.setUtcTimeZone(formData.date),
        linkedInvoiceId: formData.link,
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
