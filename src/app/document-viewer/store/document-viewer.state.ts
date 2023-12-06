import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Observable, catchError, of, tap } from 'rxjs';

import { DocumentViewerModel, FileGroup, Status, Statuses } from './document-viewer.state.model';
import {
  GetFiles,
  GetFilesSucceeded,
  GetGroupedFiles,
  GetPdfFiles,
  GetPdfFilesSucceeded,
  SaveStatus
} from './document-viewer.actions';
import { DocumentViewerService } from 'src/app/document-viewer/services/document-viewer.service';
import { MessageTypes } from '@shared/enums/message-types';
import { ShowToast } from 'src/app/store/app.actions';

@State<DocumentViewerModel>({
  name: 'documentViewer',
  defaults: {
    groupedFiles: [],
    fileHash: '',
  },
})

@Injectable()
export class DocumentViewerState {
  @Selector()
  static groupedFiles(state: DocumentViewerModel): FileGroup[] {
    return state.groupedFiles;
  }

  constructor(private documentViewerService: DocumentViewerService, private store: Store) {}

  @Action(GetFiles)
  GetFiles(
    { dispatch }: StateContext<DocumentViewerModel>,
    { fileHash, fileId }: GetFiles
  ): Observable<Blob> | Observable<unknown> {
    return this.documentViewerService.getFile(fileHash, fileId).pipe(
      tap((payload: Blob) => {
        dispatch(new GetFilesSucceeded(payload));
        return payload;
      })
    );
  }

  @Action(GetPdfFiles)
  GetPdfFiles({ dispatch }: StateContext<DocumentViewerModel>, { fileHash, fileId }: GetPdfFiles): Observable<Blob> {
    return this.documentViewerService.getPdfFile(fileHash, fileId).pipe(
      tap((payload: Blob) => {
        dispatch(new GetPdfFilesSucceeded(payload));
        return payload;
      })
    );
  }

  @Action(GetGroupedFiles)
  GetGroupedFiles(
    { patchState }: StateContext<DocumentViewerModel>,
    { fileHash }: GetGroupedFiles
  ): Observable<FileGroup[]> {
    return this.documentViewerService.getFileGroups(fileHash).pipe(
      tap((payload: FileGroup[]) => {
        patchState({ groupedFiles: payload, fileHash: fileHash });
        return payload;
      })
    );
  }

  @Action(SaveStatus)
  SaveStatus(
    { dispatch }: StateContext<Statuses>,
    { payload }: SaveStatus
  ): Observable<any> {
    return this.documentViewerService.saveStatus(payload).pipe(
      tap(() => {
          dispatch(new ShowToast(MessageTypes.Success, 'Candidate was updated'));
      }),
      catchError((error) => {
        const errorMessage = error?.error?.errors.AlreadyUpdated[0];
        return of(dispatch(new ShowToast(MessageTypes.Error, errorMessage)));
      })
    );
  }
}
