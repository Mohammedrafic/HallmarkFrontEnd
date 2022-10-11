import { ContactUs } from '../shared/models/contact-us.model';


export class SaveContactUsForm {
  static readonly type = '[contactus form] Save Contact Us';
  constructor(public contactUs: ContactUs) {}
}

export class SaveContactUsFormSucceeded {
  static readonly type = '[contactus form] Save Contact Us Form Succeeded';
  constructor() {}
}