import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { HttpClient, HttpParams } from '@angular/common/http';
import { DocumentFolder, DocumentItem, DocumentLibrary, DocumentLibraryDto, Documents, DocumentsFilter, DocumentsLibraryPage, DocumentTagFilter, DocumentTags, DocumentTypeFilter, DocumentTypes } from "../store/model/document-library.model";

@Injectable({ providedIn: 'root' })
export class DocumentLibraryService {
  constructor(private http: HttpClient) { }

  public getDocumentsTree(): Observable<DocumentLibrary> {
    const documentItems: DocumentItem[] = [];
    let data: DocumentLibrary = {
      documentItems: documentItems
    };
    return of(data);
  }

  public GetDocuments(documentsFilter: DocumentsFilter): Observable<DocumentsLibraryPage> {
    let params = new HttpParams();
    params = params.append("BusinessUnitType", documentsFilter == undefined ? 1 : documentsFilter.businessUnitType);
    if (documentsFilter?.businessUnitId && documentsFilter?.businessUnitId != null)
      params = params.append("BusinessUnitId", documentsFilter.businessUnitId);
    if (documentsFilter?.regionId && documentsFilter?.regionId != null)
      params = params.append("RegionId", documentsFilter.regionId);
    if (documentsFilter?.locationId && documentsFilter?.locationId != null)
      params = params.append("LocationId", documentsFilter.locationId);
    if (documentsFilter?.folderId && documentsFilter?.folderId != null)
      params = params.append("FolderId", documentsFilter.folderId);
    return this.http.get<DocumentsLibraryPage>(`/api/DocumentLibrary/Filtered`, { params: params });
  }

  /**
  * insert a document folder record
  * @return created record
  */
  public saveDocumentFolder(documentFolder: DocumentFolder): Observable<DocumentFolder> {
    return this.http.post<DocumentFolder>(`/api/DocumentLibrary/CreateFolder/`, documentFolder);
  }

  /**
* insert document record
* @return created record
*/
  public saveDocuments(document: Documents): Observable<DocumentLibraryDto> {
    const formData = new FormData();
    formData.append('file', document?.selectedFile != null ? document?.selectedFile : '');
    delete document.selectedFile;
    const params = new HttpParams().append('content', JSON.stringify(document));
    return this.http.post<DocumentLibraryDto>(`/api/DocumentLibrary`, formData, { params: params });
  }

  /**
* get document types
* @return document types
*/
  public GetDocumentTypes(filter: DocumentTypeFilter): Observable<DocumentTypes[]> {
    const { businessUnitType, businessUnitId } = filter;
    let params = new HttpParams();
    params = params.append("BusinessUnitType", businessUnitType);
    if (businessUnitId != null) {
      params = params.append("BusinessUnitId", businessUnitId);
    }
    let url = `/api/DocumentLibrary/getTypes`;
    return this.http.get<DocumentTypes[]>(url, {params:params});
  }
  /**
* get document types
* @return document types
*/
  public SearchDocumentTags(filter: DocumentTagFilter): Observable<DocumentTags[]> {
    const { businessUnitType, businessUnitId, keyword } = filter;
    let params = new HttpParams();
    params = params.append("BusinessUnitType", businessUnitType);
    params = params.append("Keyword", keyword);
    if (businessUnitId != null) {
      params = params.append("BusinessUnitId", businessUnitId);
    }
    let url = `/api/DocumentLibrary/SearchTags`;
    return this.http.get<DocumentTypes[]>(url, {params:params});
  }
}
