import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Observable, tap } from "rxjs";
import { DocumentLibraryService } from "../../services/document-library.service";
import { GetDocumentsSelectedNode, GetDocumentsTree } from "../actions/document-library.actions";
import { DocumentLibrary, NodeItem } from "../model/document-library.model";


export interface DocumentLibraryStateModel {
  documentsTree: DocumentLibrary;
  seletedDocNode: NodeItem
}

@State<DocumentLibraryStateModel>({
  name: 'documentLibrary',
  defaults: {
    documentsTree: { documentItems: [] },
    seletedDocNode: new NodeItem()
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
}
