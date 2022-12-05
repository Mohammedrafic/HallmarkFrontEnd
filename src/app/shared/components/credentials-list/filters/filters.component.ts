import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { Select, Store } from '@ngxs/store';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, takeUntil } from 'rxjs';

import { OptionFields } from '@shared/components/credentials-list/constants';
import { CredentialFiltersService, CredentialListService } from '@shared/components/credentials-list/services';
import { FilterColumnsModel, FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { SetCredentialsFilterCount } from '@organization-management/store/credentials.actions';
import { Destroyable } from '@core/helpers';
import { UserState } from '../../../../store/user.state';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersComponent extends Destroyable implements OnInit {
  @Input() set filteredColumns(columns: FilterColumnsModel) {
      this.filterColumns = columns;
      this.changeDetection.markForCheck();
  }
  @Input() set isIRPFlag(flag: boolean) {
    this.isIRPFlagEnabled = flag;
    this.initFilterForm();
    this.changeDetection.markForCheck();
  }
  @Input() public isCredentialSettings = false;

  @Output() public handleClearFilters: EventEmitter<number> = new EventEmitter();
  @Output() public handleApplyFilters: EventEmitter<void> = new EventEmitter();

  public optionFields: FieldSettingsModel = OptionFields;
  public credentialsFilters: FormGroup;
  public filteredItems: FilteredItem[] = [];
  public totalDataRecords: number;
  public filterColumns: FilterColumnsModel;
  public isIRPFlagEnabled = false;

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  constructor(
    private credentialListService: CredentialListService,
    private filterService: FilterService,
    private credentialFiltersService: CredentialFiltersService,
    private store: Store,
    private datePipe: DatePipe,
    private changeDetection: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForOrganizationId();
  }

  public deleteFilters(event: FilteredItem): void {
    this.filterService.removeValue(event, this.credentialsFilters, this.filterColumns);
  }

  public clearAllFilters(id?: number): void {
    this.credentialsFilters.reset();
    this.setSystemValue();
    this.filteredItems = [];
    this.store.dispatch(new SetCredentialsFilterCount(this.filteredItems.length));
    this.credentialFiltersService.clearState();
    this.handleClearFilters.emit(id);
  }

  public onFilterApply(): void {
    this.credentialFiltersService.updateFilters = this.credentialsFilters.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.credentialsFilters, this.filterColumns);
    this.store.dispatch(new SetCredentialsFilterCount(this.filteredItems.length));
    this.handleApplyFilters.emit();
  }

  public onFilterClose(): void {
    const {
      credentialIds,
      credentialTypeIds,
      expireDateApplicable,
      includeInIRP,
      includeInVMS,
    } = this.credentialFiltersService.filtersState;
    this.credentialsFilters.patchValue({
      credentialIds: credentialIds ?? null,
      credentialTypeIds: credentialTypeIds ?? [],
      expireDateApplicable: expireDateApplicable ?? null,
    });

    if(this.isIRPFlagEnabled && this.isCredentialSettings) {
      this.credentialsFilters.patchValue({
        includeInIRP: includeInIRP ?? null,
        includeInVMS: includeInVMS ?? null,
      });
    }

    this.filteredItems = this.filterService.generateChips(this.credentialsFilters, this.filterColumns, this.datePipe);
  }

  private initFilterForm(): void {
    this.credentialsFilters = this.credentialListService.createFiltersForm(this.isIRPFlagEnabled, this.isCredentialSettings);
  }

  private watchForOrganizationId(): void {
    this.organizationId$.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((id: number) => {
      this.clearAllFilters(id);
    });
  }

  private setSystemValue(): void {
    if(this.isIRPFlagEnabled && this.isCredentialSettings) {
      this.credentialsFilters.patchValue({
        includeInIRP: false,
        includeInVMS: false,
      });
    }
  }
}
