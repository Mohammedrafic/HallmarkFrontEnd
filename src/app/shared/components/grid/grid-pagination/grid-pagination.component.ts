import type { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { takeUntil, distinctUntilChanged } from 'rxjs';

import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { GRID_CONFIG } from '@shared/constants';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { PagerChangeEventModel } from '@shared/components/grid/grid-pagination/models/pager-change-event.model';

@Component({
  selector: 'app-grid-pagination',
  templateUrl: './grid-pagination.component.html',
  styleUrls: ['./grid-pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridPaginationComponent extends DestroyableDirective implements OnInit {
  @Input() public currentPage: number;
  @Input() public pageSize: number;
  @Input() public totalRecordsCount: number;

  @Output() public navigateToPageEmitter: EventEmitter<number> = new EventEmitter<number>();
  @Output() public pageSizeChangeEmitter: EventEmitter<number> = new EventEmitter<number>();

  public paginationFormGroup: FormGroup;

  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  public readonly perPageFieldsSettings: FieldSettingsModel = { text: 'text', value: 'value' };

  public constructor(private readonly formBuilder: FormBuilder) {
    super();
  }

  public ngOnInit(): void {
    this.paginationFormGroup = this.getPaginationFormGroup();
    this.initPageSizeControlValueChangesListener();
  }

  public handlePagerClickEvent({ currentPage }: PagerChangeEventModel): void {
    currentPage && this.navigateToPageEmitter.emit(currentPage);
  }

  private getPaginationFormGroup(): FormGroup {
    return this.formBuilder.group({ pageSize: [this.pageSize], navigateTo: [null] });
  }

  private initPageSizeControlValueChangesListener(): void {
    this.paginationFormGroup
      .get('pageSize')
      ?.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((pageSize: number) => {
        this.pageSizeChangeEmitter.emit(pageSize);
      });
  }
}
