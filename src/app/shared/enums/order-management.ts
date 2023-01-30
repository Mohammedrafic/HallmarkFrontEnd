export enum OrderStatus {
  Incomplete = 1,
  PreOpen = 5,
  Open = 20,
  InProgress = 30,
  InProgressOfferPending = 31,
  InProgressOfferAccepted = 32,
  Filled = 50,
  Closed = 60,
}

export enum CandidateJobStatus {
  Onboard = 1,
  Rejected = 2,
  Applied=3
}

export enum OrderMatch {
  Unassigned = "Unassigned",
  Assigned = "Assigned",
  NotRequired = "Not Required",
}
