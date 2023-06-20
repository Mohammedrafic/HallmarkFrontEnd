import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GridComponent, SearchService } from '@syncfusion/ej2-angular-grids';
import { combineLatest, delay, filter, merge, Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import {
  AbstractGridConfigurationComponent ,
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { OrganizationManagementState } from '../../../store/organization-management.state';
import { ShowSideDialog, ShowToast } from '../../../../store/app.actions';
import {
  CANCEL_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
  PLEASE_SELECT_SYSTEM_GROUP_SETUP,
} from '@shared/constants/messages';
import { ConfirmService } from '@shared/services/confirm.service';
import {
  CredentialSkillGroup,
  CredentialSkillGroupPage,
  CredentialSkillGroupPost,
} from '@shared/models/skill-group.model';
import {
  GetAssignedSkillsByOrganization,
  GetCredentialSkillGroup,
  RemoveCredentialSkillGroup,
  SaveUpdateCredentialSkillGroup,
} from '../../../store/organization-management.actions';
import { UserState } from 'src/app/store/user.state';
import { Skill } from '@shared/models/skill.model';
import { AppState } from '../../../../store/app.state';
import { TakeUntilDestroy } from '@core/decorators';
import { Organization } from '@shared/models/organization.model';
import { GroupSetupService } from '@organization-management/credentials/services/group-setup.service';
import { MessageTypes } from '@shared/enums/message-types';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { RowSelectedEvent } from '@ag-grid-community/core';

@TakeUntilDestroy
@Component({
  selector: 'app-group-setup',
  templateUrl: './group-setup.component.html',
  styleUrls: ['./group-setup.component.scss'],
  providers: [SearchService],
})
export class GroupSetupComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('searchGrid') searchGrid: GridComponent;
  @ViewChild('searchInputWithIcon') search: ElementRef;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(OrganizationManagementState.skillGroups)
  skillGroups$: Observable<CredentialSkillGroupPage>;

  @Select(OrganizationManagementState.assignedSkillsByOrganization)
  allOrganizationSkills$: Observable<Skill[]>;

  @Select(OrganizationManagementState.organization)
  private organization$: Observable<Organization>;

  public skillGroups: CredentialSkillGroup[];
  public filteredAssignedSkills: Skill[];
  public allAssignedSkills: Skill[];
  public searchDataSource: Skill[];
  public skillsId = new Set<number>();

  skillGroupsFormGroup: FormGroup;

  isGridStateInvalid = false;
  isEdit: boolean;
  editedSkillGroupId?: number;
  isIRPAndVMSEnabled = false;
  selectedIdsForCreatedGroup: number[];

  protected componentDestroy: () => Observable<unknown>;

  private isIRPFlagEnabled = false;
  private reservedMasterSkillIds = new Set<number>();
  private pageSubject = new Subject<number>();
  private previouslySavedMappingsNumber: number;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  constructor(
    private store: Store,
    private confirmService: ConfirmService,
    private groupSetupService: GroupSetupService,
  ) {
    super();

    this.checkIRPFlag();
  }

  ngOnInit(): void {
    this.startOrganizationWatching();
    this.organizationChangedHandler();
    this.skillGroupDataLoadedHandler();
    this.startPageChageWatching();
  }

  editRow(saveSkillGroup: CredentialSkillGroup, event: MouseEvent): void {
    this.addActiveCssClass(event);
    const currentRowSkillGroupIds = saveSkillGroup.skills?.map(s => s.id);
    const savedSkillIdsWithoutCurrentRow = Array.from(this.reservedMasterSkillIds).filter(s =>
      currentRowSkillGroupIds && !currentRowSkillGroupIds.includes(s)
    );

    const updatedAssignedSkills = this.allAssignedSkills.filter(s => !savedSkillIdsWithoutCurrentRow.includes(s.id));

    this.searchDataSource = updatedAssignedSkills;

    this.isGridStateInvalid = false;
    this.isEdit = true;
    this.editedSkillGroupId = saveSkillGroup.id;

    const savedSkillIds: number[] = [];
    const savedSkillIdsIndexes: number[] = [];
    saveSkillGroup.skills?.forEach(savedSkill => {
      const foundAssignedSkill = updatedAssignedSkills.find(skill => skill.id === savedSkill.id);
      if (foundAssignedSkill) {
        savedSkillIds.push(foundAssignedSkill.id);
        savedSkillIdsIndexes.push(updatedAssignedSkills.indexOf(foundAssignedSkill));
      }
    });

    this.selectedIdsForCreatedGroup = savedSkillIds;

    this.groupSetupService.populateFormGroup(
      this.skillGroupsFormGroup,
      saveSkillGroup,
      savedSkillIds,
      this.isIRPAndVMSEnabled
    );

    this.previouslySavedMappingsNumber = savedSkillIds.length;

    this.store.dispatch(new ShowSideDialog(true)).pipe(
      delay(100),
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.searchGrid.selectRows(savedSkillIdsIndexes);
    });
  }

  deleteRow(skillGroup: CredentialSkillGroup, event: MouseEvent): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      }).pipe(
       takeUntil(this.componentDestroy())
    ).subscribe((confirm) => {
      if (confirm) {
        skillGroup.skills?.forEach(skill => {
          if (this.reservedMasterSkillIds.has(skill.id)) {
            this.reservedMasterSkillIds.delete(skill.id);
          }
        });
        this.store.dispatch(new RemoveCredentialSkillGroup(skillGroup, this.currentPage, this.pageSize));
      }
      this.removeActiveCssClass();
    });
  }

  closeSkillGroupModal(): void {
    if ((this.isEdit && (this.skillGroupsFormGroup.dirty || this.skillsId.size !== this.previouslySavedMappingsNumber))
      || (!this.isEdit && (this.skillGroupsFormGroup.dirty || this.skillsId.size))
    ) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        }).pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      ).subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
        this.clearFormDetails();
        this.removeActiveCssClass();
      });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.clearFormDetails();
      this.removeActiveCssClass();
    }
  }

  saveSkillGroup(): void {
    if (this.isIRPAndVMSEnabled && !this.checkOneIsSelected()) {
      this.store.dispatch(new ShowToast(MessageTypes.Error, PLEASE_SELECT_SYSTEM_GROUP_SETUP));

      return;
    }

    if (this.skillGroupsFormGroup.valid && this.skillsId.size !== 0) {
      const skillGroup: CredentialSkillGroupPost = {
        ...this.skillGroupsFormGroup.getRawValue(),
        skillIds: Array.from(this.skillsId),
        ...(this.isEdit && { id: this.editedSkillGroupId }),
      };

      if (this.isIRPAndVMSEnabled) {
        const { includeInIRP, includeInVMS } = this.skillGroupsFormGroup.getRawValue();
        skillGroup.includeInIRP = includeInIRP ?? false;
        skillGroup.includeInVMS = includeInVMS ?? false;
      }

      this.watchForSuccessesUpdateSkillGroup(skillGroup);
      this.removeActiveCssClass();
      this.clearFormDetails();
    } else {
      this.isGridStateInvalid = this.skillsId.size === 0;
      this.skillGroupsFormGroup.markAllAsTouched();
    }
  }

  private watchForSuccessesUpdateSkillGroup(skillGroup: CredentialSkillGroupPost): void {
    this.store.dispatch(new SaveUpdateCredentialSkillGroup(skillGroup, this.currentPage, this.pageSize))
      .pipe(
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
      this.store.dispatch([
        new GetAssignedSkillsByOrganization(),
        new ShowSideDialog(false),
      ]);
    });
  }

  onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
    this.pageSubject.next(this.currentPage);
  }

  nextPage(event: { currentPage?: number; value: number; }): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  selectSkillId(event: RowSelectedEvent): void {
    if (event.data.length) {
      event.data.forEach((item: Skill) => {
        if (item) {
          this.skillsId.add(item.id);
        }
      });
    } else if (event.data) {
      this.skillsId.add(event.data.id);
    }

    this.isGridStateInvalid = this.skillsId.size === 0;
  }

  removeSkillId(event: RowSelectedEvent): void {
    if (event.data.length) {
      event.data.forEach((item: Skill) => {
        if (item) {
          this.skillsId.delete(item.id);
        }
      });
    } else if (event.data) {
      this.skillsId.delete(event.data.id);
    }

    this.isGridStateInvalid = this.skillsId.size === 0;
  }

  searchSkill(event: KeyboardEvent): void {
    this.searchGrid.search((event.target as HTMLInputElement).value);
  }

  private startPageChageWatching(): void {
    this.pageSubject.pipe(takeUntil(this.componentDestroy()), throttleTime(100)).subscribe((page) => {
      this.currentPage = page;
      this.dispatchNewPage();
    });
  }

  private clearFormDetails(): void {
    this.isEdit = false;
    this.editedSkillGroupId = undefined;
    this.skillGroupsFormGroup.reset();
    this.clearSelection(this.searchGrid);
    this.searchDataSource = this.filteredAssignedSkills;
    this.isGridStateInvalid = false;
  }

  private createSkillFormGroup(): void {
    this.skillGroupsFormGroup = this.groupSetupService.createForm(this.isIRPAndVMSEnabled);
    this.watchForSystemConfigurationChange();
  }

  private watchForSystemConfigurationChange(): void {
    if (this.isIRPAndVMSEnabled) {
      const includeInIRPControl = this.skillGroupsFormGroup.get('includeInIRP') as FormControl;
      const includeInVMSControl = this.skillGroupsFormGroup.get('includeInVMS') as FormControl;

      merge(
        includeInIRPControl.valueChanges,
        includeInVMSControl.valueChanges
      ).pipe(
        filter((value: boolean | null) => value !== null),
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
        const { includeInIRP, includeInVMS } = this.skillGroupsFormGroup.getRawValue();

        this.searchDataSource = this.groupSetupService.getSearchDataSources(
          includeInIRP,
          includeInVMS,
          this.allAssignedSkills,
          this.filteredAssignedSkills
        );

        if(this.isEdit) {
          const filteredSkills = this.getSelectedAssignedSkills();
          this.searchDataSource = [...this.searchDataSource, ...filteredSkills];
        }
      });
    }
  }

  private organizationChangedHandler(): void {
    this.organizationId$.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(() => {
      this.currentPage = 1;
      this.dispatchNewPage();
      this.store.dispatch(new GetAssignedSkillsByOrganization());
    });
  }

  private getSelectedAssignedSkills(): Skill[] {
    return this.allAssignedSkills.filter((skill: Skill) => {
      return this.selectedIdsForCreatedGroup?.includes(skill.id);
    });
  }

  private dispatchNewPage(): void {
    this.store.dispatch(new GetCredentialSkillGroup(this.currentPage, this.pageSize));
  }

  private skillGroupDataLoadedHandler(): void {
    combineLatest([this.skillGroups$, this.allOrganizationSkills$]).pipe(
      takeUntil(this.componentDestroy())
    ).subscribe(([savedSkillGroupsPages, allOrganizationSkills]) => {
      if (savedSkillGroupsPages && savedSkillGroupsPages.items) {
        this.reservedMasterSkillIds.clear();
        savedSkillGroupsPages.items.forEach(item => {
          item.skills?.forEach(s => {
            this.reservedMasterSkillIds.add(s.id);
          });
        });
        this.skillGroups = savedSkillGroupsPages.items;
      }

      if (allOrganizationSkills) {
        this.allAssignedSkills = allOrganizationSkills;
        this.filterSkills();
      }

    });
  }

  private filterSkills(): void {
    this.filteredAssignedSkills = this.allAssignedSkills.filter(skill =>
      !this.reservedMasterSkillIds.has(skill.id)
    );
    this.searchDataSource = this.filteredAssignedSkills;
  }

  private checkIRPFlag(): void {
    const user = this.store.selectSnapshot(UserState.user);

    this.isIRPFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled)
      && user?.businessUnitType !== BusinessUnitType.MSP;
  }

  private startOrganizationWatching(): void {
    this.organization$.pipe(
      delay(100),
      takeUntil(this.componentDestroy())
    ).subscribe((org: Organization) => {
      const { isIRPEnabled, isVMCEnabled } = org?.preferences || {};

      this.isIRPAndVMSEnabled = this.isIRPFlagEnabled && !!(isIRPEnabled && isVMCEnabled);

      this.createSkillFormGroup();

      this.grid.getColumnByField('system').visible = this.isIRPAndVMSEnabled;
      this.grid.refreshColumns();
    });
  }

  private checkOneIsSelected(): boolean {
    const { includeInIRP, includeInVMS } = this.skillGroupsFormGroup.getRawValue();

    return includeInIRP || includeInVMS;
  }
}
