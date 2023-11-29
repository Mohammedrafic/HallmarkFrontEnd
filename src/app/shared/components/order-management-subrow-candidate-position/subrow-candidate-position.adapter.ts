import {
  OrderManagementIrpCandidateSystem,
} from '@shared/components/grid/cell-renderers/order-management-irp-row-position/order-management-irp-row-position.enum';
import { CandidatesStatusText, OrderStatusText } from '@shared/enums/status';
import { getCandidateDate } from '@shared/helpers';
import {  OrderManagementChild } from '@shared/models/order-management.model';
import {
  OrderManagementChildCandidate,
} from '@shared/components/order-management-subrow-candidate-position/subrow-candidate-position.interface';

export class SubrowCandidatePositionAdapter {
  static prepareTableData(candidate: OrderManagementChild): OrderManagementChildCandidate {
    return {
      ...candidate,
      positionId: `${candidate.organizationPrefix}-${candidate.orderPublicId}-${candidate.positionId}`,
      orderStatus: OrderStatusText[candidate.orderStatus],
      system: OrderManagementIrpCandidateSystem[candidate.system as number],
      candidateName: `${candidate.lastName}, ${candidate.firstName}`,
      candidateStatus: CandidatesStatusText[candidate.candidateStatus as number],
      actualStartDate: getCandidateDate(candidate.actualStartDate),
      actualEndDate: getCandidateDate(candidate.actualEndDate),
      candidateBillRate: Number(candidate.candidateBillRate).toFixed(2),
      guaranteedWorkWeek: candidate?.guaranteedWorkWeek,
    };
  }
}
