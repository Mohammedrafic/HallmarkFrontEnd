import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core";
import { UserSubscription, UserSubscriptionFilters, UserSubscriptionPage } from "@shared/models/user-subscription.model";
import { Observable, of } from "rxjs";
import { BusinessUnitType } from '@shared/enums/business-unit-type';

@Injectable({
    providedIn: 'root',
  })
  export class AlertsService {
    private userSubscriptions:UserSubscription[];
    private userSubscriptionPage:UserSubscriptionPage;
constructor(private http: HttpClient) {}

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
    this.userSubscriptions=[{id:1,alert: "CandStatus: Accepted",
        isEmail: true,
        isText: true,
        isOnScreen: false},
        {id:2,alert: "CandStatus: Applied",
        isEmail: false,
        isText: true,
        isOnScreen: true},
        {id:3,alert: "CandStatus: Rejected",
        isEmail: false,
        isText: true,
        isOnScreen: true}];
    this.userSubscriptionPage={items: this.userSubscriptions,
        pageNumber: 1,
        totalPages: 2,
        totalCount: this.userSubscriptions.length,
        hasPreviousPage: false,
        hasNextPage: false}
  //return this.http.post<UserSubscriptionPage>(`/api/usersubscription/Filtered`, { BusinessUnitType, BusinessUnitIds, PageNumber, PageSize, SortModel, FilterModel, ...Filters });
return of(this.userSubscriptionPage);
}
  }