
export class ContactUs {
  fromMail:string;
  name: string;
  status? :number |null;
  businessUnitId?: number | null;
  bodyMail : string;
  subjectMail: string;
  selectedFile?: Blob | null
}

export class ContactUsDto {
  fromMail: string;
  name: string;
  status?: number | null;
  businessUnitId?: number | null;
  bodyMail: string;
  subjectMail: string;
}


