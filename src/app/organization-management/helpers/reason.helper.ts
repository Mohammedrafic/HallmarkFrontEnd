import { RejectReasonPage, RejectReasonwithSystem } from '@shared/models/reject-reason.model';

export const CreateSystemString = (includeInIrp: boolean, includeInVms: boolean): string => {
  const systemString = [];

  if (includeInVms) {
    systemString.push('VMS');
  }

  if (includeInIrp) {
    systemString.push('IRP');
  }

  return systemString.join();
}

export const prepareCancelReasonsPage = (reasonsPage: RejectReasonPage): RejectReasonPage => {
  return {
    ...reasonsPage,
    items: reasonsPage.items.map((reasons: RejectReasonwithSystem) => {
      return {
        ...reasons,
        system: CreateSystemString(reasons.includeInIRP as boolean, reasons.includeInVMS as boolean),
      };
    })
  }
}
