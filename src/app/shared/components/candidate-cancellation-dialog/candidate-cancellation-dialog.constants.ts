import { JobCancellationReason, PenaltyCriteria } from "@shared/enums/candidate-cancellation";

export const CancellationReasonsMap = {
  [JobCancellationReason.ReOrderCancellationOnBehalfOfAgency]: 'Re-Order Cancellation on behalf of Agency',
  [JobCancellationReason.ReOrderCancellationOnBehalfOfOrganization]: 'Re-Order Cancellation on behalf of Organization',
  [JobCancellationReason.LTACancellationOnBehalfOfAgency]: 'LTA Cancellation on behalf of Agency',
  [JobCancellationReason.LTACancellationOnBehalfOfOrganization]: 'LTA Cancellation on behalf of Organization',
};

export const PenaltiesMap = {
  [PenaltyCriteria.RateOfHours]: '% Rate of X Hours',
  [PenaltyCriteria.FlatRate]: 'Flat Rate',
  [PenaltyCriteria.FlatRateOfHours]: 'Flat Rate of X Hours',
  [PenaltyCriteria.NoPenalty]: 'No Penalty',
};

export const penaltiesDataSource = [
  {
    text: PenaltiesMap[PenaltyCriteria.RateOfHours],
    value: PenaltyCriteria.RateOfHours,
  },
  {
    text: PenaltiesMap[PenaltyCriteria.FlatRate],
    value: PenaltyCriteria.FlatRate,
  },
  {
    text: PenaltiesMap[PenaltyCriteria.FlatRateOfHours],
    value: PenaltyCriteria.FlatRateOfHours,
  },
  {
    text: PenaltiesMap[PenaltyCriteria.NoPenalty],
    value: PenaltyCriteria.NoPenalty,
  },
];
