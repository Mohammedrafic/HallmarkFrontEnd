import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import {
  ExportCandidateAssignment,
  GetAssociateOrganizations,
  GetCandidateDetailsPage,
  GetcandidateOrgSearchbytext,
  Getcandidatesearchbytext,
  GetCandidateSkills,
  SelectNavigation,
  SetNavigation,
  SetPageNumber,
  SetPageSize,
} from '@shared/components/candidate-details/store/candidate.actions';
import { Observable, tap } from 'rxjs';
import { CandidateDetailsTabs } from '@shared/enums/candidate-tabs.enum';
import {
  CandidateDetailsPage,
  CandidatesDetailsRegions,
  CandidatesDetailsLocations,
  CandidatesDetailsDepartments,
  NavigationTabModel
} from '@shared/components/candidate-details/models/candidate.model';
import { MasterSkillByOrganization } from '@shared/models/skill.model';
import { SkillsService } from '@shared/services/skills.service';
import { CandidateDetailsApiService } from '../services/candidate-details-api.service';
import { DoNotReturnSearchCandidate, GetCandidateOrgSearch } from '@shared/models/donotreturn.model';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { AgencyOrderFilteringOptions } from '@shared/models/agency.model';

interface CandidateDetailsStateModel {
  candidateDetailsPage: CandidateDetailsPage | null;
  navigationTab: NavigationTabModel;
  pageNumber: number | null;
  pageSize: number | null;
  candidateSkills: MasterSkillByOrganization[];
  candidateRegions: CandidatesDetailsRegions[] | null;
  isNavigate: boolean | null;
  candidateLocations: CandidatesDetailsLocations[] | null;
  candidateDepartments: CandidatesDetailsDepartments[] | null;
  searchCandidates:DoNotReturnSearchCandidate[]|null
  searchOrgCandidates:GetCandidateOrgSearch[]|null
  associateOrganizations: AgencyOrderFilteringOptions|null;
}

@State<CandidateDetailsStateModel>({
  name: 'candidateDetails',
  defaults: {
    candidateDetailsPage: null,
    navigationTab: {
      active: CandidateDetailsTabs.All,
      pending: null,
      isRedirect: false,
    },
    pageNumber: null,
    pageSize: null,
    candidateSkills: [],
    candidateRegions: null,
    isNavigate: null,
    candidateLocations:null,
    candidateDepartments:null,
    searchCandidates:null,
    searchOrgCandidates:null,
    associateOrganizations:null,
  },
})
@Injectable()
export class CandidateDetailsState {

  @Selector()
  static candidateDetails(state: CandidateDetailsStateModel): CandidateDetailsPage | null {
    return state.candidateDetailsPage;
  }

  @Selector()
  static isNavigate(state: CandidateDetailsStateModel): boolean | null {
    return state.isNavigate;
  }

  @Selector()
  static candidateRegions(state: CandidateDetailsStateModel): CandidatesDetailsRegions[] | null {
    return state.candidateRegions;
  }

  @Selector()
  static navigationTab(state: CandidateDetailsStateModel): NavigationTabModel {
    return state.navigationTab;
  }

  @Selector()
  static pageNumber(state: CandidateDetailsStateModel): number | null {
    return state.pageNumber;
  }

  @Selector()
  static pageSize(state: CandidateDetailsStateModel): number | null {
    return state.pageSize;
  }

  @Selector()
  static candidateSkills(state: CandidateDetailsStateModel): MasterSkillByOrganization[] {
    return state.candidateSkills;
  }

   @Selector()
   static candidateLocations(state: CandidateDetailsStateModel): CandidatesDetailsLocations[] | null {
     return state.candidateLocations;
   }
   @Selector()
   static candidateDepartments(state: CandidateDetailsStateModel): CandidatesDetailsDepartments[] | null {
     return state.candidateDepartments;
   }
   @Selector()
   static associateOrganizations(state: CandidateDetailsStateModel): AgencyOrderFilteringOptions | null{
     return state.associateOrganizations  ;
   }

