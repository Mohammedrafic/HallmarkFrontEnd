import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core";
import { UserSubscription, UserSubscriptionFilters, UserSubscriptionPage } from "@shared/models/user-subscription.model";
import { observable, Observable, of } from "rxjs";
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { AlertsTemplate, AlertsTemplateFilters, AlertsTemplatePage, EditAlertsTemplate } from "@shared/models/alerts-template.model";
import { AlertChannel } from "@admin/alerts/alerts.enum";

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  private userSubscriptions: UserSubscription[];
  private userSubscriptionPage: UserSubscriptionPage;
  private alertsTemplates: AlertsTemplate[];
  private alertsTemplatePage: AlertsTemplatePage;
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
    BusinessUnitIds: number[],
    PageNumber: number,
    PageSize: number,
    SortModel: any,
    FilterModel: any,
    Filters: UserSubscriptionFilters
  ): Observable<UserSubscriptionPage> {
    this.userSubscriptions = [{
      id: 1, alert: "CandStatus: Accepted",
      isEmail: true,
      isText: true,
      isOnScreen: false
    },
    {
      id: 2, alert: "CandStatus: Applied",
      isEmail: false,
      isText: true,
      isOnScreen: true
    },
    {
      id: 3, alert: "CandStatus: Rejected",
      isEmail: false,
      isText: true,
      isOnScreen: true
    }];
    this.userSubscriptionPage = {
      items: this.userSubscriptions,
      pageNumber: 1,
      totalPages: 2,
      totalCount: this.userSubscriptions.length,
      hasPreviousPage: false,
      hasNextPage: false
    }
    //return this.http.post<UserSubscriptionPage>(`/api/usersubscription/Filtered`, { BusinessUnitType, BusinessUnitIds, PageNumber, PageSize, SortModel, FilterModel, ...Filters });
    return of(this.userSubscriptionPage);
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
    PageNumber: number,
    PageSize: number,
    SortModel: any,
    FilterModel: any,
    Filters: AlertsTemplateFilters
  ): Observable<AlertsTemplate[]> {
    
    //return this.http.get<AlertsTemplatePage>(`/api/Templates/GetAlertsForTemplate`, { BusinessUnitType, PageNumber, PageSize, SortModel, FilterModel, ...Filters });
    return this.http.get<AlertsTemplate[]>(`/api/Templates/GetAlertsForTemplate/`+ BusinessUnitType);
    // ObservableColl.subscribe((data)=>{
    //   this.alertsTemplatePage = {
    //     items: data,
    //     pageNumber: 1,
    //     totalPages: 2,
    //     totalCount: data.length,
    //     hasPreviousPage: false,
    //     hasNextPage: false
    //   }
    // })
    
    //return of(this.alertsTemplatePage);
  }
  
  /**
   * Get Template By AlertId
   * @param AlertId
   * @param alertChannelId
   *
   * @return EditAlertsTemplate
   */
   public getTemplateByAlertId(
    AlertId:number,
    AlertChannelId:AlertChannel
  ): Observable<EditAlertsTemplate> {
  
    return this.http.get<EditAlertsTemplate>(`/api/Templates/GetTemplateByAlertId/`+ AlertId+`?alertChannel=`+AlertChannelId);
    
  }
  
}

  