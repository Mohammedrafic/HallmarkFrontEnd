import { Injectable } from '@angular/core';

import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, catchError, tap } from 'rxjs';

import { DocumentViewerModel, FileGroup, Status } from './document-viewer.state.model';
import {
  GetFiles,
  GetFilesSucceeded,
  GetGroupedFiles,
  GetPdfFiles,
  GetPdfFilesSucceeded,
  SaveStatus,
  SaveStatusFailed,
  SaveStatusSucceeded,
} from './document-viewer.actions';
import { DocumentViewerService } from 'src/app/document-viewer/services/document-viewer.service';
import { getAllErrors } from '@shared/utils/error.utils';
import { MessageTypes } from '@shared/enums/message-types';
import { ShowToast } from 'src/app/store/app.actions';
import { HttpErrorResponse } from '@angular/common/http';

@State<DocumentViewerModel>({
  name: 'documentViewer',
  defaults: {
    groupedFiles: [],
    fileHash: '',
  },
})
// export interface StatusModel {
//   orderId:number | null;
//   statusText:string;
//   jobId:number | null;
// }

// @State<StatusModel>({
//   name: 'status',
//   defaults:{
//     orderId: null,
//     jobId: null,
//     statusText: "",
//   }
// })

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
    { dispatch }: StateContext<Status>,
    { orderId, jobId, statusText }: SaveStatus
  ): Observable<boolean | void> {
    return this.documentViewerService.saveStatus(orderId, jobId, statusText).pipe(
      tap((res) => {
        if (res) {
          dispatch(new SaveStatusSucceeded(orderId, jobId, statusText));
        }
      }),
      catchError((err: HttpErrorResponse) => {
        dispatch(new SaveStatusFailed());
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(err.error)));
      })
    );
  }
}
