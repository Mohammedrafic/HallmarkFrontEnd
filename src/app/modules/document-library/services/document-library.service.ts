import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { HttpClient } from '@angular/common/http';
import { DocumentFolder, DocumentItem, DocumentLibrary, DocumentLibraryDto, Documents, DocumentsInfo, DocumentsLibraryPage, DocumentTypeFilter, DocumentTypes } from "../store/model/document-library.model";

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

  public getDocuments(): Observable<DocumentsLibraryPage> {
    const documentItems: DocumentsInfo[] = [
      {
        docId:1,
        name:'Test.pdf',
        organization: 'Trinity',
        status: 'Active',
        region: 'TestRegion',
        location: 'TestLocation',
        role: 'TestRole',
        type: 'Credentials',
        tags: 'Testtag',
        startDate: new Date(),
        endDate: new Date(),
        sharedWith: 'HallMark',
        comments: 'Test',
        documents:[]
}
    ];
    let data: DocumentsLibraryPage = {
      items: documentItems,
      pageNumber: 1,
      totalPages: 1,
      totalCount: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    };
    return of(data);
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
  public saveDocuments(documents: Documents): Observable<DocumentLibraryDto> {
    return this.http.post<DocumentLibraryDto>(`/api/DocumentLibrary?content=${documents}`, {});
  }

  /**
* get document types
* @return document types
*/
  public GetDocumentTypes(filter: DocumentTypeFilter): Observable<DocumentTypes[]> {
    const { businessUnitType, businessUnitId } = filter;
    let url = `/api/DocumentLibrary/getTypes?BusinessUnitType=${businessUnitType}`;
    if (businessUnitId != null) {
      url = url + `&BusinessUnitId=${businessUnitId}`;
    }
    return this.http.get<DocumentTypes[]>(url);
   
  }
}
