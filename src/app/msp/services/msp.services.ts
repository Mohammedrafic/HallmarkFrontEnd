import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MspListDto } from "../constant/msp.constant";
import { map, Observable } from "rxjs";
import { MSP, MSPAssociateOrganizationsAgency, MSPAssociateOrganizationsAgencyPage, MspListPage } from "../store/model/msp.model";
import { sortByField } from "../../shared/helpers/sort-by-field.helper";

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

  /**
   * Remove holiday by its id
   * @param id
   */
  public removeMsp(id: number): Observable<any> {
    return this.http.delete<any>(`/api/msp/deleteMsp/${id}`);
  }

  /**
   * @param pageNumber,
   * @param pageSize
   * @return msp associate list
   */
  public getMSPAssociateListByPage(pageNumber: number, pageSize: number): Observable<MSPAssociateOrganizationsAgencyPage> {
    return this.http.post<any>(
      `/api/msp/MspAssociatedAgencies`, {  pageNumber, pageSize  }
    );
  }

  public deleteMspAssociateOrganizationsAgencyById(id: number): Observable<never> {
    return this.http.delete<never>(`/api/msp/deleteMspAssociatedAgency/${id}`);
  }

  /**
   * @return MSP Associate Agency dropdown
   */
  public getMspAssociateAgency(): Observable<{ id: number, name: string }[]> {
    return this.http.get<{ id: number, name: string }[]>('/api/msp/getMspAssociateAgencies').pipe(map((data) => sortByField(data, 'name')));
  }

  /**
   * Associate Msp to Agency
   * @param agencyIds
   */
  public associateMsptoAgency(agencyIds: number[]): Observable<MSPAssociateOrganizationsAgency[]> {
    return this.http.post<MSPAssociateOrganizationsAgency[]>(`/api/msp/CreateMspAssociateAgency`, {
      businessUnitIds: agencyIds,
    });
  }
}
