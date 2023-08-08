export enum JobCancellationReason {
  LTACancellationOnBehalfOfOrganization,
  LTACancellationOnBehalfOfAgency,
  ReOrderCancellationOnBehalfOfOrganization,
  ReOrderCancellationOnBehalfOfAgency,
}

export enum PenaltyCriteria {
  FlatRate,
  RateOfHours,
  FlatRateOfHours,
  NoPenalty
}
