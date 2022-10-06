import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { GroupEmailByBusinessUnitIdPage, GroupEmailFilters } from "@shared/models/group-email.model";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root',
  })
  export class GroupEmailService {
     private  groupEmailByBusinessUnitIdPage:GroupEmailByBusinessUnitIdPage; 
    constructor(private http: HttpClient) { }

     /**
   * Get the list of Group Email by BusinessUnitId
   * @param BusinessUnitType
   * @param BusinessUnitIds
   * @param PageNumber
   * @param PageSize
   * @param Filters
   *
   * @return GroupEmailByBusinessUnitIdPage
   */
  public getGroupMailByBusinessUnitIdPage(
    BusinessUnitId: number | null,
    PageNumber: number,
    PageSize: number,
    SortModel: any,
    FilterModel: any,
    Filters: GroupEmailFilters
  ): Observable<GroupEmailByBusinessUnitIdPage> {
    if(BusinessUnitId==null)
    {
    return this.http.get<GroupEmailByBusinessUnitIdPage>(`/api/GroupMail/getgroupmail`,{params: { pageNumber:PageNumber,pageSize: PageSize }}); 
    
    }
    return this.http.get<GroupEmailByBusinessUnitIdPage>(`/api/GroupMail/getgroupmail?BusinessUnitId=`+BusinessUnitId,{params: { pageNumber:PageNumber,pageSize: PageSize }});
  }
  }