import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ContactUs } from '../../shared/models/contact-us.model';

@Injectable({ providedIn: 'root' })
export class ContactUsService {
  constructor(private http: HttpClient) { }

  /**
   * Save ContactUs form
   * @param payload
   */
  public saveContactUs(contactUs: ContactUs): Observable<any> {
    return this.http.post<ContactUs>('/api/ContactUs/createcontactus', contactUs);
  }
}