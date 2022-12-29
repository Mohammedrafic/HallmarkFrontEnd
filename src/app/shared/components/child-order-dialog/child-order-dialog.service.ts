import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';

import { Observable } from "rxjs";

import { MissingCredentialsRequestBody, MissingCredentialsResponse } from "@shared/models/credential.model";

@Injectable()
export class ChildOrderDialogService {
  constructor(private http: HttpClient) { }

  public getMissingCredentials(body: MissingCredentialsRequestBody): Observable<MissingCredentialsResponse> {
    return this.http.post<MissingCredentialsResponse>(`/api/order/getMissingCredentials`, body);
  }
}
