import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

import { GridComponent, GroupSettingsModel, PageSettingsModel } from '@syncfusion/ej2-angular-grids';

import { debounceTime, Subject, takeUntil } from 'rxjs';

import { IOrderCredential, IOrderCredentialItem } from '@order-credentials/types';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ConfirmService } from '@shared/services/confirm.service';

@Component({
  selector: 'app-order-credentials-grid',
  templateUrl: './order-credentials-grid.component.html',
  styleUrls: ['./order-credentials-grid.component.scss']
})
export class OrderCredentialsGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  @Input() credential: IOrderCredentialItem[];
  @Output() edit: EventEmitter<IOrderCredentialItem> = new EventEmitter();
  @Output() update: EventEmitter<IOrderCredentialItem> = new EventEmitter();
  @Output() delete: EventEmitter<number> = new EventEmitter();

  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();
  public groupOptions: GroupSettingsModel;
  public pageMaxCount:number;
  public gridPageSettings: PageSettingsModel;
  public pageSizes: any;
  constructor(private confirmService: ConfirmService) {
    super();
  }


  ngOnInit(): void {
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
    });
    this.allowSorting=true;
    this.groupOptions = { columns: ['credentialType'] };
    this.gridPageSettings = { pageSizes: this.rowsPerPageDropDown, pageSize: this.pageSize};
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public updateCredential(data: IOrderCredentialItem): void {
    this.update.emit(Object.assign({}, { ...data }));
  }

  public onEdit(event: MouseEvent, data: IOrderCredentialItem): void {
    this.edit.emit(data);
  }

  public onRemoveButtonClick(credential: IOrderCredentialItem): void {
    this.confirmService
    .confirm('Are you sure want to delete?', {
      title: 'Delete Record',
      okButtonLabel: 'Delete',
      okButtonClass: 'delete-button'
    })
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((confirm) => {
      if (confirm) {
        this.delete.emit(credential.credentialId);
      }
    });
 }
}
