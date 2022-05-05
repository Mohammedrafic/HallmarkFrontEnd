import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { Agency, AgencyPage } from 'src/app/shared/models/agency.model';
import { AgencyService } from '../services/agency.service';
import { GetAgencyById, GetAgencyByIdSucceeded, GetAgencyByPage, SaveAgency, SaveAgencySucceeded } from './agency.actions';

export interface AgencyStateModel {
  isAgencyLoading: boolean;
  agency: Agency | null;
  agencyPage: AgencyPage | null;
}

@State<AgencyStateModel>({
  name: 'agency',
  defaults: {
    agency: null,
    agencyPage: null,
    isAgencyLoading: false,
  },
})
@Injectable()
export class AgencyState {
  @Selector()
  static isAgencyCreated(state: AgencyStateModel): boolean { return !!state.agency?.agencyDetails.id; }

  @Selector()
  static agencies(state: AgencyStateModel): AgencyPage | null { return state.agencyPage; }

  constructor(private agencyService: AgencyService) {}

  @Action(SaveAgency)
  SaveAgency({ patchState, dispatch }: StateContext<AgencyStateModel>, { payload }: SaveAgency): Observable<Agency> {
    patchState({ isAgencyLoading: true });
    return this.agencyService.saveAgency(payload).pipe(
      tap((payload) => {
        patchState({ isAgencyLoading: false, agency: payload });
        dispatch(new SaveAgencySucceeded(payload));
        return payload;
      })
    );
  }

  @Action(GetAgencyByPage)
  GetAgencyByPage({ patchState }: StateContext<AgencyStateModel>, { pageNumber, pageSize }: GetAgencyByPage): Observable<AgencyPage> {
    patchState({ isAgencyLoading: true });
    return this.agencyService.getAgencies(pageNumber, pageSize).pipe(tap((payload) => {
      patchState({ isAgencyLoading: false, agencyPage: payload });
      return payload;
    }));
  }

  @Action(GetAgencyById)
  GetAgencyById({ patchState, dispatch }: StateContext<AgencyStateModel>, { payload }: GetAgencyById): Observable<Agency> {
    patchState({ isAgencyLoading: true });
    return this.agencyService.getAgencyById(payload).pipe(tap((payload) => {
      patchState({ isAgencyLoading: false, agency: payload });
      dispatch(new GetAgencyByIdSucceeded(payload));
      return payload;
    }));
  }
}
