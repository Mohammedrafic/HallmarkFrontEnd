import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { Observable, tap } from 'rxjs';

import { CredentialsService } from '@shared/services/credentials.service';
import { CredentialList } from '@shared/components/credentials-list/store/credential-list.action';
import { CredentialFilterDataSources } from '@shared/models/credential.model';
import { CredentialsListState } from '@shared/components/credentials-list/interfaces';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { CredentialListApiService } from '@shared/components/credentials-list/services';

@State<CredentialsListState>({
  name: 'credentialList',
  defaults: {
    credentialDataSources: null
  }
})
@Injectable()
export class CredentialListState {
  constructor(
    private credentialService: CredentialsService,
    private credentialListApiService: CredentialListApiService
  ) {}

  @Selector()
  static credentialDataSources(state: CredentialsListState): CredentialFilterDataSources | null {
    return state.credentialDataSources;
  }

  @Action(CredentialList.GetCredentialsDataSources)
  GetCredentialsDataSources(
    { patchState }: StateContext<CredentialsListState>
  ): Observable<CredentialFilterDataSources> {
    return this.credentialService.getCredentialsDataSources().pipe(
      tap((credentialDataSources: CredentialFilterDataSources) => {
      patchState({ credentialDataSources });
    }));
  }

  @Action(CredentialList.ExportCredentialList)
  ExportCredentialList(
    { }: StateContext<CredentialsListState>,
    { payload, isCredentialSettings }: CredentialList.ExportCredentialList
  ): Observable<Blob> {
    return this.credentialListApiService.exportCredentialTypes(payload, isCredentialSettings).pipe(
      tap(file => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
    }));
  };
}
