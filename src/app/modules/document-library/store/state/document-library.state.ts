import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, Observable, tap } from "rxjs";
import { RECORD_ADDED, RECORD_MODIFIED } from "../../../../shared/constants";
import { MessageTypes } from "../../../../shared/enums/message-types";
import { getAllErrors } from "../../../../shared/utils/error.utils";
import { ShowToast } from "../../../../store/app.actions";
import { DocumentLibraryService } from "../../services/document-library.service";
import { GetDocuments, GetDocumentsSelectedNode, GetDocumentsTree, IsAddNewFolder, SaveDocumentFolder } from "../actions/document-library.actions";
import { DocumentFolder, DocumentLibrary, DocumentsLibraryPage, NodeItem } from "../model/document-library.model";


export interface DocumentLibraryStateModel {
  documentsTree: DocumentLibrary;
  seletedDocNode: NodeItem,
  documentsPage: DocumentsLibraryPage | null,
  isAddNewFolder: boolean
  documentFolder: DocumentFolder | null
}

@State<DocumentLibraryStateModel>({
  name: 'documentLibrary',
  defaults: {
    documentsTree: { documentItems: [] },
    seletedDocNode: new NodeItem(),
    documentsPage: null,
    isAddNewFolder: false,
    documentFolder:null
  }
})
@Injectable()
export class DocumentLibraryState {
  constructor(private documentLibraryService: DocumentLibraryService) { }

  @Selector()
  static documentsTree(state: DocumentLibraryStateModel): DocumentLibrary {
    return state.documentsTree;
  }

  @Selector()
  static selectedDocumentNode(state: DocumentLibraryStateModel): NodeItem { return state.seletedDocNode; }

  @Selector()
  static isAddNewFolder(state: DocumentLibraryStateModel): boolean { return state.isAddNewFolder; }

  @Selector()
  static documentsPage(state: DocumentLibraryStateModel): DocumentsLibraryPage | null {
    return state.documentsPage;
  }

  @Action(GetDocumentsTree)
  GetDocumentsTree({ patchState }: StateContext<DocumentLibraryStateModel>, { }: GetDocumentsTree): Observable<DocumentLibrary> {
    return this.documentLibraryService.getDocumentsTree().pipe(
      tap((documents: DocumentLibrary) => {
        return patchState({ documentsTree: documents });
      })
    );
  }

  @Action(GetDocumentsSelectedNode)
  SetHeaderState({ patchState }: StateContext<DocumentLibraryStateModel>, { payload }: GetDocumentsSelectedNode): void {
    patchState({ seletedDocNode: payload });
  }

  @Action(IsAddNewFolder)
  ToggleTheme({ patchState }: StateContext<DocumentLibraryStateModel>, { payload }: IsAddNewFolder): void {
    patchState({ isAddNewFolder: payload });
  }

  @Action(GetDocuments)
  GetDocuments({ patchState }: StateContext<DocumentLibraryStateModel>, { }: GetDocuments): Observable<DocumentsLibraryPage> {
    return this.documentLibraryService.getDocuments().pipe(
      tap((payload) => {
        patchState({ documentsPage: payload });
        return payload;
      })
    );
  }

  @Action(SaveDocumentFolder)
  SaveDocumentFolder(
    { dispatch }: StateContext<DocumentLibraryStateModel>,
    { documentFolder }: SaveDocumentFolder
  ): Observable<DocumentFolder | void> {
    debugger;
    return this.documentLibraryService.saveDocumentFolder(documentFolder).pipe(
      tap((folder) => {
        dispatch([
          new ShowToast(MessageTypes.Success, documentFolder.id > 0 ? RECORD_MODIFIED : RECORD_ADDED),
        ]);
        return folder;
      }),
      catchError((error) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error?.error))))
    );
  }
}
