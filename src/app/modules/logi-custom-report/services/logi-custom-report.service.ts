import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddLogiCustomReportRequest, LogiCustomReport, LogiCustomReportPage } from "../store/model/logi-custom-report.model";
import { useractivitlogreportPage } from "@shared/models/userlog-activity.model";

@Injectable({
  providedIn: 'root'
})
export class LogiCustomReportService {

  constructor(private http: HttpClient) { }

  /**
  * Get the list of Org Interface by  BusinessUnitId
  * @param BusinessUnitId
  * @param PageNumber
  * @param PageSize
  *
  * @return CustomReportPage
  */
  public getCustomReportPage(
    OrganizationId: number | null,
    PageNumber: number,
    PageSize: number,
  ): Observable<LogiCustomReportPage> {
   
    return this.http.post<LogiCustomReportPage>(`/api/Reporting/getCustomReportsList`, { OrganizationId, PageNumber, PageSize });
  }

  /**
 * Save Template By AlertId
 * @param AddAlertsTemplateRequest
 *
 * @return EditAlertsTemplate
 */
  public createCustomReport(
    AddLogiCustomRequest: AddLogiCustomReportRequest
  ): Observable<LogiCustomReport> {
    return this.http.post<LogiCustomReport>(`/api/Reporting/CreateCustomReport`, AddLogiCustomRequest);

  }

    /**
   * Get the orders
   @param payload filter with details we need to get
   */
   public userLogreport(payload: useractivitlogreportPage | object): Observable<useractivitlogreportPage> {
    return this.http.post<useractivitlogreportPage>(`/api/Reports/UserLogReport`, payload);
  }

}
