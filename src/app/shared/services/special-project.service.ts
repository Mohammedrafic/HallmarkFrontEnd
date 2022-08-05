import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpecialProject, SpecialProjectPage } from 'src/app/shared/models/special-project.model';

@Injectable({ providedIn: 'root' })
export class SpecialProjectService {

  constructor(private http: HttpClient) { }
  /**
  * Get the SpecialProjects
  */
  public getSpecialProjects(): Observable<SpecialProjectPage> {
    return this.http.get<SpecialProjectPage>(`/api/Orders/all`);
  }
}
