import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, Observable, tap } from "rxjs";
import { RECORD_ADDED, RECORD_MODIFIED } from "../../../../shared/constants";
import { MessageTypes } from "../../../../shared/enums/message-types";
import { getAllErrors } from "../../../../shared/utils/error.utils";
import { ShowToast } from "../../../../store/app.actions";
import { DocumentLibraryService } from "../../services/document-library.service";
import { GetDocuments, GetDocumentsSelectedNode, GetDocumentsTree, GetDocumentTypes, IsAddNewFolder, SaveDocumentFolder, SaveDocuments, SearchDocumentTags } from "../actions/document-library.actions";
import { DocumentFolder, DocumentLibrary, DocumentLibraryDto, Documents, DocumentsLibraryPage, DocumentTags, DocumentTypes, NodeItem } from "../model/document-library.model";


export interface DocumentLibraryStateModel {
  documentsTree: DocumentLibrary;
  seletedDocNode: NodeItem,
  documentsPage: DocumentsLibraryPage | null,
  isAddNewFolder: boolean
  documentFolder: DocumentFolder | null
  documentTypes: DocumentTypes[] | null
  documents: Documents | null,
  documentTags: DocumentTags[] | null
}

@State<DocumentLibraryStateModel>({
  name: 'documentLibrary',
  defaults: {
    documentsTree: { documentItems: [] },
    seletedDocNode: new NodeItem(),
    documentsPage: null,
    isAddNewFolder: false,
    documentFolder: null,
    documentTypes: null,
    documents: null,
    documentTags:null
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

  @Selector()
  static documentsTypes(state: DocumentLibraryStateModel): DocumentTypes[] | null {
    return state.documentTypes;
  }

  @Selector()
  static documentsTags(state: DocumentLibraryStateModel): DocumentTags[] | null {
    return state.documentTags;
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
  GetDocumentsSelectedNode({ patchState }: StateContext<DocumentLibraryStateModel>, { payload }: GetDocumentsSelectedNode): void {
    patchState({ seletedDocNode: payload });
  }

  @Action(IsAddNewFolder)
  ToggleTheme({ patchState }: StateContext<DocumentLibraryStateModel>, { payload }: IsAddNewFolder): void {
    patchState({ isAddNewFolder: payload });
  }

  @Action(GetDocuments)
  GetDocuments({ patchState }: StateContext<DocumentLibraryStateModel>, { documentsFilter }: GetDocuments): Observable<DocumentsLibraryPage> {
    return this.documentLibraryService.GetDocuments(documentsFilter).pipe(
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

  @Action(SaveDocuments)
  SaveDocuments(
    { dispatch }: StateContext<DocumentLibraryStateModel>,
    { document }: SaveDocuments
  ): Observable<DocumentLibraryDto | void> {
    return this.documentLibraryService.saveDocuments(document).pipe(
      tap((document) => {
        dispatch([
          new ShowToast(MessageTypes.Success, document.id > 0 ? RECORD_MODIFIED : RECORD_ADDED),
        ]);
        return document;
      }),
      catchError((error) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error?.error))))
    );
  }

  @Action(GetDocumentTypes)
  GetDocumentTypes({ patchState }: StateContext<DocumentLibraryStateModel>, { documentTypeFilter }: GetDocumentTypes): Observable<DocumentTypes[]> {
    return this.documentLibraryService.GetDocumentTypes(documentTypeFilter).pipe(
      tap((payload) => {
        patchState({ documentTypes: payload });
        return payload;
      })
    );
  }
  @Action(SearchDocumentTags)
  SearchDocumentTags({ patchState }: StateContext<DocumentLibraryStateModel>, { documentTagFilter }: SearchDocumentTags): Observable<DocumentTags[]> {
    return this.documentLibraryService.SearchDocumentTags(documentTagFilter).pipe(
      tap((payload) => {
        patchState({ documentTags: payload });
        return payload;
      })
    );
  }
}
