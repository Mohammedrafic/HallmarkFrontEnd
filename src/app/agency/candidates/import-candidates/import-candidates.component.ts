import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { ListBox, ListBoxChangeEventArgs, SelectionSettingsModel } from "@syncfusion/ej2-angular-dropdowns";
import { SelectedEventArgs, UploaderComponent } from "@syncfusion/ej2-angular-inputs";
import { SelectEventArgs, TabComponent } from "@syncfusion/ej2-angular-navigations";
import { DialogComponent } from "@syncfusion/ej2-angular-popups";
import { getInstance } from "@syncfusion/ej2-base";
import { FileInfo } from "@syncfusion/ej2-inputs/src/uploader/uploader";
import { filter, Observable, takeUntil } from "rxjs";

import { FileStatusCode } from "@shared/enums/file.enum";
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, IMPORT_CONFIRM_TEXT, IMPORT_CONFIRM_TITLE } from "@shared/constants";
import { CandidateImportRecord, CandidateImportResult } from "@shared/models/candidate-profile-import.model";
import { MessageTypes } from "@shared/enums/message-types";
import { ConfirmService } from "@shared/services/confirm.service";
import { downloadBlobFile } from "@shared/utils/file.utils";
import { DestroyableDirective } from "@shared/directives/destroyable.directive";
import { FileSize } from "@core/enums";
import {
  GetCandidateProfileErrors,
  GetCandidateProfileErrorsSucceeded,
  GetCandidateProfileTemplate,
  GetCandidateProfileTemplateSucceeded,
  SaveCandidateImportResult,
  SaveCandidateImportResultSucceeded,
  UploadCandidateProfileFile,
  UploadCandidateProfileFileSucceeded,
} from "@agency/store/candidate.actions";
import { ShowToast } from "src/app/store/app.actions";
import { AppState } from 'src/app/store/app.state';

interface ListBoxItem {
  name: string;
  id: string;
}

@Component({
  selector: 'app-import-candidates',
  templateUrl: './import-candidates.component.html',
  styleUrls: ['./import-candidates.component.scss'],
})
export class ImportCandidatesComponent extends DestroyableDirective implements OnInit {
  @ViewChild('sideDialog') private sideDialog: DialogComponent;
  @ViewChild('previewupload') private uploadObj: UploaderComponent;
  @ViewChild('fileUploader') private fileUploader: ElementRef;
  @ViewChild('tab') tab: TabComponent;

  @Input() public openEvent: Observable<void>;

  @Output() public reloadCandidateList: EventEmitter<void> = new EventEmitter<void>();

  @Select(AppState.isMobileScreen)
  public isMobile$: Observable<boolean>;

  public width = `${window.innerWidth * 0.6}px`;
  public targetElement: HTMLElement = document.body;
  public dropElement: HTMLElement;
  public readonly allowedExtensions: string = '.xlsx';
  public readonly maxFileSize = FileSize.MB_10;
  public selectedFile: FileInfo | null;
  public firstActive = true;
  public selectionSettings: SelectionSettingsModel = { mode: 'Single' };
  public errorListBoxData: ListBoxItem[] = [];
  public successfulListBoxData: ListBoxItem[] = [];
  public fields = {
    text: 'name',
    value: 'id',
  };
  public selectedCandidate: CandidateImportRecord;
  public candidateImportResult: CandidateImportResult | null;

  get activeErrorTab(): boolean {
    return this.tab?.selectedItem === 1; // errors tab index
  }

  get enabledImportButton(): boolean {
    return (this.selectedFile?.statusCode === FileStatusCode.Valid || !!this.candidateImportResult) && !this.activeErrorTab;
  }

