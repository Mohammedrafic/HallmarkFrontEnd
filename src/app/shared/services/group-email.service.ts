import {
  AgencyDto,
  CandidateStatusAndReasonFilterOptionsDto,
  MasterSkillDto,
} from './../../admin/analytics/models/common-report.model';
import { User } from './../models/user.model';
import { GroupEmailRole } from './../models/group-email.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  GroupEmail,
  GroupEmailByBusinessUnitIdPage,
  GroupEmailFilters,
  GroupEmailRequest,
  SendGroupEmailRequest,
} from '@shared/models/group-email.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GroupEmailService {
  private groupEmailByBusinessUnitIdPage: GroupEmailByBusinessUnitIdPage;
  constructor(private http: HttpClient) {}

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
    GetAll: boolean
  ): Observable<GroupEmailByBusinessUnitIdPage> {
    if (BusinessUnitId == null) {
      return this.http.get<GroupEmailByBusinessUnitIdPage>(`/api/GroupMail/getgroupmail?GetAll=` + GetAll);
    }
    return this.http.get<GroupEmailByBusinessUnitIdPage>(
      `/api/GroupMail/getgroupmail?BusinessUnitId=` + BusinessUnitId + `&GetAll=` + GetAll
    );
  }
  /**
   * Send Group Email
   * @param groupEmailRequest
   *
   * @return GroupEmail
   */
  public SendGroupEmail(groupEmailRequest: SendGroupEmailRequest): Observable<GroupEmail> {
    const formData = new FormData();
    formData.append('file', groupEmailRequest?.selectedFile != null ? groupEmailRequest?.selectedFile : '');
    delete groupEmailRequest.selectedFile;
    const params = new HttpParams().append('content', JSON.stringify(groupEmailRequest));
    return this.http.post<GroupEmail>(`/api/GroupMail/creategroupmail`, formData, { params: params });
  }
  /**
   * Get Group Email By Id
   * @param id
   *
   * @return GroupEmail
   */
  public GetGroupEmailById(id: number): Observable<GroupEmail> {
    return this.http.get<GroupEmail>(`/api/GroupMail/getgroupmailbyid?Id=` + id);
  }

  /**
   * Get Group Email Roles By Organization Id
   * @param id
   *
   * @return GroupEmail
   */
  public GetGroupEmailRolesByOrgId(id: number): Observable<GroupEmailRole> {
    return this.http.get<GroupEmailRole>(`/api/GroupMail/getroles?OrganizationId=` + id);
  }

  /**
   * Get Group Email internal users By regionId, locationId and roles
   * @param regionIds
   * @param locationIds
   * @param roles
   * @return User
   */
  public GetGroupEmailUsersByRegionLocation(regionIds: string, locationIds: string, roles: string): Observable<User> {
    return this.http.get<User>(
      `/api/GroupMail/getinternalusers?regionIds=${regionIds}&locationIds=${locationIds}&roles=${roles}`
    );
  }

  /**
   * Get Group Email Agencies By business unit
   * @param businessUnitId
   * @return Agency
   */
  public GetGroupEmailAgenciesByBusinessUnit(businessUnitId: number): Observable<AgencyDto> {
    return this.http.get<AgencyDto>(`/api/GroupMail/getagencies?businessUnitId=${businessUnitId}`);
  }

  /**
   * Get Group Email skills By business unit
   * @param businessUnitId
   * @return skills
   */
  public GetGroupEmailSkillsByBusinessUnit(businessUnitId: number, isAgency: number): Observable<MasterSkillDto> {
    return this.http.get<MasterSkillDto>(
      `/api/GroupMail/getskills?businessUnitId=${businessUnitId}&isAgency=${isAgency==1?true:false}`
    );
  }

  /**
   * Get Group Email candidate status By business unit
   * @param businessUnitId
   * @return candidateStatus
   */
  public GetGroupEmailCandidateStatusesByBusinessUnit(
    businessUnitId: number
  ): Observable<CandidateStatusAndReasonFilterOptionsDto> {
    return this.http.get<CandidateStatusAndReasonFilterOptionsDto>(
      `/api/GroupMail/getcandidatestatuses?businessUnitId=${businessUnitId}`
    );
  }

  /**
   * Get Group Email candidates
   * @param agencies
   * @param skills
   * @param regionIds
   * @param locationIds
   * @param orderTypes
   * @param statuses
   * @param jobID
   * @param isAgency
   * @param businessUnitIds
   * @return User
   */
  public GetGroupEmailCandidates(
    agencies: string,
    skills: string,
    regionIds: string,
    locationIds: string,
    orderTypes: string,
    statuses: string,
    jobID: string,
    isAgency: boolean,
    businessUnitIds: string
  ): Observable<User> {
    return this.http.get<User>(
      `/api/GroupMail/getcandidates?agencies=${agencies}&skills=${skills}&regions=${regionIds}&locations=${locationIds}&orderTypes=${orderTypes}&statuses=${statuses}&jobID=${jobID}&isAgency=${isAgency}&businessUnitIds=${businessUnitIds}`
    );
  }
}
