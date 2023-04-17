import { GetDocumentsByCognitiveSearch, GetSharedDocumentInformation } from './../actions/document-library.actions';
import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, Observable, of, tap } from "rxjs";
import { DOCUMENT_DELETE_SUCCESS, DOCUMENT_SHARED_SUCCESS, DOCUMENT_UNSHARED_SUCCESS, DOCUMENT_UPLOAD_EDIT, DOCUMENT_UPLOAD_SUCCESS, FOLDER_DELETE_SUCCESS, RECORD_ADDED, RECORD_MODIFIED } from "../../../../shared/constants";
import { MessageTypes } from "@shared/enums/message-types";
import { ShowToast } from "../../../../store/app.actions";
import { DocumentLibraryService } from "../../services/document-library.service";
import {
  DeletDocuments, DeletDocumentsSucceeded, GetDocumentById, GetDocumentDownloadDeatils, GetDocumentDownloadDeatilsSucceeded,
  GetDocuments, GetDocumentTypes, GetFoldersTree, GetSharedDocuments, SaveDocumentFolder, SaveDocuments, SearchDocumentTags,
  ShareDocuments, ShareDocumentsSucceeded, UnShareDocuments, UnShareDocumentsSucceeded,
  GetRegionsByOrganizations, GetLocationsByRegions, GetShareAssociateAgencies, GetShareOrganizationsDtata,
  DeleteEmptyDocumentsFolder, DeletDocumentFolderSucceeded, GetDocumentPreviewDeatils, GetDocumentPreviewDeatilsSucceeded
} from "../actions/document-library.actions";
import {
  DocumentFolder, DocumentLibraryDto, Documents, DocumentsLibraryPage, DocumentTags, DocumentTypes, FolderTreeItem,
  DownloadDocumentDetail, SharedDocumentPostDto, ShareDocumentInfoPage, UnShareDocumentsFilter, AssociateAgencyDto, ShareOrganizationsData, SharedDocumentInformation
} from "../model/document-library.model";
import { Region } from "@shared/models/region.model";
import { Location } from "@shared/models/location.model";
import { BusinessUnit } from '@shared/models/business-unit.model';




export interface DocumentLibraryStateModel {
  foldersTree: FolderTreeItem[] | null;
  documentsPage: DocumentsLibraryPage | null,
  documentFolder: DocumentFolder | null
  documentTypes: DocumentTypes[] | null
  savedDocumentLibraryDto: DocumentLibraryDto | null,
  documentTags: DocumentTags[] | null,
  documentDownloadDetail: DownloadDocumentDetail | null,
  sharedDocumentPostDetails: SharedDocumentPostDto[] | null,
  documentLibraryDto: DocumentLibraryDto | null,
  shareDocumentInfoPage: ShareDocumentInfoPage | null,
  regions: Region[] | null,
  locations: Location[] | null,
  saveDocumentFolder: DocumentFolder | null,
  associateAgencies: AssociateAgencyDto[] | null,
  shareOrganizationsData: ShareOrganizationsData[] | null,
  documentPreviewDetail: DownloadDocumentDetail | null,
  businessUnits: BusinessUnit[] | null
}

@State<DocumentLibraryStateModel>({
  name: 'documentLibrary',
  defaults: {
    foldersTree: null,
    documentsPage: null,
    documentFolder: null,
    documentTypes: null,
    savedDocumentLibraryDto: null,
    documentTags: null,
    documentDownloadDetail: null,
    sharedDocumentPostDetails: null,
    documentLibraryDto: null,
    shareDocumentInfoPage: null,
    regions: null,
    locations: null,
    saveDocumentFolder: null,
    associateAgencies: null,
    shareOrganizationsData: null,
    documentPreviewDetail: null,
    businessUnits:null,
  }
})
@Injectable()
export class DocumentLibraryState {
  constructor(private documentLibraryService: DocumentLibraryService) { }

  @Selector()
  static foldersTree(state: DocumentLibraryStateModel): FolderTreeItem[] | null {
    return state.foldersTree;
  }