  constructor(private candidateDetailsApiService: CandidateDetailsApiService, private skillsService: SkillsService) {}

  @Action(GetCandidateDetailsPage, { cancelUncompleted: true })
  GetCandidateDetailsPage(
    { patchState }: StateContext<CandidateDetailsStateModel>,
    { payload }: GetCandidateDetailsPage
  ): Observable<CandidateDetailsPage> {
    return this.candidateDetailsApiService.getCandidateDetails(payload).pipe(
      tap((payload: CandidateDetailsPage) => {
        patchState({ candidateDetailsPage: payload });
        return payload;
      })
    );
  }

  @Action(SelectNavigation)
  SelectNavigationTab(
    { patchState }: StateContext<CandidateDetailsStateModel>,
    { active, pending, isRedirect }: SelectNavigation
  ): void {
    patchState({ navigationTab: { active: active!, pending, isRedirect: isRedirect! } });
    patchState({ isNavigate: isRedirect });
  }

  @Action(SetNavigation)
  SetNavigation({ patchState }: StateContext<CandidateDetailsStateModel>, { isNavigate }: SetNavigation): void {
    patchState({ isNavigate });
  }

  @Action(SetPageNumber)
  SetPageNumber({ patchState }: StateContext<CandidateDetailsStateModel>, { pageNumber }: SetPageNumber): void {
    patchState({ pageNumber });
  }

  @Action(SetPageSize)
  SetPageSize({ patchState }: StateContext<CandidateDetailsStateModel>, { pageSize }: SetPageSize): void {
    patchState({ pageSize });
  }

  @Action(Getcandidatesearchbytext)
  getDoNotCandidateListSearch({ patchState }: StateContext<CandidateDetailsStateModel>, { filter }:Getcandidatesearchbytext): Observable<DoNotReturnSearchCandidate[]> {
    return this.candidateDetailsApiService.getcandidatesearchbytext(filter).pipe(tap((payload: DoNotReturnSearchCandidate[]) => {
      patchState({ searchCandidates: payload });
      return payload
    }));
  }
  
  @Action(GetcandidateOrgSearchbytext)
  GetcandidateOrgsearchbytext({ patchState }: StateContext<CandidateDetailsStateModel>, { filter }:GetcandidateOrgSearchbytext): Observable<GetCandidateOrgSearch[]> {
    return this.candidateDetailsApiService.getcandidateOrgsearchbytext(filter).pipe(tap((payload: GetCandidateOrgSearch[]) => {
      patchState({ searchOrgCandidates: payload });
      return payload
    }));
  }

  @Action(GetCandidateSkills)
  GetCandidateSkills({ patchState }: StateContext<CandidateDetailsStateModel>): Observable<MasterSkillByOrganization[]> {
    return this.skillsService.getSortedAssignedSkillsByOrganization().pipe(
      tap((payload: MasterSkillByOrganization[]) => {
        patchState({ candidateSkills: payload });
        return payload;
      })
    );
  }

  @Action(ExportCandidateAssignment)
  ExportCandidateAssignment({ }: StateContext<CandidateDetailsStateModel>, { payload }: ExportCandidateAssignment): Observable<Blob> {
    return this.candidateDetailsApiService.export(payload).pipe(tap(file => {
      const url = window.URL.createObjectURL(file);
      saveSpreadSheetDocument(url, payload.filename || 'CandidateAssignment', payload.exportFileType);
    }));
  };

  @Action(GetAssociateOrganizations)
  GetAssociateOrganizations(
    { patchState }: StateContext<CandidateDetailsStateModel>,
    { lastSelectedBusinessUnitId }: GetAssociateOrganizations
  ): Observable<AgencyOrderFilteringOptions> {
    return this.candidateDetailsApiService.getAssociateOrganizations(lastSelectedBusinessUnitId).pipe(
      tap((payload) => {
        patchState({ associateOrganizations:payload });
      })
    );
  }
}
