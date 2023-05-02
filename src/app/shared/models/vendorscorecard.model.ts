import { Double } from "@syncfusion/ej2-angular-charts";
import { PageOfCollections } from "./page.model";

export class VendorScorePayload {
    Organizations: string;
    Regions: string;
    Locations: string;
    Departments: string;
    Skill: string;
    OrderType: string;
    Agencies: string;
    StartDate: string;
    EndDate: string;    
}



export class VendorScorecardresponse {
  agencyName: string
  agencyContact: string
  phone: any
  email: string
  qualifiedCandidates: Double
  totalCandidates: Double
  submissionQualityPercent: Double
  completedCredentials: Double
  totalCredentials: Double
  complianceRatingPercent: Double
  filledOrders: Double
  totalOrders: Double
  fillRatePercent: Double
  valueAddSubmissions: Double
  totalSubmissions: Double
  costAdjustmentPercent: Double
  onTimeStart: Double
  filledOrdersOnTimeStart: Double
  onTimeStartPercent: Double
  candidatesOnboarded: Double
  totalAcceptedOffers: Double
  candidatesStartPercent: Double
  contractTermination: Double
  onboardOrders: Double
  candidateRemainingonAssignmentPercent: Double
  ordersDistributed: Double
  timetoSubmit: Double
  timetoStart: Double
  vendorOverallScorePercent: string
  vendorOverallScore: number
}


export type VendorScorecardresponsepayload = PageOfCollections<VendorScorecardresponse>;