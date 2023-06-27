import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
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
  RECORD_DELETE,
} from '@shared/constants';
import { MessageTypes } from '@shared/enums/message-types';
import { BusinessLines } from '@shared/models/business-line.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { filter, Observable, Subject, take, takeWhile, throttleTime } from 'rxjs';
import { ShowSideDialog, ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';

@Component({
  selector: 'app-business-lines',
  templateUrl: './business-lines.component.html',
  styleUrls: ['./business-lines.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessLinesComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Select(BusinessLinesState.businessLines) public readonly businessLines$: Observable<BusinessLines[]>;
  @Select(BusinessLinesState.totalCount) public readonly totalCount$: Observable<number>;
  @Select(UserState.lastSelectedOrganizationId) public readonly organizationId$: Observable<number>;

  public businessLineFormGroup: FormGroup;
  private isEdit = false;
  private editedBusinessLineId: number | null;
  private readonly pageSubject = new Subject<number>();
  private isAlive = true;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  constructor(private readonly store: Store, private readonly confirmService: ConfirmService) {
    super();
    this.businessLineFormGroup = new FormGroup({
      line: new FormControl('', Validators.required),
    });
  }

  public ngOnDestroy(): void {
    this.isAlive = false;
  }

  public ngOnInit(): void {
    this.getData();
    this.subscribeOnOrganization();
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
      }).pipe(
        take(1)
      ).subscribe((confirm) => {
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
        .pipe(
          filter((confirm) => !!confirm),
          take(1)
        ).subscribe(() => {
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
      this.store.dispatch(new SaveBusinessLine(businessLine, true));
      this.isEdit = false;
      this.editedBusinessLineId = null;
      return;
    }
    this.store.dispatch(new SaveBusinessLine(businessLine, false));
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  private getData(): void {
    this.store.dispatch(new GetBusinessLines(this.currentPage, this.pageSize));
  }

  private subscribeOnOrganization(): void {
    this.organizationId$.pipe(takeWhile(() => this.isAlive)).subscribe(() => {
      this.currentPage = 1;
      this.getData();
    });

    this.pageSubject
      .pipe(
        takeWhile(() => this.isAlive),
        throttleTime(100)
      )
      .subscribe((page) => {
        this.currentPage = page;
        this.getData();
      });
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }
}
