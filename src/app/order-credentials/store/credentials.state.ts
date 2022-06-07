import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Credential } from '@shared/models/credential.model';
import { CredentialsService } from '@shared/services/credentials.service';
import { GetAllCredentials, GetAllCredentialTypes } from './credentials.actions';
import { Observable, tap } from 'rxjs';
import { CredentialType } from '@shared/models/credential-type.model';

export interface OrderCandidatesCredentialsStateModel {
  allCredentials: Credential[];
  credentialTypes: CredentialType[];
}

@State<OrderCandidatesCredentialsStateModel>({
  name: 'orderCandidatesCredentials',
  defaults: {
    allCredentials: [],
    credentialTypes: []
  }
})
@Injectable()
export class OrderCandidatesCredentialsState {
  @Selector()
  static allCredentials(state: OrderCandidatesCredentialsStateModel): Credential[] { return state.allCredentials; }

  @Selector()
  static credentialTypes(state: OrderCandidatesCredentialsStateModel): CredentialType[] { return state.credentialTypes; }

  constructor(private credentialsService: CredentialsService) {}

  @Action(GetAllCredentials)
  GetAllCredentials({ patchState }: StateContext<OrderCandidatesCredentialsStateModel>, { }: GetAllCredentials): Observable<Credential[]> {
    return this.credentialsService.getAllCredentials().pipe(tap((payload) => {
      patchState({ allCredentials: payload });
      return payload;
    }));
  }

  @Action(GetAllCredentialTypes)
  GetAllCredentialTypes({ patchState }: StateContext<OrderCandidatesCredentialsStateModel>, { }: GetAllCredentialTypes): Observable<CredentialType[]> {
    return this.credentialsService.getCredentialTypes().pipe(tap((payload) => {
      patchState({ credentialTypes: payload });
      return payload;
    }));
  }
}
