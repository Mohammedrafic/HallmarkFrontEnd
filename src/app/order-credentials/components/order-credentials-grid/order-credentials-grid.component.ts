import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges,
  ViewChild } from '@angular/core';

import { GridComponent, GroupSettingsModel, PageSettingsModel } from '@syncfusion/ej2-angular-grids';

import { debounceTime, Subject, takeUntil } from 'rxjs';

import { IOrderCredentialItem } from '@order-credentials/types';
import {
  AbstractGridConfigurationComponent,
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ConfirmService } from '@shared/services/confirm.service';

@Component({
  selector: 'app-order-credentials-grid',
  templateUrl: './order-credentials-grid.component.html',
  styleUrls: ['./order-credentials-grid.component.scss'],
})
export class OrderCredentialsGridComponent extends AbstractGridConfigurationComponent implements OnChanges, OnInit, OnDestroy {
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
  public totalItemCount = 0;
  public totalPageCount = 1;

  constructor(private confirmService: ConfirmService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { credential } = changes;

    if (!credential.isFirstChange() && credential?.currentValue) {
      this.totalItemCount = credential.currentValue.length;
    }
  }

  ngOnInit(): void {
    this.pageSubject.pipe(takeUntil(this.unsubscribe$), debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
    });
    this.allowSorting=true;
    this.groupOptions = { columns: ['credentialType'] };
    this.gridPageSettings = { pageSizes: this.rowsPerPageDropDown, pageSize: this.pageSize};
    this.totalItemCount = this.credential.length;
    this.totalPageCount = this.totalItemCount / this.pageSize;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public updateCredential(data: IOrderCredentialItem): void {
    // Do not send column property to the backend, it is a fully qualified object with circular references
    const setupData = Object.assign({}, { ...data, column: undefined });
    this.update.emit(setupData);
  }

  public onEdit(event: MouseEvent, data: IOrderCredentialItem): void {
    this.edit.emit(data);
  }

  public onRowsDropDownChanged(): void {
    this.pageSize  = parseInt(this.activeRowsPerPageDropDown);
    this.gridPageSettings = { pageSizes: this.rowsPerPageDropDown, pageSize: this.pageSize};
    this.credential =[...this.credential];
    this.totalItemCount = this.credential.length;
    this.totalPageCount = this.totalItemCount / this.pageSize;
    this.currentPage =1;
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.grid.pageSettings.currentPage=event.currentPage;
      this.currentPage = event.currentPage;
    }
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
