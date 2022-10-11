import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { GroupEmail, GroupEmailByBusinessUnitIdPage, GroupEmailFilters, GroupEmailRequest } from "@shared/models/group-email.model";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root',
  })
  export class GroupEmailService {
     private  groupEmailByBusinessUnitIdPage:GroupEmailByBusinessUnitIdPage; 
    constructor(private http: HttpClient) { }

     /**
   * Get the list of Group Email by BusinessUnitId  
   * @param BusinessUnitId
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
   /**
   * Send Group Email 
   * @param groupEmailRequest   
   *
   * @return GroupEmail
   */
    public SendGroupEmail(
      groupEmailRequest:GroupEmailRequest    
    ): Observable<GroupEmail> {  
       return this.http.post<GroupEmail>(`/api/GroupMail/creategroupmail`,groupEmailRequest);
    }
    /**
   * Get Group Email By Id
   * @param id   
   *
   * @return GroupEmail
   */
     public GetGroupEmailById(
      id:number    
    ): Observable<GroupEmail> {  
       return this.http.get<GroupEmail>(`/api/GroupMail/getgroupmailbyid?Id=`+id);
    }
  }