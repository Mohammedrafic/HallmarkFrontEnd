import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  DocumentFolder, FolderTreeItem, DocumentLibraryDto, Documents, DocumentsFilter,
  DocumentsLibraryPage, DocumentTagFilter, DocumentTags, DocumentTypeFilter, DocumentTypes,
  FolderTreeFilter, DownloadDocumentDetail, DownloadDocumentDetailFilter, DeleteDocumentsFilter, ShareDocumentsFilter, SharedDocumentPostDto,
  ShareDocumentInfoPage, ShareDocumentInfoFilter, UnShareDocumentsFilter, AssociateAgencyDto, ShareOrganizationsData, DeleteDocumentFolderFilter,
  PreviewDocumentDetailFilter,
  SharedDocumentInformation
} from "../store/model/document-library.model";

import { Region } from '@shared/models/region.model';
import { Location } from '@shared/models/location.model';
import { BusinessUnit } from "@shared/models/business-unit.model";

@Injectable({ providedIn: 'root' })
export class DocumentLibraryService {
  constructor(private http: HttpClient) { }

  public getFoldersTree(folderTreeFilter: FolderTreeFilter): Observable<FolderTreeItem[]> {
    const { businessUnitType, businessUnitId } = folderTreeFilter;
    let params = new HttpParams();
    params = params.append("BusinessUnitType", businessUnitType);
    if (businessUnitId != null) {
      params = params.append("BusinessUnitId", businessUnitId);
    }
    let url = `/api/DocumentLibrary/GetFolderTree`;
    return this.http.get<FolderTreeItem[]>(url, { params: params });
  }

