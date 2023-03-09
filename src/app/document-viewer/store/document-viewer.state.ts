import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, Observable, of, tap } from 'rxjs';

import { MessageTypes } from 'src/app/shared/enums/message-types';
import { ShowToast } from 'src/app/store/app.actions';
import { DocumentViewerModel, FileGroup } from './document-viewer.state.model';
import { GetFiles, GetFilesSucceeded, GetGroupedFiles, GetPdfFiles, GetPdfFilesSucceeded } from './document-viewer.actions';
import { DocumentViewerService } from '@shared/services/document-viewer.service';

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

  constructor(private documentViewerService: DocumentViewerService) {}

  @Action(GetFiles)
  GetFiles(
    { dispatch }: StateContext<DocumentViewerModel>,
    { fileHash, fileId }: GetFiles
  ): Observable<Blob> | Observable<unknown> {
    return this.documentViewerService.getFile(fileId, fileHash).pipe(
      tap((payload: Blob) => {
        dispatch(new GetFilesSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'No files found'))))
    );
  }

  @Action(GetPdfFiles)
  GetPdfFiles(
    { dispatch }: StateContext<DocumentViewerModel>,
    { fileHash, fileId }: GetPdfFiles
  ): Observable<Blob> | Observable<unknown> {
    return this.documentViewerService.getPdfFile(fileId, fileHash).pipe(
      tap((payload: Blob) => {
        dispatch(new GetPdfFilesSucceeded(payload));
        return payload;
      }),
      catchError(() => of(dispatch(new ShowToast(MessageTypes.Error, 'No files found'))))
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
}
