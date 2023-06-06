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

    public static formatTheSSN(data:any){
      data.ssn = data.ssn.substring(0,3) + "-" + data.ssn.substring(3,5)+ "-" + data.ssn.substring(5);
      return data;
    }
}