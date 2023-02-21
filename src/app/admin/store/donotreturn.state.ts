import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { DonoreturnAddedit, DoNotReturnSearchCandidate, DoNotReturnsPage, GetLocationByOrganization } from '@shared/models/donotreturn.model';
import { UserAgencyOrganization, UserAgencyOrganizationBusinessUnit } from '@shared/models/user-agency-organization.model';
import { DonotreturnService } from '@shared/services/donotreturn.service';
import { getAllErrors } from '@shared/utils/error.utils';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { catchError, Observable, tap } from "rxjs";
import { MessageTypes } from '@shared/enums/message-types';
import { ShowToast } from 'src/app/store/app.actions';
import { DonotreturnByPage, ExportDonotreturn, GetAllOrganization, GetDoNotReturnCandidateListSearch, GetDoNotReturnCandidateSearch, GetDoNotReturnPage, GetLocationByOrgId, RemoveDonotReturn, RemoveDonotReturnSucceeded, SaveDonotreturn, UpdateDoNotReturn } from './donotreturn.actions';
import { HttpErrorResponse } from '@angular/common/http';
import { DoNotReturnStateModel } from '@client/do-not-return/do-not-return.interface';
import { BLOCK_RECORD_SUCCESS, CANDIDATE_DONOTRETURN, RECORD_ADDED, RECORD_ALREADY_EXISTS, RECORD_MODIFIED } from '@shared/constants';

@State<DoNotReturnStateModel>({
  name: 'donotreturn',
  defaults: {
    donotreturnpage: null,
    donotloadings: false,
    masterDoNotReturn: [],
    isLocationLoading: false,
    allOrganizations: [],
    locations: [],
    searchCandidates: []
  },
})

@Injectable()
export class DonotReturnState {

  @Selector()
  static donotreturnpage(state: DoNotReturnStateModel): DoNotReturnsPage | null { return state.donotreturnpage; }

  @Selector()
  static GetLocationsByOrgId(state: DoNotReturnStateModel): GetLocationByOrganization[] { return state.locations; }

  @Selector()
  static GetCandidatesByOrgId(state: DoNotReturnStateModel): DoNotReturnsPage | null { return state.donotreturnpage; }

  @Selector()
  static GetMasterDoNotReturn(state: DoNotReturnStateModel): DonoreturnAddedit[] { return state.masterDoNotReturn; }

  @Selector()
  static allOrganizations(state: DoNotReturnStateModel): UserAgencyOrganizationBusinessUnit[] { return state.allOrganizations; }

  constructor(private DonotreturnService: DonotreturnService) { }

  @Action(GetAllOrganization)
  GetAllOrganization({ patchState }: StateContext<DoNotReturnStateModel>,
    { }: GetAllOrganization): Observable<UserAgencyOrganization> {
    return this.DonotreturnService.allOrganizations().pipe(tap((data) => {
      patchState({ allOrganizations: data.businessUnits });
      return data;
    }));
  }

  @Action(UpdateDoNotReturn)
  UpdateDoNotReturn(
    { patchState, dispatch }: StateContext<DoNotReturnStateModel>,
    { donotreturn }: UpdateDoNotReturn): Observable<DonoreturnAddedit> {
    return this.DonotreturnService.updateDoNotReturn(donotreturn).pipe(
      tap((payload) => {
        patchState({ isLocationLoading: false });
        if (payload.id != 0) {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
          dispatch(new GetDoNotReturnPage());
        } else {
          dispatch(new ShowToast(MessageTypes.Error, RECORD_ALREADY_EXISTS));
        }
        return payload;
      })
    );
  }

  @Action(SaveDonotreturn)
  SaveDonotreturn({ patchState, dispatch }: StateContext<DoNotReturnStateModel>, { donotreturn }: SaveDonotreturn): Observable<any> {
    const isCreating = !donotreturn.id;
    patchState({ isLocationLoading: true });
    return this.DonotreturnService.saveDonotReturn(donotreturn).pipe(tap((payload) => {
      patchState({ isLocationLoading: false });
      dispatch(new ShowToast(MessageTypes.Success, isCreating ? RECORD_ADDED : RECORD_MODIFIED));
      return payload;
    }),
      catchError((error: HttpErrorResponse) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))
    );
  }

  @Action(GetLocationByOrgId)
  GetLocationsByOrgId(
    { patchState }: StateContext<DoNotReturnStateModel>,
    { organizationId }: GetLocationByOrgId): Observable<GetLocationByOrganization[]> {
    return this.DonotreturnService.getLocationsByOrganizationId(organizationId).pipe(
      tap((payload) => {
        patchState({ locations: payload });
        return payload;
      })
    );
  }

  @Action(RemoveDonotReturn)
  RemoveDonotReturn({ patchState, dispatch }: StateContext<DoNotReturnStateModel>, { payload }: RemoveDonotReturn): Observable<DonoreturnAddedit> {
    patchState({ donotloadings: true });
    return this.DonotreturnService.removeDonotReturn(payload).pipe(tap((payload) => {
      patchState({ donotloadings: false });
      dispatch([new RemoveDonotReturnSucceeded, new ShowToast(MessageTypes.Success, BLOCK_RECORD_SUCCESS)]);
      return payload;
    }))
  }

  @Action(DonotreturnByPage)
  DonotreturnByPage({ patchState }: StateContext<DoNotReturnStateModel>, { pageNumber, pageSize, filters }: DonotreturnByPage): Observable<DoNotReturnsPage> {
    patchState({ donotloadings: true });
    return this.DonotreturnService.getDonotreturn(pageNumber, pageSize, filters).pipe(
      tap((payload) => {
        patchState({ donotloadings: false, donotreturnpage: payload });
        return payload;
      })
    );
  }

  @Action(ExportDonotreturn)
  ExportSkills({ }: StateContext<DoNotReturnStateModel>, { payload }: ExportDonotreturn): Observable<Blob> {
    return this.DonotreturnService.export(payload).pipe(tap(file => {
      const url = window.URL.createObjectURL(file);
      saveSpreadSheetDocument(url, payload.filename || 'DoNotReturn', payload.exportFileType);
    }));
  };

  @Action(GetDoNotReturnCandidateSearch)
  GetDoNotReturnCandidateSearch({ patchState }: StateContext<DoNotReturnStateModel>, { filter }: GetDoNotReturnCandidateSearch): Observable<DoNotReturnSearchCandidate[]> {
    return this.DonotreturnService.getDoNotCandidateSearch(filter).pipe(tap((payload: DoNotReturnSearchCandidate[]) => {
      patchState({ searchCandidates: payload });
      return payload
    }));
  }

  @Action(GetDoNotReturnCandidateListSearch)
  GetDoNotReturnCandidateListSearch({ patchState }: StateContext<DoNotReturnStateModel>, { filter }: GetDoNotReturnCandidateListSearch): Observable<DoNotReturnSearchCandidate[]> {
    return this.DonotreturnService.getDoNotCandidateListSearch(filter).pipe(tap((payload: DoNotReturnSearchCandidate[]) => {
      patchState({ searchCandidates: payload });
      return payload
    }));
  }
}

