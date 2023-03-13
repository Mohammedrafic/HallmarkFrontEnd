import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileGroup } from 'src/app/document-viewer/store/document-viewer.state.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentViewerService {

  constructor(private http: HttpClient) {}

  getFile(fileHash: string, fileId: number) {
    const params = { params: { fileHash, fileId } };
  const url = '/api/document-viewer/file';
  return this.http.get<Blob>(url, params);
  }

  getPdfFile(fileHash: string, fileId: number) {
    const params = { params: { fileHash, fileId } };
  const url = '/api/document-viewer/pdf';
  return this.http.get<Blob>(url, params);
  }

  public getFileGroups(fileHash: string): Observable<FileGroup[]> {
    const params = { params: { fileHash } };
    const url = '/api/document-viewer';
    return this.http.get<FileGroup[]>(url, params);
  }
}

