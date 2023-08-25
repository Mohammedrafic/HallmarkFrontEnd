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
  submissionQualityPercent: number
  completedCredentials: Double
  totalCredentials: Double
  complianceRatingPercent: number
  filledOrders: Double
  totalOrders: Double
  fillRatePercent: number
  valueAddSubmissions: Double
  totalSubmissions: Double
  costAdjustmentPercent: number
  onTimeStart: Double
  filledOrdersOnTimeStart: Double
  onTimeStartPercent: number
  candidatesOnboarded: Double
  totalAcceptedOffers: Double
  candidatesStartPercent: number
  contractTermination: Double
  onboardOrders: Double
  candidateRemainingonAssignmentPercent: number
  ordersDistributed: Double
  timetoSubmit: Double
  timetoStart: Double
  vendorOverallScorePercent: number
  vendorOverallScore: string
}


export type VendorScorecardresponsepayload = PageOfCollections<VendorScorecardresponse>;