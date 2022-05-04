import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { Agency } from 'src/app/shared/models/agency.model';
import { AgencyService } from '../services/agency.service';
import { SaveAgency, SaveAgencySucceeded } from './agency.actions';

export interface AgencyStateModel {
  isAgencyLoading: boolean;
  agency: Agency | null;
}

@State<AgencyStateModel>({
  name: 'agency',
  defaults: {
    agency: null,
    isAgencyLoading: false,
  },
})
@Injectable()
export class AgencyState {
  @Selector()
  static isAgencyCreated(state: AgencyStateModel): boolean { return !!state.agency?.agencyDetails.id; }

  constructor(private agencyService: AgencyService) {}

  @Action(SaveAgency)
  SaveOrganization({ patchState, dispatch }: StateContext<AgencyStateModel>, { payload }: SaveAgency): Observable<Agency> {
    patchState({ isAgencyLoading: true });
    return this.agencyService.saveAgency(payload).pipe(
      tap((payload) => {
        patchState({ isAgencyLoading: false, agency: payload });
        dispatch(new SaveAgencySucceeded(payload));
        return payload;
      })
    );
  }
}
