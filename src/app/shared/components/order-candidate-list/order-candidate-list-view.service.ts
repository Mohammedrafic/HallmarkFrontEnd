import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class OrderCandidateListViewService {
  private isCandidateOpened: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  getIsCandidateOpened(): Observable<boolean> {
    return this.isCandidateOpened.asObservable();
  }

  setIsCandidateOpened(value: boolean): void {
    this.isCandidateOpened.next(value);
  }
}
