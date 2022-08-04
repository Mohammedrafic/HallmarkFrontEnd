import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { DialogComponent } from "@syncfusion/ej2-angular-popups";
import { Observable, takeUntil } from "rxjs";

import { DestroyableDirective } from "@shared/directives/destroyable.directive";

@Component({
  selector: 'app-import-candidates',
  templateUrl: './import-candidates.component.html',
  styleUrls: ['./import-candidates.component.scss']
})
export class ImportCandidatesComponent extends DestroyableDirective implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @Input() openEvent: Observable<void>;

  public width = `${window.innerWidth * 0.6}px`;
  public targetElement: HTMLElement = document.body;


  constructor() {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnOpenEvent();
  }

  public onCancel(): void {
    this.sideDialog.hide();
  }

  private subscribeOnOpenEvent(): void {
    this.openEvent.pipe(takeUntil(this.destroy$)).subscribe(() => this.sideDialog.show());
  }
}
