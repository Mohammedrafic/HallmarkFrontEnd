import { Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CloseOrderService {
  public constructor(private http: HttpClient, private store: Store) {}

  public close(): void {
    console.error("Not implemented");
  }

}