  constructor(private store: Store,
              private actions$: Actions,
              private confirmService: ConfirmService) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnOpenEvent();
    this.subscribeOnFileActions();
  }

  public browse() : void {
    this.fileUploader?.nativeElement
      ?.getElementsByClassName('e-file-select-wrap')[0]
      ?.querySelector('button')?.click();
  }

  public clear(): void {
    this.uploadObj.clearAll();
    this.selectedFile = null;
    this.candidateImportResult = null;
  }

  public selectFile(event: SelectedEventArgs): void {
    if (event.filesData.length) {
      this.candidateImportResult = null;
      this.selectedFile = event.filesData[0];
    }
  }

  public onCancel(): void {
    if (this.candidateImportResult) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => confirm),
          takeUntil(this.destroy$)
        ).subscribe(() => {
          this.closeDialog();
        });
    } else {
      this.closeDialog();
    }
  }

  public downloadTemplate(): void {
    this.store.dispatch(new GetCandidateProfileTemplate());
  }

  public downloadErrors(): void {
    this.store.dispatch(new GetCandidateProfileErrors(this.candidateImportResult?.errorRecords || []));
  }

  public onTabSelecting(event: SelectEventArgs): void {
    if (event.isSwiped) {
      event.cancel = true;
    }
  }

  public onTabCreated(): void {
    this.tab.selected.pipe(takeUntil(this.destroy$)).subscribe((event: SelectEventArgs) => {
      this.firstActive = event.selectedIndex === 0;
      this.selectFirstListBoxItem();
    });
  }

  public selectCandidate(event: ListBoxChangeEventArgs): void {
    this.setCandidate((event.items[0] as ListBoxItem).id);
  }

  public onListBoxCreated(): void {
    this.selectFirstListBoxItem();
  }

  public onImport(): void {
    if (this.candidateImportResult) {
      this.saveImportedCandidates();
    } else {
      this.uploadFile();
    }
  }

  private setDropElement(): void {
    this.dropElement = document.getElementById('droparea') as HTMLElement;
  }

  private subscribeOnOpenEvent(): void {
    this.openEvent.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.sideDialog.show();
      this.setDropElement();
    });
  }

  private subscribeOnFileActions(): void {
    this.actions$.pipe(takeUntil(this.destroy$), ofActionSuccessful(UploadCandidateProfileFileSucceeded))
      .subscribe((result: { payload: CandidateImportResult }) => {
        if (result.payload.succesfullRecords.length || result.payload.errorRecords.length) {
          this.setCandidateImportResult(result.payload);
        } else {
          this.store.dispatch(new ShowToast(MessageTypes.Error, 'There are no records in the file'));
        }
      });

    this.actions$.pipe(takeUntil(this.destroy$), ofActionSuccessful(GetCandidateProfileTemplateSucceeded))
      .subscribe((file: { payload: Blob }) => {
        downloadBlobFile(file.payload, 'candidate_profile.xlsx');
      });

    this.actions$.pipe(takeUntil(this.destroy$), ofActionSuccessful(GetCandidateProfileErrorsSucceeded))
      .subscribe((file: { payload: Blob }) => {
        downloadBlobFile(file.payload, 'candidate_profile_errors.xlsx');
      });

    this.actions$.pipe(takeUntil(this.destroy$), ofActionSuccessful(SaveCandidateImportResultSucceeded))
      .subscribe(() => {
        this.store.dispatch(new ShowToast(MessageTypes.Success, 'Candidates were imported'));
        this.reloadCandidateList.next();
        if (this.candidateImportResult?.errorRecords.length) {
          this.tab.select(1); // errors tab
        } else {
          this.closeDialog();
        }
      });
  }

  private closeDialog(): void {
    this.sideDialog.hide();
    this.candidateImportResult = null;
    this.selectedFile = null;
    this.uploadObj.clearAll();
  }

  private getListBoxData(records: CandidateImportRecord[]): ListBoxItem[] {
    return records.map((item: CandidateImportRecord) => {
      const firstName = item.candidateProfile?.firstName || '';
      const lastName = item.candidateProfile?.lastName || '';

      return {
        name: firstName || lastName ? `${firstName} ${lastName}` : item.key,
        id: item.key,
      };
    });
  }

  private getCandidateImportRecord(records: CandidateImportRecord[] = [], key: string): CandidateImportRecord | undefined {
    return records.find((item: CandidateImportRecord) => item.key === key);
  }

  private setCandidate(key: string): void {
    this.selectedCandidate = this.getCandidateImportRecord(
      this.activeErrorTab || !this.candidateImportResult?.succesfullRecords.length
        ? this.candidateImportResult?.errorRecords
        : this.candidateImportResult?.succesfullRecords,
      key
    ) as CandidateImportRecord;
  }

  private selectFirstListBoxItem(): void {
    let id: string;
    let list: ListBoxItem[];

    if (this.activeErrorTab) {
      id = 'errorsCandidates';
      list = this.errorListBoxData;
    } else {
      id = 'successfulCandidates';
      list = this.successfulListBoxData;
    }

    const listBoxObj: ListBox = getInstance(document.getElementById(id) as HTMLElement, ListBox) as ListBox;
    listBoxObj?.selectItems([list[0]?.name]);
    this.setCandidate(list[0]?.id);
  }

  private uploadFile(): void {
    if (this.selectedFile?.statusCode === FileStatusCode.Valid) {
      this.candidateImportResult = null;
      this.store.dispatch(new UploadCandidateProfileFile(this.selectedFile.rawFile as Blob));
    }
  }

  private saveImportedCandidates(): void {
    if (this.candidateImportResult?.errorRecords.length) {
      this.confirmService
        .confirm(IMPORT_CONFIRM_TEXT, {
          title: IMPORT_CONFIRM_TITLE,
          okButtonLabel: 'Import',
          okButtonClass: '',
        })
        .pipe(
          filter((confirm) => confirm),
          takeUntil(this.destroy$)
        ).subscribe(() => {
          this.store.dispatch(new SaveCandidateImportResult(this.candidateImportResult?.succesfullRecords || []));
        });
    } else {
      this.store.dispatch(new SaveCandidateImportResult(this.candidateImportResult?.succesfullRecords || []));
    }
  }

  private setCandidateImportResult(result: CandidateImportResult): void {
    this.candidateImportResult = result;
    this.successfulListBoxData = this.getListBoxData(this.candidateImportResult.succesfullRecords);
    this.errorListBoxData = this.getListBoxData(this.candidateImportResult.errorRecords);

    if (this.candidateImportResult.succesfullRecords.length) {
      this.firstActive = true;
      this.setCandidate(this.candidateImportResult.succesfullRecords[0]?.key);
    } else {
      this.firstActive = false;
      this.setCandidate(this.candidateImportResult.errorRecords[0]?.key);
    }
  }
}
