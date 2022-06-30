import { catchError, Observable, of } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApplicantStatus } from '@shared/models/order-management.model';
import { ApplicantsService } from '@shared/services/applicants.service';
import { AssociateAgency } from '@shared/models/associate-agency.model';
import { FillrateModel } from './models/fillrate.model';
import { FillrateReportDataRequestPayloadModel } from './models/fillrate-report-data-request-payload.model';
import { FillrateReportFilterFormValueModel } from './models/fillrate-report-filter-form-value.model';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { PageOfCollections } from '@shared/models/page.model';
import { PageQueryParams } from '@shared/services/page-query-filter-params.service';
import { Skill } from '@shared/models/skill.model';
import { SkillsService } from '@shared/services/skills.service';
import { defaultEmptyPageOfCollections } from '@shared/constants/default-empty-page-of-collections';

@Injectable({ providedIn: 'root' })
export class FillratesReportService {
  private static getReportDataRequestPayload(
    pageQueryParams: PageQueryParams,
    filterFormValue: FillrateReportFilterFormValueModel
  ): FillrateReportDataRequestPayloadModel {
    return {
      agencyIds: filterFormValue.agencies ?? [],
      candidatesStatuses: filterFormValue.candidatesStatuses ?? [],
      departmentsIds: filterFormValue.departments ?? [],
      locationIds: filterFormValue.locations ?? [],
      orderTypes: filterFormValue.orderTypes ?? [],
      pageNumber: pageQueryParams.page,
      pageSize: pageQueryParams.pageSize,
      regionIds: filterFormValue.regions ?? [],
      skillIds: filterFormValue.skills ?? [],
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
    filterFormValue: FillrateReportFilterFormValueModel
  ): Observable<PageOfCollections<FillrateModel>> {
    const payload: FillrateReportDataRequestPayloadModel = FillratesReportService.getReportDataRequestPayload(
      pageQueryParams,
      filterFormValue
    );

    return this.httpClient
      .get<PageOfCollections<FillrateModel>>('/api/Reports/fillRate', { params: { ...payload } })
      .pipe(catchError(() => of(defaultEmptyPageOfCollections<FillrateModel>())));
  }
}
