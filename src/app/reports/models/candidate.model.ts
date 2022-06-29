import { ApplicantStatus } from '@shared/enums/applicant-status.enum';

export interface CandidateModel {
  address: string;
  agency: string;
  applicantStatus: ApplicantStatus;
  cellPhoneNumber: string;
  city: string;
  email: string;
  name: string;
  skills: string[];
  state: string;
  workPhoneNumber: string;
}
