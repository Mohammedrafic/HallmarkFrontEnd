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
import { Select, Store } from '@ngxs/store';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { Observable } from 'rxjs';
import { OrderManagementPage } from '@shared/models/order-management.model';
import { Dialog, DialogUtility } from '@syncfusion/ej2-angular-popups';
import { ClearOrders, GetOrders } from '@client/store/order-managment-content.actions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { gridConfig } from './tamplate-table-config';

@Component({
  selector: 'app-save-template-dialog',
  templateUrl: './save-template-dialog.component.html',
  styleUrls: ['./save-template-dialog.component.scss'],
})
export class SaveTemplateDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() templateTitle: string;
  @Output() closeEmitter: EventEmitter<void> = new EventEmitter<void>();
  @Output() createEmitter: EventEmitter<{ templateTitle: string }> = new EventEmitter<{ templateTitle: string }>();

  @ViewChild('saveTemplate', { static: false }) saveTemplateElement: ElementRef<HTMLElement>;

  @Select(OrderManagementContentState.ordersPage) templates$: Observable<OrderManagementPage>;

  public templateForm: FormGroup;
  public dialog: Dialog;
  public gridConfig = gridConfig;

  public constructor(private store: Store, private formBuilder: FormBuilder) {}

  public ngOnInit(): void {
    this.initForm();
    this.getTemplates();
  }

  public ngAfterViewInit(): void {
    this.initDialog();
  }

  public ngOnDestroy(): void {
    this.dialog.destroy();
    this.store.dispatch(new ClearOrders());
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
      templateTitle: [this.templateTitle ?? '', Validators.required],
    });
  }

  private getTemplates(): void {
    this.store.dispatch(new GetOrders({ isTemplate: true }));
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
      close: () => {
        this.onCancel();
      },
    });
  }
}