  public GetDocumentLibraryInfo(documentsFilter: DocumentsFilter): Observable<DocumentsLibraryPage> {
    let params = new HttpParams();
    params = params.append("BusinessUnitType", documentsFilter.businessUnitType);
    if (documentsFilter?.businessUnitId && documentsFilter?.businessUnitId != null)
      params = params.append("BusinessUnitId", documentsFilter.businessUnitId);
    if (documentsFilter?.regionId && documentsFilter?.regionId != null)
      params = params.append("RegionId", documentsFilter.regionId);
    if (documentsFilter?.locationId && documentsFilter?.locationId != null)
      params = params.append("LocationId", documentsFilter.locationId);
    if (documentsFilter?.folderId && documentsFilter?.folderId != null)
      params = params.append("FolderId", documentsFilter.folderId);
    if (documentsFilter?.documentId && documentsFilter?.documentId != null)
      params = params.append("DocumentId", documentsFilter.documentId);

    params = params.append("IncludeSharedWithMe", documentsFilter.includeSharedWithMe);
    params = params.append("ShowAllPages", documentsFilter.showAllPages);
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
    let isEdit = document.isEdit;
    delete document.selectedFile;
    if (isEdit)
      delete document.isEdit;
    const params = new HttpParams().append('content', JSON.stringify(document));
    if (isEdit) {
      return this.http.put<DocumentLibraryDto>(`/api/DocumentLibrary/Update/${document.id}`, formData, { params: params });
    }

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

  public GetDocumentDownloadDetails(documentDownloadFIlter: DownloadDocumentDetailFilter): Observable<DownloadDocumentDetail> {
    let params = new HttpParams();
    params = params.append("DocumentId", documentDownloadFIlter.documentId);
    if (documentDownloadFIlter?.businessUnitType && documentDownloadFIlter?.businessUnitType != null)
      params = params.append("BusinessUnitType", documentDownloadFIlter.businessUnitType);
    if (documentDownloadFIlter?.businessUnitId && documentDownloadFIlter?.businessUnitId != null)
      params = params.append("BusinessUnitId", documentDownloadFIlter.businessUnitId);
    return this.http.get<DownloadDocumentDetail>(`/api/DocumentLibrary/GetDocumentForDownload`, { params: params });
  }

  public GetDocumentPreviewDetails(documentPreviewFIlter: PreviewDocumentDetailFilter): Observable<DownloadDocumentDetail> {
    let params = new HttpParams();
    params = params.append("DocumentId", documentPreviewFIlter.documentId);
    if (documentPreviewFIlter?.businessUnitType && documentPreviewFIlter?.businessUnitType != null)
      params = params.append("BusinessUnitType", documentPreviewFIlter.businessUnitType);
    if (documentPreviewFIlter?.businessUnitId && documentPreviewFIlter?.businessUnitId != null)
      params = params.append("BusinessUnitId", documentPreviewFIlter.businessUnitId);
    return this.http.get<DownloadDocumentDetail>(`/api/DocumentLibrary/GetDocumentForDownload`, { params: params });
  }

  /**
   * Remove documents by id's
   * @param id
   */
  public DeleteDocumets(deleteDocumentsFilter: DeleteDocumentsFilter): Observable<any> {
    return this.http.delete<DocumentLibraryDto>(`/api/DocumentLibrary/DeleteDocuments`, { body: deleteDocumentsFilter } );
  }

  /**
   * Remove documents by id's
   * @param id
   */
  public ShareDocumets(shareDocumentsFilter: ShareDocumentsFilter): Observable<SharedDocumentPostDto[]> {
    return this.http.post<SharedDocumentPostDto[]>(`/api/DocumentLibrary/ShareDocuments`, shareDocumentsFilter);
  }

  public GetDocumentById(Id: number): Observable<DocumentLibraryDto> {
    return this.http.get<DocumentLibraryDto>(`/api/DocumentLibrary/GetById/${Id}`);
  }

  public GetDocumentsByCognitiveSearch(keyword: string, businessUnitType: any, businessUnitId?: any): Observable<DocumentsLibraryPage> {
    let params = new HttpParams();
    params = params.append("Keyword", keyword);
    params = params.append("BusinessUnitType", businessUnitType);
    params = params.append("BusinessUnitId", businessUnitId);
    params = params.append("IncludeContent", true);
    return this.http.get<DocumentsLibraryPage>(`/api/DocumentLibrary/CognitiveSearchDocuments`, {params: params});
  }

  public GetSharedDocuments(documentsFilter: ShareDocumentInfoFilter): Observable<ShareDocumentInfoPage> {
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
    if (documentsFilter?.documentId && documentsFilter?.documentId != null)
      params = params.append("DocumentId", documentsFilter.documentId);
    return this.http.get<ShareDocumentInfoPage>(`/api/DocumentLibrary/GetSharedDocuments`, { params: params });
  }

  /**
 * UnShare documents by id's
 * @param id
 */
  public UnShareDocumets(unShareDocumentsFilter: UnShareDocumentsFilter): Observable<any> {
    return this.http.delete<DocumentLibraryDto>(`/api/DocumentLibrary/UnshareDocuments`, { body: unShareDocumentsFilter });
  }

  /**
   * Get the list of available Regions by organizations
   * @return Array of Regions
   */
  public getRegionsByOrganizationId(filter: any): Observable<Region[]> {
    return this.http.post<Region[]>(`/api/DocumentLibrary/region/filter`, filter);
  }

  /**
   * Get the list of available Locations by Regions
   * @return Array of Locations
   */
  public getLocationsByOrganizationId(filter: any): Observable<Location[]> {
    return this.http.post<Location[]>(`/api/DocumentLibrary/location/filter`, filter);
  }

  /**
   * Get the list of Associate Agencies
   * @return Array of Associate Agencies
   */
  public getShareAssociateAgencies(): Observable<AssociateAgencyDto[]> {
    return this.http.get<AssociateAgencyDto[]>(`/api/DocumentLibrary/share/getAgencies`);
  }

  /**
 * Get the list of share organizations
 * @return Array of share organizations
 */
  public getShareOrganizationsData(): Observable<ShareOrganizationsData[]> {
    return this.http.get<ShareOrganizationsData[]>(`/api/DocumentLibrary/share/getOrganizations`);
  }

 /**
 * Get the list of shared document information
 * @return Array of share document information
 */
 public getSharedDocumentInformation(filter:SharedDocumentInformation): Observable<BusinessUnit[]> {
  let params = new HttpParams();
    params = params.append("DocumentId", filter.documentId);
    params = params.append("BusinessUnitType", filter.businessUnitType);

  return this.http.get<BusinessUnit[]>(`/api/DocumentLibrary/GetSharedDocumentInformation`,{params:params});
}

  /**
  * Remove document folder
  * @param id
  */
  public DeleteFolder(deleteDocumentFolderFilter: DeleteDocumentFolderFilter): Observable<any> {
    return this.http.delete<any>(`/api/DocumentLibrary/DeleteFolder`, { body: deleteDocumentFolderFilter });
  }

}
