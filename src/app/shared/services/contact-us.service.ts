import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from "rxjs";
import { ContactUs, ContactUsDto } from '../../shared/models/contact-us.model';

@Injectable({ providedIn: 'root' })
export class ContactUsService {
  constructor(private http: HttpClient) { }

  /**
   * Save ContactUs form
   * @param payload
   */
  public saveContactUs(contactUs: ContactUs): Observable<any> {
    debugger;
    const formData = new FormData();
    formData.append('file', contactUs?.selectedFile != null ? contactUs?.selectedFile : '');
    delete contactUs.selectedFile;
    const params = new HttpParams().append('content', JSON.stringify(contactUs));
    return this.http.post<ContactUsDto>(`/api/ContactUs`, formData, { params: params });
  }
}
