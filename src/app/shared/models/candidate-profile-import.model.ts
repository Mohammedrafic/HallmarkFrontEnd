export type CandidateImportResult = {
  succesfullRecords: CandidateImportRecord[];
  errorRecords: CandidateImportRecord[];
}

export type CandidateImportRecord = {
  key: string;
  candidateProfile: CandidateProfile;
  candidateExperiencesImportDtos: CandidateExperiencesImport[];
  candidatEducationImportDtos: CandidateEducationImport[];
}

export type CandidateProfile = {
  ssn: string;
  firstName: string;
  middleName: string;
  lastName: string;
  profileStatus: string;
  email: string;
  skill: string;
  dob: string;
  classification: string;
  candidateAgencyStatus: string;
  professionalSummary: string;
  address1: string;
  address2: string;
  state: string;
  city: string;
  country: string;
  zip: string;
  phone1: string;
  phone2: string;
  key: string;
  errorProperties: string[];
  region?: string[];
};

export type CandidateExperiencesImport = {
  email: string;
  ssn: string;
  employer: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  comments: string;
  errorProperties: string[];
  key: string
}

export type CandidateEducationImport = {
  email: string;
  ssn: string;
  degreeType: string;
  schoolName: string;
  graduationMonth: string;
  fieldOfStudy: string;
  errorProperties: string[];
  key: string
}

export type ErroredData = {
  [key: string]: string | string [];
  errorProperties: string[];
}

export type ErroedListData ={
  errorDescriptions :string[];
}
