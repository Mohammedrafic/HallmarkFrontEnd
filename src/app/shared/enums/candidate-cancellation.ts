export enum JobCancellationReason {
  TravelCancellationOnBehalfOfOrganization,
  TravelCancellationOnBehalfOfAgency,
  ReOrderCancellationOnBehalfOfOrganization,
  ReOrderCancellationOnBehalfOfAgency,
}

export enum PenaltyCriteria {
  FlatRate,
  RateOfHours,
  FlatRateOfHours,
  NoPenalty
}
