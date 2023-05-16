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
import { DoNotReturn } from './donotreturn.actions';
import { HttpErrorResponse } from '@angular/common/http';
import { DoNotReturnStateModel } from '@client/do-not-return/do-not-return.interface';
import { BLOCK_RECORD_SUCCESS, RECORD_SAVED_SUCCESS, RECORD_ALREADY_EXISTS,CANDIDATE_UNBLOCK,CANDIDATE_BLOCK } from '@shared/constants';

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

  @Action(DoNotReturn.GetAllOrganization)
  GetAllOrganization({ patchState }: StateContext<DoNotReturnStateModel>,
    { }: DoNotReturn.GetAllOrganization): Observable<UserAgencyOrganization> {
    return this.DonotreturnService.allOrganizations().pipe(tap((data) => {
      patchState({ allOrganizations: data.businessUnits.sort((a, b) => (a.name as string).localeCompare(b.name as string)) });
      return data;
    }));
  }

  @Action(DoNotReturn.UpdateDoNotReturn)
  UpdateDoNotReturn(
    { patchState, dispatch }: StateContext<DoNotReturnStateModel>,
    { donotreturn }: DoNotReturn.UpdateDoNotReturn): Observable<DonoreturnAddedit> {
    return this.DonotreturnService.updateDoNotReturn(donotreturn).pipe(
      tap((payload) => {
        patchState({ isLocationLoading: false });
        if (payload.id != 0) {
          dispatch([new DoNotReturn.UpdateDonotReturnSucceeded, new ShowToast(MessageTypes.Success, RECORD_SAVED_SUCCESS)]);
          dispatch(new DoNotReturn.GetDoNotReturnPage());
        } else {
          dispatch(new ShowToast(MessageTypes.Error, RECORD_ALREADY_EXISTS));
        }
        return payload;
      })
    );
  }

  @Action(DoNotReturn.SaveDonotreturn)
  SaveDonotreturn({ patchState, dispatch }: StateContext<DoNotReturnStateModel>, { donotreturn }: DoNotReturn.SaveDonotreturn): Observable<any> {
    const isCreating = !donotreturn.id;
    patchState({ isLocationLoading: true });
    return this.DonotreturnService.saveDonotReturn(donotreturn).pipe(tap((payload) => {
      patchState({ isLocationLoading: false });
      dispatch([new DoNotReturn.SaveDonotReturnSucceeded, new ShowToast(MessageTypes.Success, RECORD_SAVED_SUCCESS)]);
      return payload;
    }),
      catchError((error: HttpErrorResponse) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error))))
    );
  }

  @Action(DoNotReturn.GetLocationByOrgId)
  GetLocationsByOrgId(
    { patchState }: StateContext<DoNotReturnStateModel>,
    { organizationId }: DoNotReturn.GetLocationByOrgId): Observable<GetLocationByOrganization[]> {
    return this.DonotreturnService.getLocationsByOrganizationId(organizationId).pipe(
      tap((payload) => {
        patchState({ locations: payload.sort((a, b) => (a.Name as string).localeCompare(b.Name as string)) });
        return payload;
      })
    );
  }

  @Action(DoNotReturn.RemoveDonotReturn)
  RemoveDonotReturn({ patchState, dispatch }: StateContext<DoNotReturnStateModel>, { payload }: DoNotReturn.RemoveDonotReturn): Observable<DonoreturnAddedit> {
    patchState({ donotloadings: true });
    return this.DonotreturnService.removeDonotReturn(payload).pipe(tap((payload) => {
      patchState({ donotloadings: false });
      dispatch([new DoNotReturn.RemoveDonotReturnSucceeded, new ShowToast(MessageTypes.Success, BLOCK_RECORD_SUCCESS)]);
      return payload;
    }))
  }

  @Action(DoNotReturn.DonotreturnByPage)
  DonotreturnByPage({ patchState }: StateContext<DoNotReturnStateModel>, { pageNumber, pageSize, filters, sortBy }: DoNotReturn.DonotreturnByPage): Observable<DoNotReturnsPage> {
    patchState({ donotloadings: true });
    return this.DonotreturnService.getDonotreturn(pageNumber, pageSize, filters, sortBy).pipe(
      tap((payload) => {
        patchState({ donotloadings: false, donotreturnpage: payload });
        return payload;
      })
    );
  }

  @Action(DoNotReturn.ExportDonotreturn)
  ExportSkills({ }: StateContext<DoNotReturnStateModel>, { payload }: DoNotReturn.ExportDonotreturn): Observable<Blob> {
    return this.DonotreturnService.export(payload).pipe(tap(file => {
      const url = window.URL.createObjectURL(file);
      saveSpreadSheetDocument(url, payload.filename || 'DoNotReturn', payload.exportFileType);
    }));
  };

  @Action(DoNotReturn.GetDoNotReturnCandidateSearch)
  GetDoNotReturnCandidateSearch({ patchState }: StateContext<DoNotReturnStateModel>, { filter }: DoNotReturn.GetDoNotReturnCandidateSearch): Observable<DoNotReturnSearchCandidate[]> {
    return this.DonotreturnService.getDoNotCandidateSearch(filter).pipe(tap((payload: DoNotReturnSearchCandidate[]) => {
      patchState({ searchCandidates: payload });
      return payload
    }));
  }

  @Action(DoNotReturn.GetDoNotReturnCandidateListSearch)
  GetDoNotReturnCandidateListSearch({ patchState }: StateContext<DoNotReturnStateModel>, { filter }: DoNotReturn.GetDoNotReturnCandidateListSearch): Observable<DoNotReturnSearchCandidate[]> {
    return this.DonotreturnService.getDoNotCandidateListSearch(filter).pipe(tap((payload: DoNotReturnSearchCandidate[]) => {
      patchState({ searchCandidates: payload });
      return payload
    }));
  }
}

