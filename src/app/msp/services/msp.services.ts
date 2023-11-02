import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MspListDto } from "../constant/msp.constant";
import { Observable } from "rxjs";
import { MSP, MspListPage } from "../store/model/msp.model";

@Injectable({ providedIn: 'root' })
export class MspService {
  constructor(private http: HttpClient) { }

  public GetMspList(): Observable<MspListPage> {       
    let params = new HttpParams();    
    params = params.append("ShowAllPages", true);    
    return this.http.get<MspListPage>(`/api/msp/filtered`, { params: params });
  }

    /**
   * Create or update organization
   * @param msp object to save
   * @return Created/Updated organization
   */
    public saveOrganization(msp: MSP): Observable<MSP> {
      // return this.http.post<MSP>(`/api/MSP`, msp);
      return msp.mspId?
        this.http.put<MSP>(`/api/MSP`, msp) :
        this.http.post<MSP>(`/api/MSP`, msp);
    }

      /**
   * Get organization by id
   * @param id
   * @return specific organization
   */
  public getOrganizationById(id: number): Observable<MSP> {
    return this.http.get<MSP>(`/api/MSP/${id}`);
  }
  
  public getMspLogo(businessUnitId: number): Observable<Blob> {
    return this.http.get(`/api/BusinessUnit/${businessUnitId}/logo`, { responseType: 'blob' });
  }
  /**
   * Get the list of available business units
   * @return Array of units
   */
  public saveMspLogo(file: Blob, businessUnitId: number): Observable<any> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post(`/api/BusinessUnit/${businessUnitId}/logo`, formData);
  }
  
    /**
   * Remove logo
   * @param businessUnitId
   */
    public removeMspLogo(businessUnitId: number): Observable<never> {
      return this.http.delete<never>(`/api/BusinessUnit/${businessUnitId}/logo`);
    }
  
}