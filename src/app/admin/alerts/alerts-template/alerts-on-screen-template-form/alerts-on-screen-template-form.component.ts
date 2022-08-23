import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, RichTextEditorComponent, ToolbarType } from '@syncfusion/ej2-angular-richtexteditor';
import { toolsRichTextEditor } from '../../alerts.constants';
@Component({
  selector: 'app-alerts-on-screen-template-form',
  templateUrl: './alerts-on-screen-template-form.component.html',
  styleUrls: ['./alerts-on-screen-template-form.component.scss'],  
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, TableService]
})

export class AlertsOnScreenTemplateFormComponent {
  public tools = toolsRichTextEditor;
  @Input() addEditOnScreenTemplateForm: FormGroup;
  @Input() title: string;  
  @Input() alertTitle:string;
  @Input() alertBody:string;
  @Input() templateParamsData:{ [key: string]: Object }[];
  @Output() formCancelClicked = new EventEmitter();
  @Output() formSaveClicked = new EventEmitter();
  @ViewChild('OnScreenRTE') public rteObj: RichTextEditorComponent;
  private listboxEle: HTMLElement;
  private editArea: HTMLElement;
  public range: Range = new Range();
  private dragEleContent: string;
  
  constructor() { }
  
  rteCreated(): void {
    if (this.editArea == null) {
      this.editArea = document.querySelector("#onScreenDefaultRTE .e-content") as HTMLElement;
      // Drop handler    
      this.editArea.addEventListener("drop", this.dropHandler.bind(this));
    }

    if (this.listboxEle == null) {
      this.listboxEle = document.getElementById('onScreenListbox') as HTMLElement;
      // DragStart event binding

      this.listboxEle.addEventListener("dragstart", function (e: any) {
        e.dataTransfer.setData("Text", (e.target as HTMLElement).innerText);
      });
    }
    this.rteObj.toolbarSettings.type = ToolbarType.Scrollable;
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
      var text = e.dataTransfer.getData('Text').replace(/\n/g, '').replace(/\r/g, '').replace(/\r\n/g, '');
      this.rteObj.executeCommand("insertHTML", text);
      this.rteObj.formatter.saveData?.();
      this.rteObj.formatter.enableUndo?.(this.rteObj);
    }
  }

  static createForm(): FormGroup {
    return new FormGroup({
      alertTitle: new FormControl('', [Validators.required]),
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

