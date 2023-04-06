import { CandidateAddress, CandidateProfileContactDetail } from "@shared/models/candidate.model";

export class CommonHelper{
    public static candidateAddressCheck(data:CandidateProfileContactDetail): boolean {    
        let candidateAddress :CandidateAddress = {
          'address1' : data?.address1,
          'city' : data?.city,
          'country' : data?.country,
          'state' : data?.state,
          'zip' : data?.zip,
        }    
        return Object.values(candidateAddress).filter(ele => ele === null || ele === '').length > 0;
      }
}