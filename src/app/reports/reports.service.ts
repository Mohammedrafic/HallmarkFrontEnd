import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApplicantStatus } from '@shared/models/order-management.model';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { CandidateModel } from './models/candidate.model';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { PageOfCollections } from '@shared/models/page.model';
import { PageQueryParams } from '@shared/services/page-query-filter-params.service';
import { ReportDataRequestPayloadModel } from './models/report-data-request-payload.model';
import { ReportFilterFormValueModel } from './models/report-filter-form-value.model';
import { Skill } from '@shared/models/skill.model';
import { SkillsService } from '@shared/services/skills.service';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private static getReportDataRequestPayload(
    pageQueryParams: PageQueryParams,
    filterFormValue: ReportFilterFormValueModel
  ): ReportDataRequestPayloadModel {
    return {
      agencies: filterFormValue.agencies ?? [],
      applicantStatus: filterFormValue.statuses ?? [],
      candidateName: filterFormValue.candidateName ?? '',
      pageNumber: pageQueryParams.page,
      pageSize: pageQueryParams.pageSize,
      skills: filterFormValue.skills ?? [],
    };
  }

  public constructor(
    private readonly skillsService: SkillsService,
    private readonly orderManagementContentService: OrderManagementContentService,
    private readonly httpClient: HttpClient
  ) {}

  public getAssignedSkills(): Observable<Skill[]> {
    return this.skillsService.getAllOrganizationSkills();
  }

  public getAssociateAgencies(): Observable<AssociateAgency[]> {
    return this.orderManagementContentService.getAssociateAgencies();
  }

  public getApplicantsStatuses(): Observable<ApplicantStatus[]> {
    return this.httpClient.get<ApplicantStatus[]>('/api/Applicants/filterstatuses');
  }

  public getReportData(
    pageQueryParams: PageQueryParams,
    filterFormValue: ReportFilterFormValueModel
  ): Observable<PageOfCollections<CandidateModel>> {
    const payload: ReportDataRequestPayloadModel = ReportsService.getReportDataRequestPayload(
      pageQueryParams,
      filterFormValue
    );

    return this.httpClient.get<PageOfCollections<CandidateModel>>('/api/Reports/candidates', {
      params: { ...payload },
    });
  }
}