  @Selector()
  static documentsPage(state: DocumentLibraryStateModel): DocumentsLibraryPage | null {
    return state.documentsPage;
  }

  @Selector()
  static shareDocumentInfoPage(state: DocumentLibraryStateModel): ShareDocumentInfoPage | null {
    return state.shareDocumentInfoPage;
  }

  @Selector()
  static documentsTypes(state: DocumentLibraryStateModel): DocumentTypes[] | null {
    return state.documentTypes;
  }

  @Selector()
  static documentsTags(state: DocumentLibraryStateModel): DocumentTags[] | null {
    return state.documentTags;
  }

  @Selector()
  static documentDownloadDetail(state: DocumentLibraryStateModel): DownloadDocumentDetail | null {
    return state.documentDownloadDetail;
  }

  @Selector()
  static documentPreviewDetail(state: DocumentLibraryStateModel): DownloadDocumentDetail | null {
    return state.documentPreviewDetail;
  }

  @Selector()
  static sharedDocumentPostDetails(state: DocumentLibraryStateModel): SharedDocumentPostDto[] | null {
    return state.sharedDocumentPostDetails;
  }

  @Selector()
  static documentLibraryDto(state: DocumentLibraryStateModel): DocumentLibraryDto | null {
    return state.documentLibraryDto;
  }

  @Selector()
  static savedDocumentLibraryDto(state: DocumentLibraryStateModel): DocumentLibraryDto | null {
    return state.savedDocumentLibraryDto;
  }

  @Selector()
  static regions(state: DocumentLibraryStateModel): Region[] | null { return state.regions; }

  @Selector()
  static locations(state: DocumentLibraryStateModel): Location[] | null { return state.locations; }

  @Selector()
  static saveDocumentFolder(state: DocumentLibraryStateModel): DocumentFolder | null {
    return state.saveDocumentFolder;
  }

  @Selector()
  static getShareAssociateAgencies(state: DocumentLibraryStateModel): AssociateAgencyDto[] | null {
    return state.associateAgencies;
  }

  @Selector()
  static getShareOrganizationsData(state: DocumentLibraryStateModel): ShareOrganizationsData[] | null {
    return state.shareOrganizationsData;
  }

  @Selector()
  static getSharedDocumentInformation(state: DocumentLibraryStateModel):BusinessUnit[] | null{
    return state.businessUnits;
  }

