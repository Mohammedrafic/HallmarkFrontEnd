import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import type { FieldSettingsModel, PopupEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { distinctUntilChanged, skip, takeUntil } from 'rxjs';

import { BreakpointObserverService } from '@core/services';
import { PagerChangeEventModel } from '@shared/components/grid/grid-pagination/models/pager-change-event.model';
import { GRID_CONFIG } from '@shared/constants';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { BulkTypeAction } from '@shared/enums/bulk-type-action.enum';
import { BulkActionConfig } from '@shared/models/bulk-action-data.model';

@Component({
  selector: 'app-grid-pagination',
  templateUrl: './grid-pagination.component.html',
  styleUrls: ['./grid-pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridPaginationComponent extends DestroyableDirective implements OnInit, OnChanges {
  @Input() public currentPage: number;
  @Input() public pageSize: number;
  @Input() public totalRecordsCount: number;
  @Input() public selectedTableRowsAmount = 0;
  @Input() public allowBulkSelection = false;
  @Input() public disableBulkButton = false;
  @Input() public isDarkTheme?: boolean | null;
  @Input() public customRowsPerPageDropDownObject: { text: string; value: number }[];
  @Input() public disableRowsPerPageDropdown = false;
  @Input() public bulkActionConfig: BulkActionConfig = {};

  @Output() public navigateToPageEmitter: EventEmitter<number> = new EventEmitter<number>();
  @Output() public pageSizeChangeEmitter: EventEmitter<number> = new EventEmitter<number>();
  @Output() public bulkEventEmitter: EventEmitter<BulkTypeAction> = new EventEmitter<BulkTypeAction>();

  get totalPages(): number | undefined {
    if (this.pageSize && this.totalRecordsCount) {
      return Math.ceil(this.totalRecordsCount / this.pageSize);
    }

    return undefined;
  }

  public paginationFormGroup: FormGroup;

  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  public readonly perPageFieldsSettings: FieldSettingsModel = { text: 'text', value: 'value' };
  public readonly bulkTypeAction = BulkTypeAction;

  public isMobile = false;
  public isTablet = false;

  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly breakpointService: BreakpointObserverService,
  ) {
    super();
    this.paginationFormGroup = this.getPaginationFormGroup();
  }

  ngOnInit(): void {
    this.getDeviceScreen();
    this.initPageSizeControlValueChangesListener();

    if (this.disableRowsPerPageDropdown) {
      this.paginationFormGroup.controls['pageSize'].disable();
    } else {
      this.paginationFormGroup.controls['pageSize'].enable();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageSize']) {
      this.setPagingInputData();
    }
  }

  public navigateTo(page: number): void {
    if (page) {
      this.navigateToPageEmitter.emit(page);
    }
  }

  public handlePagerClickEvent({ currentPage, oldProp }: PagerChangeEventModel): void {
    if (oldProp?.totalRecordsCount) {
      return;
    }

    currentPage && this.navigateToPageEmitter.emit(currentPage);
  }

  public openDropdownPopup(args: PopupEventArgs): void {
    // reset default responsive functionality of dropdown popup
    if (this.isMobile || this.isTablet) {
      args.popup.element.classList.remove('e-ddl-device', 'e-ddl-device-filter');
      args.popup.collision = { X: 'flip', Y: 'flip' };
      args.popup.position = { X: 'left', Y: 'top' };
      args.popup.dataBind();
    }
  }

  private getPaginationFormGroup(): FormGroup {
    return this.formBuilder.group({ pageSize: [this.pageSize], navigateTo: [null] });
  }

  private initPageSizeControlValueChangesListener(): void {
    this.paginationFormGroup
      .get('pageSize')
      ?.valueChanges.pipe(
        skip(1),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe((pageSize: number) => {
        this.pageSizeChangeEmitter.emit(pageSize);
      });
  }

  private getDeviceScreen(): void {
    this.breakpointService
      .getBreakpointMediaRanges()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ isMobile, isTablet }) => {
        this.isMobile = isMobile;
        this.isTablet = isTablet;
      });
  }

  private setPagingInputData(): void {
    this.paginationFormGroup.controls['pageSize'].patchValue(this.pageSize);
  }
}
