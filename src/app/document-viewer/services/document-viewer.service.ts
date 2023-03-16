import { HttpClient, HttpBackend  } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FileGroup } from 'src/app/document-viewer/store/document-viewer.state.model';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';

@Injectable({
  providedIn: 'root',
})
export class DocumentViewerService {
  private http: HttpClient;
  private baseUrl: string;

  constructor(@Inject(APP_SETTINGS) appSettings: AppSettings, be: HttpBackend) {
    this.http = new HttpClient(be);
    this.baseUrl = appSettings.host;
  }

  getFile(fileHash: string, fileId: string) {
    const params = { params: { fileHash, fileId } };
  const url = this.baseUrl + '/api/document-viewer/file';
    return this.http.get(this.baseUrl + `/api/document-viewer/file?fileHash=${fileHash}&fileId=${fileId}`, {
      responseType: 'blob'
    });
  }

  getPdfFile(fileHash: string, fileId: string) {
    const params = { params: { fileHash, fileId } };
    const url = this.baseUrl + '/api/document-viewer/pdf';
    return this.http.get(this.baseUrl +`/api/document-viewer/pdf?fileHash=${fileHash}&fileId=${fileId}`, {
      responseType: 'blob'
    });
  }

  public getFileGroups(fileHash: string): Observable<FileGroup[]> {
    const params = { params: { fileHash } };
    const url = this.baseUrl + '/api/document-viewer';
    return this.http.get<FileGroup[]>(url, params);
  }
}

