import { Observable, catchError, of } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApplicantStatus } from '@shared/models/order-management.model';
import { ApplicantsService } from '@shared/services/applicants.service';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { CandidateModel } from './models/candidate.model';
import { CandidatesReportDataRequestPayloadModel } from './models/candidates-report-data-request-payload.model';
import { CandidatesReportFilterFormValueModel } from './models/candidates-report-filter-form-value.model';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { PageOfCollections } from '@shared/models/page.model';
import { PageQueryParams } from '@shared/services/page-query-filter-params.service';
import { Skill } from '@shared/models/skill.model';
import { SkillsService } from '@shared/services/skills.service';
import { defaultEmptyPageOfCollections } from '@shared/constants/default-empty-page-of-collections';

@Injectable({ providedIn: 'root' })
export class CandidatesReportService {
  private static getReportDataRequestPayload(
    pageQueryParams: PageQueryParams,
    filterFormValue: CandidatesReportFilterFormValueModel
  ): CandidatesReportDataRequestPayloadModel {
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
    private readonly applicantsService: ApplicantsService,
    private readonly httpClient: HttpClient,
    private readonly orderManagementContentService: OrderManagementContentService,
    private readonly skillsService: SkillsService
  ) {}

  public getAssignedSkills(): Observable<Skill[]> {
    return this.skillsService.getAllOrganizationSkills();
  }

  public getAssociateAgencies(): Observable<AssociateAgency[]> {
    return this.orderManagementContentService.getAssociateAgencies();
  }

  public getApplicantsStatuses(): Observable<ApplicantStatus[]> {
    return this.applicantsService.getApplicantsStatuses();
  }

  public getReportData(
    pageQueryParams: PageQueryParams,
    filterFormValue: CandidatesReportFilterFormValueModel
  ): Observable<PageOfCollections<CandidateModel>> {
    const payload: CandidatesReportDataRequestPayloadModel = CandidatesReportService.getReportDataRequestPayload(
      pageQueryParams,
      filterFormValue
    );

    return this.httpClient
      .get<PageOfCollections<CandidateModel>>('/api/Reports/candidates', { params: { ...payload } })
      .pipe(catchError(() => of(defaultEmptyPageOfCollections<CandidateModel>())));
  }
}
