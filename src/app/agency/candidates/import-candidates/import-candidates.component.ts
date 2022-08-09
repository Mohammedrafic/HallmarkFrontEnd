import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

import { Actions, ofActionSuccessful, Store } from "@ngxs/store";
import { downloadBlobFile } from "@shared/utils/file.utils";
import { SelectedEventArgs, UploaderComponent } from "@syncfusion/ej2-angular-inputs";
import { DialogComponent } from "@syncfusion/ej2-angular-popups";
import { FileInfo } from "@syncfusion/ej2-inputs/src/uploader/uploader";
import { Observable, takeUntil } from "rxjs";

import { DestroyableDirective } from "@shared/directives/destroyable.directive";
import { GetCandidateProfileTemplate, GetCandidateProfileTemplateSucceeded } from "@agency/store/candidate.actions";

@Component({
  selector: 'app-import-candidates',
  templateUrl: './import-candidates.component.html',
  styleUrls: ['./import-candidates.component.scss']
})
export class ImportCandidatesComponent extends DestroyableDirective implements OnInit {
  @ViewChild('sideDialog') private sideDialog: DialogComponent;
  @ViewChild('previewupload') private uploadObj: UploaderComponent;
  @ViewChild('fileUploader') private fileUploader: ElementRef;
  @Input() public openEvent: Observable<void>;

  public width = `${window.innerWidth * 0.6}px`;
  public targetElement: HTMLElement = document.body;
  public dropElement: HTMLElement;
  public readonly allowedExtensions: string = '.xlsx';
  public readonly maxFileSize = 10485760; // 10 mb
  public selectedFile: FileInfo | null;

  constructor(private store: Store,
              private actions$: Actions) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnOpenEvent();
    this.subscribeOnTemplateLoaded();
    this.dropElement = document.getElementById('droparea') as HTMLElement;
  }

  public browse() : void {
    this.fileUploader?.nativeElement
      ?.getElementsByClassName('e-file-select-wrap')[0]
      ?.querySelector('button')?.click();
  }

  public clear(): void {
    this.uploadObj.clearAll();
    this.selectedFile = null;
  }

  public selectFile(event: SelectedEventArgs): void {
    this.selectedFile = event.filesData[0];
  }

  public onCancel(): void {
    this.sideDialog.hide();
  }

  public downloadTemplate() {
    this.store.dispatch(new GetCandidateProfileTemplate());
  }

  private subscribeOnOpenEvent(): void {
    this.openEvent.pipe(takeUntil(this.destroy$)).subscribe(() => this.sideDialog.show());
  }

  private subscribeOnTemplateLoaded(): void {
    this.actions$.pipe(takeUntil(this.destroy$), ofActionSuccessful(GetCandidateProfileTemplateSucceeded))
      .subscribe((file: { payload: Blob }) => {
        downloadBlobFile(file.payload, 'candidate_profile_template.xlsx');
      });
  }
}
