import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, RichTextEditorComponent, ToolbarType } from '@syncfusion/ej2-angular-richtexteditor';

@Component({
  selector: 'app-alerts-sms-template-from',
  templateUrl: './alerts-sms-template-from.component.html',
  styleUrls: ['./alerts-sms-template-from.component.scss'],
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, TableService]
})

export class AlertsSmsTemplateFromComponent {
  @Input() addEditSmsTemplateForm: FormGroup;
  @Input() title: string;  
  @Input() alertTitle:string;
  @Input() alertBody:string;
  @Input() templateParamsData:{ [key: string]: Object }[];
  @Output() formCancelClicked = new EventEmitter();
  @Output() formSaveClicked = new EventEmitter();
  @ViewChild('SMSRTE') public rteObj: RichTextEditorComponent;
  private listboxEle: HTMLElement;
  private editArea: HTMLElement;
  public range: Range = new Range();
  
  constructor() { }
  
  rteCreated(): void {
    if (this.editArea == null) {
      this.editArea = document.querySelector("#smsDefaultRTE .e-content") as HTMLElement;
      // Drop handler    
      this.editArea.addEventListener("drop", this.dropHandler.bind(this));
    }

    if (this.listboxEle == null) {
      this.listboxEle = document.getElementById('smsListbox') as HTMLElement;
      // DragStart event binding

      this.listboxEle.addEventListener("dragstart", function (e: any) {
        e.dataTransfer.setData("Text", (e.target as HTMLElement).innerText);
      });
    }
    this.rteObj.toolbarSettings.enable = false;
    this.rteObj.toolbarSettings.enableFloating = true;
    this.rteObj.height='300px';
  }
  ngAfterViewInit() {
    this.rteObj.refreshUI();
  }
  dropHandler(e: any): void {
    e.preventDefault();
    if (this.rteObj.inputElement.contains(e.target)) {
      let range: any;
      let getDocument = this.rteObj.contentModule.getDocument?.();
      if (getDocument?.caretRangeFromPoint) {
        range = getDocument?.caretRangeFromPoint(e.clientX, e.clientY);
        this.rteObj.selectRange(range);
      } else if (e.rangeParent) {
        range = getDocument?.createRange();
        range.setStart(e.rangeParent, e.rangeOffset);
        this.rteObj.selectRange(range);
      }
      if (this.rteObj.formatter.getUndoRedoStack?.().length === 0) {
        this.rteObj.formatter.saveData?.();
      }
      let text = e.dataTransfer.getData('Text').replace(/\n/g, '').replace(/\r/g, '').replace(/\r\n/g, '');
      this.rteObj.executeCommand("insertHTML", text);
      this.rteObj.formatter.saveData?.();
      this.rteObj.formatter.enableUndo?.(this.rteObj);
    }
  }

  static createForm(): FormGroup {
    return new FormGroup({
      alertBody: new FormControl('', [Validators.required]),
    });
  }

  onFormCancelClick(): void {
    this.formCancelClicked.emit();
  }

  onFormSaveClick(): void {
    this.editArea.removeEventListener('drop', this.dropHandler.bind(this));
    this.formSaveClicked.emit();
  }
}

