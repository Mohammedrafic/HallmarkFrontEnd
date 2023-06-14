import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { Credential } from '@shared/models/credential.model';
import { CredentialsService } from '@shared/services/credentials.service';
import { GetAllCredentials, GetAllCredentialTypes, GetPredefinedCredentials, UpdatePredefinedCredentials } from './credentials.actions';
import { Observable, tap } from 'rxjs';
import { CredentialType } from '@shared/models/credential-type.model';
import { IOrderCredentialItem } from '@order-credentials/types';

export interface OrderCandidatesCredentialsStateModel {
  allCredentials: Credential[];
  credentialTypes: CredentialType[];
  predefinedCredentials: IOrderCredentialItem[];
}

@State<OrderCandidatesCredentialsStateModel>({
  name: 'orderCandidatesCredentials',
  defaults: {
    allCredentials: [],
    credentialTypes: [],
    predefinedCredentials: []
  }
})
@Injectable()
export class OrderCandidatesCredentialsState {
  @Selector()
  static allCredentials(state: OrderCandidatesCredentialsStateModel): Credential[] {
    return state.allCredentials;
  }

  @Selector()
  static credentialTypes(state: OrderCandidatesCredentialsStateModel): CredentialType[] {
    return state.credentialTypes;
  }

  @Selector()
  static predefinedCredentials(state: OrderCandidatesCredentialsStateModel): IOrderCredentialItem[] {
    return state.predefinedCredentials;
  }

  constructor(private credentialsService: CredentialsService) {
  }

  @Action(GetAllCredentials)
  GetAllCredentials(
    { patchState }: StateContext<OrderCandidatesCredentialsStateModel>,
    { includeInIRP }: GetAllCredentials
  ): Observable<Credential[]> {
    return this.credentialsService.getAllCredentials(includeInIRP).pipe(tap((payload) => {
      patchState({ allCredentials: payload });
      return payload;
    }));
  }

  @Action(GetAllCredentialTypes)
  GetAllCredentialTypes({ patchState }: StateContext<OrderCandidatesCredentialsStateModel>, {}: GetAllCredentialTypes): Observable<CredentialType[]> {
    return this.credentialsService.getCredentialTypes().pipe(tap((payload) => {
      patchState({ credentialTypes: payload });
      return payload;
    }));
  }

  @Action(GetPredefinedCredentials)
  GetPredefinedCredentials({ patchState }: StateContext<OrderCandidatesCredentialsStateModel>, {
    departmentId,
    skillId,
    systemType,
  }: GetPredefinedCredentials): Observable<IOrderCredentialItem[]> {
    return this.credentialsService.getPredefinedCredentials(departmentId, skillId, systemType)
      .pipe(tap((payload: IOrderCredentialItem[]) => {
        patchState({ predefinedCredentials: payload });
      }));
  }

  @Action(UpdatePredefinedCredentials)
  UpdatePredefinedCredentials({ patchState }: StateContext<OrderCandidatesCredentialsStateModel>, { payload }: UpdatePredefinedCredentials): void {
    patchState({ predefinedCredentials: payload });
  }
}
