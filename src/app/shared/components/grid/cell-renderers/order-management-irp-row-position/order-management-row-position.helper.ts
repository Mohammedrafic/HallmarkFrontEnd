import { IRPOrderPosition, IRPOrderPositionMain } from '@shared/models/order-management.model';
import {
  OrderManagementIrpCandidateSystem,
} from '@shared/components/grid/cell-renderers/order-management-irp-row-position/order-management-irp-row-position.enum';

export const getCandidateList = (positions: IRPOrderPositionMain[]) => {
  return positions.map((position: IRPOrderPositionMain): IRPOrderPosition[] => {
    return position?.candidates;
  }).flatMap(condidate => condidate);
};

export const getCandidatesForSystem = (
  candidateList: IRPOrderPosition[],
  system: OrderManagementIrpCandidateSystem
): IRPOrderPosition[] => {
  return candidateList.filter((candidate: IRPOrderPosition) =>
    candidate.system === OrderManagementIrpCandidateSystem[system]);
};
