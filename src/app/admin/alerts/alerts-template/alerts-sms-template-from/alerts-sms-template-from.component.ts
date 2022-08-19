import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToolbarService, LinkService, ImageService, HtmlEditorService, TableService, RichTextEditorComponent, ToolbarType } from '@syncfusion/ej2-angular-richtexteditor';
import { toolsRichTextEditor } from '../../alerts.constants';
import { DragEventArgs, ListBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { ListViewComponent } from '@syncfusion/ej2-angular-lists';
import { ScrollbarSettings } from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'app-alerts-sms-template-from',
  templateUrl: './alerts-sms-template-from.component.html',
  styleUrls: ['./alerts-sms-template-from.component.scss'],
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, TableService]
})

export class AlertsSmsTemplateFromComponent implements OnInit, OnDestroy, OnChanges {
  public tools = toolsRichTextEditor;
  @Input() addEditSmsTemplateForm: FormGroup;
  @Input() title: string;

  @Output() formCancelClicked = new EventEmitter();
  @Output() formSaveClicked = new EventEmitter();
  @ViewChild('SMSRTE') public rteObj: RichTextEditorComponent;
  private listboxEle: HTMLElement;
  private editArea: HTMLElement;
  public range: Range = new Range();
  private dragEleContent: string;
  public data: { [key: string]: Object }[] = [
    {
      text: 'Hennessey Venom',
      id: 'list-01',
      "htmlAttributes": { draggable: true }
    },
    {
      text: 'Bugatti Chiron',
      id: 'list-02',
      "htmlAttributes": { draggable: true }
    },
    {
      text: 'Bugatti Veyron Super Sport',
      id: 'list-03',
      "htmlAttributes": { draggable: true }
    }
  ];
  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
  }
  ngOnDestroy(): void {
  }

  ngOnInit(): void {
  }
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
    this.editArea.innerHTML="";
    this.rteObj.toolbarSettings.type = ToolbarType.MultiRow;
    this.rteObj.toolbarSettings.enableFloating = true;
    this.rteObj.height='400px';
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
      id: new FormControl(),
      mailBody: new FormControl('', [Validators.required]),
    });
  }
  removedropEvent(): void {

    this.editArea.removeEventListener('drop', this.dropHandler.bind(this));
  }
  onFormCancelClick(): void {
    this.formCancelClicked.emit();
  }

  onFormSaveClick(): void {
    this.editArea.removeEventListener('drop', this.dropHandler.bind(this));
    this.formSaveClicked.emit();
  }
}

