import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Observable, Subject } from 'rxjs';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { Credential } from '@shared/models/credential.model';

@Component({
  selector: 'app-bill-rate-setup',
  templateUrl: './bill-rate-setup.component.html',
  styleUrls: ['./bill-rate-setup.component.scss']
})
export class BillRateSetupComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @Input() isActive: boolean = false;

  public isEdit = false;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add New';
  }

  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

  // TODO: add @Select
  billRates$: Observable<any> // TODO: add model

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onFormCancelClick(): void {
    // TODO: need implementation
  }

  public onFormSaveClick(): void {
    // TODO: need implementation
  }

  public onEditRecordButtonClick(data: any, event: any): void {
    // TODO: need implementation
  }

  public onRemoveRecordButtonClick(data: any, event: any): void {
    // TODO: need implementation
  }

  public considerForWeeklyOtChange(data: any, event: any): void {
    // TODO: need implementation
  }

  public considerForDailyOtChange(data: any, event: any): void {
    // TODO: need implementation
  }

  public considerFor7thDayOtChange(data: any, event: any): void {
    // TODO: need implementation
  }

  public regularLocalChange(data: any, event: any): void {
    // TODO: need implementation
  }

  public displayInTimeSheetChange(data: any, event: any): void {
    // TODO: need implementation
  }

  public displayInJobChange(data: any, event: any): void {
    // TODO: need implementation
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }
}
