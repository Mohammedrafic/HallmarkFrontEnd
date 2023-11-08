import { Observable } from 'rxjs';

export interface FileViewerData {
  fileName: string;
  getOriginal: (() => Observable<Blob>) | null;
  getPDF: (() => Observable<Blob>) | null;
  triggeredFromTable?: boolean;
}
