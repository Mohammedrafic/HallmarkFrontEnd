import { PageOfCollections } from "./page.model";

export class Candidate {
  id?: number;
  agencyId: number;
  ssn: number;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  dob: string;
  classification: number;
  professionalSummary: string;
  candidateProfileContactDetail: CandidateProfileContactDetail;
  profileStatus: number;
  candidateAgencyStatus: number;
  candidateProfileSkills: any[];

  constructor(candidateForm: any) {
    this.agencyId = candidateForm.generalInfo.agencyId;
    this.ssn = candidateForm.generalInfo.ssn;
    this.firstName = candidateForm.generalInfo.firstName;
    this.middleName = candidateForm.generalInfo.middleName;
    this.lastName = candidateForm.generalInfo.lastName;
    this.email = candidateForm.generalInfo.email;
    this.dob = candidateForm.generalInfo.dob;
    this.classification = candidateForm.generalInfo.classification || null;
    this.professionalSummary = candidateForm.profSummary.professionalSummary;
    this.candidateProfileContactDetail = new CandidateProfileContactDetail(candidateForm.contactDetails);
    this.profileStatus = candidateForm.generalInfo.profileStatus;
    this.candidateAgencyStatus = candidateForm.generalInfo.candidateAgencyStatus;
    this.candidateProfileSkills = candidateForm.generalInfo.candidateProfileSkills;
  }
}

export class CandidateProfileContactDetail {
  id?: number;
  candidateProfileId: number;
  address1: string;
  address2: string;
  state: string | null;
  city: string;
  country: number | null;
  zip: string;
  phone1: string;
  phone2: string;
  phoneType1: number;
  phoneType2: number;

  constructor(contactDetails: CandidateProfileContactDetail) {
    if (contactDetails.id) {
      this.id = contactDetails.id;
    }

    if (contactDetails.candidateProfileId) {
      this.candidateProfileId = contactDetails.candidateProfileId;
    }

    this.address1 = contactDetails.address1;
    this.address2 = contactDetails.address2;
    this.phoneType1 = contactDetails.phoneType1;
    this.phoneType2 = contactDetails.phoneType2;
    this.state = contactDetails.state || null;
    this.city = contactDetails.city;
    this.country = contactDetails.country || null;
    this.zip = contactDetails.zip;
    this.phone1 = contactDetails.phone1;
    this.phone2 = contactDetails.phone2;
  }
}

export type CandidatePage = PageOfCollections<Candidate>;
