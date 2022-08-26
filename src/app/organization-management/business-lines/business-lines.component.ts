import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import {
  DeleteBusinessLine,
  GetBusinessLines,
  SaveBusinessLine,
} from '@organization-management/store/business-lines.action';
import { BusinessLinesState } from '@organization-management/store/business-lines.state';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import {
  CANCEL_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
  RECORD_ADDED,
  RECORD_DELETE,
  RECORD_MODIFIED,
} from '@shared/constants';
import { MessageTypes } from '@shared/enums/message-types';
import { BusinessLines } from '@shared/models/business-line.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { filter, Observable } from 'rxjs';
import { ShowSideDialog, ShowToast } from 'src/app/store/app.actions';

@Component({
  selector: 'app-business-lines',
  templateUrl: './business-lines.component.html',
  styleUrls: ['./business-lines.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessLinesComponent extends AbstractGridConfigurationComponent implements OnInit {
  @Select(BusinessLinesState.businessLines) public readonly businessLines$: Observable<BusinessLines[]>;

  public businessLineFormGroup: FormGroup;
  private isEdit = false;
  private editedBusinessLineId: number | null;

  constructor(private readonly store: Store, private readonly confirmService: ConfirmService) {
    super();
    this.businessLineFormGroup = new FormGroup({
      line: new FormControl('', Validators.required),
    });
  }

  public ngOnInit(): void {
    this.store.dispatch(new GetBusinessLines());
  }

  public onEdit(businessLine: BusinessLines, event: MouseEvent): void {
    this.addActiveCssClass(event);
    this.businessLineFormGroup.setValue({
      line: businessLine?.line,
    });
    this.editedBusinessLineId = businessLine.id || null;
    this.isEdit = true;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onRemove(id: number, event: MouseEvent): void {
    this.addActiveCssClass(event);

    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .subscribe((confirm) => {
        if (confirm && id) {
          this.store.dispatch(new DeleteBusinessLine(id));
          this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
          this.businessLineFormGroup.reset();
        }
        this.removeActiveCssClass();
      });
  }

  public addBusinessLine(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onFormCancelClick(): void {
    if (this.businessLineFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.store.dispatch(new ShowSideDialog(false));
          this.isEdit = false;
          this.editedBusinessLineId = null;
          this.businessLineFormGroup.reset();
          this.removeActiveCssClass();
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.isEdit = false;
      this.editedBusinessLineId = null;
      this.businessLineFormGroup.reset();
      this.removeActiveCssClass();
    }
  }

  public onFormSaveClick(): void {
    const Region: BusinessLines = {
      id: this.editedBusinessLineId || 0,
      line: this.businessLineFormGroup.controls['line'].value,
    };
    if (this.businessLineFormGroup.valid) {
      this.saveOrUpdateRegion(Region);
      this.store.dispatch(new ShowSideDialog(false));
      this.businessLineFormGroup.reset();
      this.removeActiveCssClass();
    } else {
      this.businessLineFormGroup.markAllAsTouched();
    }
  }

  private saveOrUpdateRegion(businessLine: BusinessLines): void {
    if (this.isEdit) {
      this.store.dispatch(new SaveBusinessLine(businessLine));
      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      this.isEdit = false;
      this.editedBusinessLineId = null;
      return;
    }
    this.store.dispatch(new SaveBusinessLine(businessLine));
    this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
  }
}
