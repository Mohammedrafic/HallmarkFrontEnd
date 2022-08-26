import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core";
import { UserSubscription, UserSubscriptionFilters, UserSubscriptionPage ,UserSubscriptionRequest} from "@shared/models/user-subscription.model";
import { observable, Observable, of } from "rxjs";
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { AddAlertsTemplateRequest, AlertsTemplate, AlertsTemplateFilters, AlertsTemplatePage, EditAlertsTemplate, EditAlertsTemplateRequest } from "@shared/models/alerts-template.model";
import { AlertChannel } from "@admin/alerts/alerts.enum";

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
   private  userSubscriptionPage:UserSubscriptionPage; 
  constructor(private http: HttpClient) { }

  /**
   * Get the list of UserSubscription by BusinessUnitType and BusinessUnitId
   * @param BusinessUnitType
   * @param BusinessUnitIds
   * @param PageNumber
   * @param PageSize
   * @param Filters
   *
   * @return UserSubscriptionPage
   */
  public getUserSubscriptionPage(
    BusinessUnitType: BusinessUnitType,
    UserId: string,
    PageNumber: number,
    PageSize: number,
    SortModel: any,
    FilterModel: any,
    Filters: UserSubscriptionFilters
  ): Observable<UserSubscriptionPage> {
    if(UserId==null)
    {
      return of(this.userSubscriptionPage);
    }
    return this.http.get<UserSubscriptionPage>(`/api/UserSubscription/GetPagedUserSubscriptions/`+BusinessUnitType+`/`+UserId,{params: { pageNumber:PageNumber,pageSize: PageSize }});
  }
  /**
   * Update UserSubscription 
   * @param UserSubscriptionRequest   
   *
   * @return void
   */
   public updateUserSubscription(
    UserSubscriptionRequest:UserSubscriptionRequest    
  ): Observable<void> {  
     return this.http.post<void>(`/api/UserSubscription/`,UserSubscriptionRequest);
  }
  /**
   * Get the list of AlertsTemplate
   * @param PageNumber
   * @param PageSize
   * @param Filters
   *
   * @return UserSubscriptionPage
   */
   public getAlertsTemplatePage(
    BusinessUnitType:BusinessUnitType,
    BusinessUnitId:number,
    PageNumber: number,
    PageSize: number,
    SortModel: any,
    FilterModel: any,
    Filters: AlertsTemplateFilters
  ): Observable<AlertsTemplatePage> {    
    return this.http.get<AlertsTemplatePage>(`/api/Templates/GetAlertsForTemplate/`+BusinessUnitType,{ params: {BusinessUnitId :BusinessUnitId, PageNumber: PageNumber, PageSize: PageSize }});
      }
  
  /**
   * Get Template By AlertId
   * @param AlertId
   * @param AlertChannelId
   *
   * @return EditAlertsTemplate
   */
   public getTemplateByAlertId(
    AlertId:number,
    AlertChannel:AlertChannel,
    BusinessUnitId:any
  ): Observable<EditAlertsTemplate> {     
     if(BusinessUnitId==null)
     {
      return this.http.get<EditAlertsTemplate>(`/api/Templates/GetTemplateByAlertId/`+ AlertId,{params:{AlertChannel: AlertChannel}});
     }
    return this.http.get<EditAlertsTemplate>(`/api/Templates/GetTemplateByAlertId/`+ AlertId,{params:{AlertChannel: AlertChannel, BusinessUnitId: BusinessUnitId}});
  }

  /**
   * Save Template By AlertId
   * @param AddAlertsTemplateRequest
   *
   * @return EditAlertsTemplate
   */
  public saveTemplateByAlertId(
    AddAlertsTemplateRequest: AddAlertsTemplateRequest
   ): Observable<EditAlertsTemplate> {     
    return this.http.post<EditAlertsTemplate>(`/api/Templates/`, AddAlertsTemplateRequest);
     
  }
  /**
   * Update Template By AlertId
   * @param EditAlertsTemplateRequest
   *
   * @return EditAlertsTemplate
   */
  public updateTemplateByAlertId(
    EditAlertsTemplateRequest: EditAlertsTemplateRequest
  ): Observable<EditAlertsTemplate> {    
    return this.http.put<EditAlertsTemplate>(`/api/Templates/`, EditAlertsTemplateRequest);
  }
  
}