  @Action(GetFoldersTree)
  GetFoldersTree({ dispatch,patchState }: StateContext<DocumentLibraryStateModel>, { folderTreeFilter }: GetFoldersTree): Observable<FolderTreeItem[] | void> {
    return this.documentLibraryService.getFoldersTree(folderTreeFilter).pipe(
      tap((foldersTree: FolderTreeItem[]) => {
        return patchState({ foldersTree: foldersTree });
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetDocuments)
  GetDocuments({ dispatch,patchState }: StateContext<DocumentLibraryStateModel>, { documentsFilter }: GetDocuments): Observable<DocumentsLibraryPage | void> {
    if (documentsFilter == undefined) {
      let data: DocumentsLibraryPage = {
        items: [],
        pageNumber: 1,
        totalPages: 0,
        totalCount: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      };
      return of(data);
    }
    return this.documentLibraryService.GetDocumentLibraryInfo(documentsFilter).pipe(
      tap((payload) => {
        patchState({ documentsPage: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(SaveDocumentFolder)
  SaveDocumentFolder(
    { dispatch, patchState }: StateContext<DocumentLibraryStateModel>,
    { documentFolder }: SaveDocumentFolder
  ): Observable<DocumentFolder | void> {
    return this.documentLibraryService.saveDocumentFolder(documentFolder).pipe(
      tap((folder) => {
        patchState({ saveDocumentFolder: folder });
        dispatch([
          new ShowToast(MessageTypes.Success, documentFolder.id > 0 ? RECORD_MODIFIED : RECORD_ADDED),
        ]);
        return folder;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(SaveDocuments)
  SaveDocuments(
    { dispatch, patchState }: StateContext<DocumentLibraryStateModel>,
    { document }: SaveDocuments
  ): Observable<DocumentLibraryDto | void> {
    let isEditDocument: boolean = document.isEdit != undefined ? document.isEdit : false;
    return this.documentLibraryService.saveDocuments(document).pipe(
      tap((data) => {
        patchState({ savedDocumentLibraryDto: data });
        dispatch( new ShowToast(MessageTypes.Success, isEditDocument ? DOCUMENT_UPLOAD_EDIT : DOCUMENT_UPLOAD_SUCCESS));
        return data;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
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

  @Action(GetDocumentDownloadDeatils)
  GetDocumentDownloadDeatils({ patchState, dispatch }: StateContext<DocumentLibraryStateModel>, { documentDowloadDetailFilter }: GetDocumentDownloadDeatils): Observable<DownloadDocumentDetail | void> {
    return this.documentLibraryService.GetDocumentDownloadDetails(documentDowloadDetailFilter).pipe(
      tap((payload) => {
        patchState({ documentDownloadDetail: payload });
        dispatch(new GetDocumentDownloadDeatilsSucceeded(payload));
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetDocumentPreviewDeatils)
  GetDocumentPreviewDeatils({ patchState, dispatch }: StateContext<DocumentLibraryStateModel>, { documentPreveiwDetailFilter }: GetDocumentPreviewDeatils): Observable<DownloadDocumentDetail | void> {
    return this.documentLibraryService.GetDocumentPreviewDetails(documentPreveiwDetailFilter).pipe(
      tap((payload) => {
        patchState({ documentPreviewDetail: payload });
        dispatch(new GetDocumentPreviewDeatilsSucceeded(payload));
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(DeletDocuments)
  DeletDocuments({ dispatch }: StateContext<DocumentLibraryStateModel>, { deleteDocumentsFilter }: DeletDocuments): Observable<any> {
    return this.documentLibraryService.DeleteDocumets(deleteDocumentsFilter).pipe(
      tap(() => {
        const actions = [new DeletDocumentsSucceeded(), new ShowToast(MessageTypes.Success, DOCUMENT_DELETE_SUCCESS)];
        dispatch([...actions, new DeletDocumentsSucceeded()]);
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(ShareDocuments)
  ShareDocuments(
    { patchState, dispatch }: StateContext<DocumentLibraryStateModel>,
    { shareDocumentsFilter }: ShareDocuments
  ): Observable<SharedDocumentPostDto[] | void> {
    return this.documentLibraryService.ShareDocumets(shareDocumentsFilter).pipe(
      tap((sharedocuments) => {
        patchState({ sharedDocumentPostDetails: sharedocuments });
        if (!shareDocumentsFilter.isShareWhileUpload) {
          dispatch(new ShowToast(MessageTypes.Success, DOCUMENT_SHARED_SUCCESS));
        }
        const actions = [new ShareDocumentsSucceeded()];
        dispatch([...actions]);
        return sharedocuments;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetDocumentById)
  GetDocumentById({ patchState }: StateContext<DocumentLibraryStateModel>, { documentId }: GetDocumentById): Observable<DocumentLibraryDto> {
    return this.documentLibraryService.GetDocumentById(documentId).pipe(
      tap((payload) => {
        patchState({ documentLibraryDto: payload });
      })
    );
  }

  @Action(GetSharedDocuments)
  GetSharedDocuments({ dispatch,patchState }: StateContext<DocumentLibraryStateModel>, { documentsFilter }: GetSharedDocuments): Observable<ShareDocumentInfoPage | void> {
    return this.documentLibraryService.GetSharedDocuments(documentsFilter).pipe(
      tap((payload) => {
        patchState({ shareDocumentInfoPage: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(UnShareDocuments)
  UnShareDocuments(
    { dispatch }: StateContext<DocumentLibraryStateModel>,
    { unShareDocumentsFilter }: UnShareDocuments
  ): Observable<SharedDocumentPostDto[] | void> {
    return this.documentLibraryService.UnShareDocumets(unShareDocumentsFilter).pipe(
      tap(() => {
        const actions = [new UnShareDocumentsSucceeded(), new ShowToast(MessageTypes.Success, DOCUMENT_UNSHARED_SUCCESS)];
        dispatch([...actions, new UnShareDocumentsSucceeded()]);
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetRegionsByOrganizations)
  GetRegionsByOrganizations({ patchState }: StateContext<DocumentLibraryStateModel>, { filter }: any): Observable<Region[]> {
    return this.documentLibraryService.getRegionsByOrganizationId(filter).pipe(tap((payload: any) => {
      if ("items" in payload) {
        patchState({ regions: payload.items.sort((a:any, b:any) => (a.name as string).localeCompare(b.name as string)) });
        return payload.items;
      } else {
        patchState({ regions: payload.sort((a:any, b:any) => (a.name as string).localeCompare(b.name as string)) });
        return payload
      }
    }));
  }

  @Action(GetLocationsByRegions)
  GetLocationsByRegions({ patchState }: StateContext<DocumentLibraryStateModel>, { filter }: any): Observable<Location[]> {
    return this.documentLibraryService.getLocationsByOrganizationId(filter).pipe(tap((payload: any) => {
      if ("items" in payload) {
        patchState({ locations: payload.items.sort((a:any, b:any) => (a.name as string).localeCompare(b.name as string)) });
        return payload.items;
      } else {
        patchState({ locations: payload.sort((a:any, b:any) => (a.name as string).localeCompare(b.name as string)) });
        return payload
      }
    }));
  }

  @Action(GetShareAssociateAgencies)
  GetShareAssociateAgencies({ patchState }: StateContext<DocumentLibraryStateModel>, { }: any): Observable<AssociateAgencyDto[]> {
    return this.documentLibraryService.getShareAssociateAgencies().pipe(tap((payload: any) => {
      patchState({ associateAgencies: payload });
      return payload
    }));
  }

  @Action(GetShareOrganizationsDtata)
  GetShareOrganizationsDtata({ patchState }: StateContext<DocumentLibraryStateModel>, { }: any): Observable<ShareOrganizationsData[]> {
    return this.documentLibraryService.getShareOrganizationsData().pipe(tap((payload: any) => {
      patchState({ shareOrganizationsData: payload });
      return payload
    }));
  }

  @Action(GetSharedDocumentInformation)
  GetSharedDocumentInformation({ patchState }: StateContext<DocumentLibraryStateModel>, { sharedDocumentInformation }: GetSharedDocumentInformation): Observable<BusinessUnit[]> {
    return this.documentLibraryService.getSharedDocumentInformation(sharedDocumentInformation).pipe(
      tap((payload: any) => {
        if(payload.length>0){
          patchState({ businessUnits: payload });
          return payload;
        }
        else{
          patchState({ businessUnits: null });
          return null;
        }
      })
    );
  }

  @Action(DeleteEmptyDocumentsFolder)
  DeleteEmptyDocumentsFolder({ dispatch }: StateContext<DocumentLibraryStateModel>, { deleteDocumentFolderFilter }: DeleteEmptyDocumentsFolder): Observable<any> {
    return this.documentLibraryService.DeleteFolder(deleteDocumentFolderFilter).pipe(
      tap(() => {
        const actions = [new DeletDocumentFolderSucceeded(), new ShowToast(MessageTypes.Success, FOLDER_DELETE_SUCCESS)];
        dispatch([...actions, new DeletDocumentFolderSucceeded()]);
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetDocumentsByCognitiveSearch)
  GetDocumentsByCognitiveSearch({ dispatch,patchState }: StateContext<DocumentLibraryStateModel>, { keyword, businessUnitType, businessUnitId, folderId }: GetDocumentsByCognitiveSearch): Observable<DocumentsLibraryPage | void> {
    return this.documentLibraryService.GetDocumentsByCognitiveSearch(keyword, businessUnitType, businessUnitId, folderId).pipe(
      tap((payload) => {
        patchState({ documentsPage: payload });
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  } 

}
