import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { DocumentItem, DocumentLibrary, DocumentsInfo, DocumentsLibraryPage } from "../store/model/document-library.model";

@Injectable({ providedIn: 'root' })
export class DocumentLibraryService {

  public getDocumentsTree(): Observable<DocumentLibrary> {
    const documentItems: DocumentItem[] = [
      {
        id: 1,
        businessUnitId: 22,
        fileType: 'folder',
        name: 'My Documents',
        children: [
          {
            id: 2, businessUnitId: 22, fileType: 'folder', name: 'Contract Documents', children:
              [
                {
                  id: 9, businessUnitId: 22, fileType: 'file', name: 'Contract with ABC', children: []
                }
              ]
          },
          {
            id: 3, businessUnitId: 22, fileType: 'folder', name: 'User Manuals', children:
              [{
                id: 5, businessUnitId: 22, fileType: 'folder', name: 'IRP UM', children: [
                  {
                    id: 7, businessUnitId: 22, fileType: 'file', name: 'VMS User manual V1.0', children: []
                  }
                ]
              },
              {
                id: 6, businessUnitId: 22, fileType: 'folder', name: 'VMS UM', children:
                  [
                    {
                      id: 8, businessUnitId: 22, fileType: 'file', name: 'IRP User Manual V2.1', children: []
                    }
                  ]
              }
              ]
          },
          { id: 4, businessUnitId: 22, fileType: 'folder', name: 'Training Documents', children: [] }
        ]
      },
      {
        id: 10,
        businessUnitId: 22,
        fileType: 'folder',
        name: 'Shared with Me',
        children: [
          { id: 11, businessUnitId: 22, fileType: 'link', name: 'Invoice Issues from ABC', children: [] },
          { id: 12, businessUnitId: 22, fileType: 'link', name: 'Invoice Issues from XYZ', children: [] },
          { id: 13, businessUnitId: 22, fileType: 'link', name: 'Invoice Issues from KFG', children: [] }
        ]
      }
    ];
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
}
