import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from "rxjs";

@Component({
  selector: 'app-onboarded-candidate',
  templateUrl: './onboarded-candidate.component.html',
  styleUrls: ['./onboarded-candidate.component.scss']
})
export class OnboardedCandidateComponent implements OnInit, OnDestroy {
  @Output() closeModalEvent = new EventEmitter<never>();

  private unsubscribe$: Subject<void> = new Subject();

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  public onClose() {
    this.closeModalEvent.emit();
  }

}
