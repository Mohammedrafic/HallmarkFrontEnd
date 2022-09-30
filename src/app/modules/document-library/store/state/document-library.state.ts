import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { Observable, tap } from "rxjs";
import { DocumentLibraryService } from "../../services/document-library.service";
import { GetDocumentsTree } from "../actions/document-library.actions";
import { DocumentLibrary } from "../model/document-library.model";


export interface DocumentLibraryStateModel {
  documentsTree: DocumentLibrary;
}

@State<DocumentLibraryStateModel>({
  name: 'documentLibrary',
  defaults: {
    documentsTree: { documentItems: [] },
  }
})
@Injectable()
export class DocumentLibraryState {
  constructor(private documentLibraryService: DocumentLibraryService) { }

  @Selector()
  static documentsTree(state: DocumentLibraryStateModel): DocumentLibrary {
    return state.documentsTree;
  }

  @Action(GetDocumentsTree)
  GetDocumentsTree({ patchState }: StateContext<DocumentLibraryStateModel>, { }: GetDocumentsTree): Observable<DocumentLibrary> {
    return this.documentLibraryService.getDocumentsTree().pipe(
      tap((documents: DocumentLibrary) => {
        return patchState({ documentsTree: documents });
      })
    );
  }
}
