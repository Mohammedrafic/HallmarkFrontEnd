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

    public static formatTheSSN(payload:any,format:boolean = false){
      if(payload.errorRecords.length > 0){          
        payload.errorRecords.forEach((data:any)=>{
          if(data.ssn != ''){
            data.maskedssn = data.ssn.replace(/\d/g, "X");
            if(format){
              data.maskedssn = data.maskedssn.substring(0,3) + "-" + data.maskedssn.substring(3,5)+ "-" + data.maskedssn.substring(5);
            } 
          }
        })
      }
      if(payload.succesfullRecords.length > 0){          
        payload.succesfullRecords.forEach((data:any)=>{
          if(data.ssn != ''){
            data.maskedssn = data.ssn.replace(/\d/g, "X");
            if(format){
              data.maskedssn = data.maskedssn.substring(0,3) + "-" + data.maskedssn.substring(3,5)+ "-" + data.maskedssn.substring(5);
            } 
          }
        })
      }    
 
      return payload;
    }
}