import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import {
  GetCandidateDetailsPage,
  GetCandidateRegions,
  Getcandidatesearchbytext,
  GetCandidateSkills,
  SelectNavigation,
  SetNavigation,
  SetPageNumber,
  SetPageSize
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
import { DoNotReturnStateModel } from '@client/do-not-return/do-not-return.interface';
import { DoNotReturnSearchCandidate } from '@shared/models/donotreturn.model';

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
    searchCandidates:null
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


  @Action(GetCandidateRegions)
  GetCandidateRegions({ patchState }: StateContext<CandidateDetailsStateModel>): Observable<CandidatesDetailsRegions[]> {
    return this.candidateDetailsApiService.getRegions().pipe(
      tap((payload: CandidatesDetailsRegions[]) => {
        patchState({ candidateRegions: payload });
        return payload;
      })
    );
  }
  @Action(Getcandidatesearchbytext)
  getDoNotCandidateListSearch({ patchState }: StateContext<CandidateDetailsStateModel>, { filter }:Getcandidatesearchbytext): Observable<DoNotReturnSearchCandidate[]> {
    return this.candidateDetailsApiService.getcandidatesearchbytext(filter).pipe(tap((payload: DoNotReturnSearchCandidate[]) => {
      patchState({ searchCandidates: payload });
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
}
