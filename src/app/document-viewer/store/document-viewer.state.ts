import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { DocumentViewerModel, FileGroup } from './document-viewer.state.model';
import { GetFiles, GetFilesSucceeded, GetGroupedFiles, GetPdfFiles, GetPdfFilesSucceeded } from './document-viewer.actions';
import { DocumentViewerService } from 'src/app/document-viewer/services/document-viewer.service';

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
    return this.documentViewerService.getFile(fileHash, fileId).pipe(
      tap((payload: Blob) => {
        dispatch(new GetFilesSucceeded(payload));
        return payload;
      }),
    );
  }

  @Action(GetPdfFiles)
  GetPdfFiles(
    { dispatch }: StateContext<DocumentViewerModel>,
    { fileHash, fileId }: GetPdfFiles
  ): Observable<Blob> {
    return this.documentViewerService.getPdfFile(fileHash, fileId).pipe(
      tap((payload: Blob) => {
        dispatch(new GetPdfFilesSucceeded(payload));
        return payload;
      }),
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
