import { Observable } from 'rxjs';
import { Dialog, DialogUtility } from '@syncfusion/ej2-angular-popups';
import { VirtualScrollService } from '@syncfusion/ej2-angular-grids';

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { gridConfig } from './tamplate-table-config';
import { Order, OrderManagement } from '@shared/models/order-management.model';
import { SaveTemplateDialogService } from '@client/order-management/components/save-template-dialog/save-template-dialog.service';

@Component({
  selector: 'app-save-template-dialog',
  templateUrl: './save-template-dialog.component.html',
  styleUrls: ['./save-template-dialog.component.scss'],
  providers: [VirtualScrollService],
})
export class SaveTemplateDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() order: Order;
  @Input() public isIRPtab ?: boolean | null;
  @Output() closeEmitter: EventEmitter<void> = new EventEmitter<void>();
  @Output() createEmitter: EventEmitter<{ templateTitle: string }> = new EventEmitter<{ templateTitle: string }>();
  @ViewChild('saveTemplate', { static: false }) saveTemplateElement: ElementRef<HTMLElement>;

  public readonly gridConfig = gridConfig;

  public templateForm: FormGroup;
  public dialog: Dialog;
  public templates$: Observable<OrderManagement[]>;

  public constructor(private formBuilder: FormBuilder, private saveTemplateDialogService: SaveTemplateDialogService) {}

  public ngOnInit(): void {
    this.initForm();
    this.getTemplates();
  }

  public ngAfterViewInit(): void {
    this.initDialog();
  }

  public ngOnDestroy(): void {
    this.dialog.destroy();
  }

  private onCancel(): void {
    this.closeEmitter.emit();
  }

  private onCreate(): void {
    if (this.templateForm.valid) {
      this.createEmitter.emit(this.templateForm.value);
    }
  }

  private initForm(): void {
    this.templateForm = this.formBuilder.group({
      templateTitle: [this.order.title ?? '', Validators.required],
    });
  }

  private getTemplates(): void {
    this.templates$ = this.saveTemplateDialogService.getFilteredTemplates(this.order,this.isIRPtab);
  }

  private initDialog(): void {
    this.dialog = DialogUtility.confirm({
      title: 'Save Template',
      content: this.saveTemplateElement.nativeElement,
      showCloseIcon: true,
      closeOnEscape: true,
      okButton: { text: 'Create', cssClass: 'confirm-button', click: this.onCreate.bind(this) },
      cancelButton: { text: 'Cancel', cssClass: 'e-outline', click: this.onCancel.bind(this) },
      position: { X: 'center', Y: 'center' },
      animationSettings: { effect: 'Zoom' },
      cssClass: 'unsaved-changes-dialog save-template-dialog',
      close: this.onCancel.bind(this),
    });
  }
}
