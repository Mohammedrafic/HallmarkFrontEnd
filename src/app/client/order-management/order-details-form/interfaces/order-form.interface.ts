export interface JobDistributionsList {
  id: number;
  orderId: number;
  jobDistributionOption: number;
  agencyId: number[],
}

export interface JobDistributionDTO {
  jobDistribution: number;
  agency: number[],
  jobDistributions: JobDistributionsList[],
}
