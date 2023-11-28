import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AbstractGridConfigurationComponent,
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import PriceUtils from '@shared/utils/price.utils';
import { JOB_DISTRIBUTION_COLUMNS } from '@shared/components/associate-list/associate-grid/associated-org-grid.constant';
import {
  AssociateOrganizationsAgency,
  AssociateOrganizationsAgencyPage,
} from '@shared/models/associate-organizations.model';
import { PartnershipStatus } from '@shared/enums/partnership-settings';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { AssociateListState } from '@shared/components/associate-list/store/associate.state';
import { combineLatest, debounceTime, filter, map, Observable, Subject, take, takeWhile } from 'rxjs';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { TiersException } from '@shared/components/associate-list/store/associate.actions';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { UserState } from '../../../../store/user.state';
import { AgencyStatus } from '@shared/enums/status';
import { UserPermissions } from "@core/enums";
import { Permission } from "@core/interface";
import { CreateSuspensionTooltip } from '../helpers';

@Component({
  selector: 'app-associate-grid',
  templateUrl: './associate-grid.component.html',
  styleUrls: ['./associate-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssociateGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() public associateEvent$: Subject<boolean>;
  @Input() public isAgency: boolean;
  @Input() areAgencyActionsAllowed: boolean;
  @Input() userPermission: Permission;

  @ViewChild('grid') grid: GridComponent;

  @Select(AssociateListState.associateListPage)
  public associateListPage$: Observable<AssociateOrganizationsAgencyPage>;

  @Select(UserState.lastSelectedAgencyId)
  private lastSelectedAgencyId$: Observable<number>;

  @Select(UserState.lastSelectedOrganizationId)
  private lastSelectedOrganizationId$: Observable<number>;

  get headerText(): string {
    return this.isAgency ? 'Organization' : 'Agency';
  }

  public agencyData: AssociateOrganizationsAgencyPage;
  public readonly userPermissions = UserPermissions;
  public priceUtils = PriceUtils;
  public readonly agencyStatus = AgencyStatus;
  public readonly partnershipStatuses = PartnershipStatus;
  public jobDistributionColumns = JOB_DISTRIBUTION_COLUMNS;
  public openAssociateOrgAgencyDialog = new EventEmitter<boolean>();
  public partnershipStatusValueAccess = (_: string, { partnershipStatus }: AssociateOrganizationsAgency) => {
    return PartnershipStatus[partnershipStatus];
  };
  public openEditDialog = new EventEmitter<AssociateOrganizationsAgency>();

  private isAlive = true;
  private pageSubject = new Subject<number>();

  constructor(private confirmService: ConfirmService, private store: Store, private actions$: Actions) {
    super();
  }

  ngOnInit(): void {
    this.getAgencies();
    this.subscribeOnAssociateOrgAgencyDialogEvent();
    this.subscribeOnUpdatePage();
    this.subscribeOnBusinessUnitChange();
    this.subscribeOnPageChanges();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public override updatePage(): void {
    this.dispatchNewPage();
  }

  public onEdit({ index, ...row }: { index: string } & AssociateOrganizationsAgency): void {
    this.grid.selectRow(Number(index) + 1);
    this.openEditDialog.emit(row);
  }

  public onEditEnd(): void {
    this.grid.clearRowSelection();
  }

  public onRemove({ ...row }: AssociateOrganizationsAgency): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .pipe(
        filter((confirm) => !!confirm),
        take(1)
      ).subscribe(() => {
        if (row.id) {
          this.store.dispatch(new TiersException.DeleteAssociateOrganizationsAgencyById(row.id));
        }
      });
  }

  public changeGridSize(size: number): void {
    this.currentPage = 1;
    this.pageSize = size;
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
    this.dispatchNewPage();
  }

  public changeGridPage(page: number): void {
    this.pageSubject.next(page);
  }

  private dispatchNewPage(): void {
    this.store.dispatch(new TiersException.GetAssociateListPage(this.currentPage, this.pageSize, this.orderBy));
  }

  private subscribeOnAssociateOrgAgencyDialogEvent(): void {
    this.associateEvent$.pipe(takeWhile(() => this.isAlive)).subscribe(() => {
      this.openAssociateOrgAgencyDialog.emit(true);
    });
  }

  private subscribeOnUpdatePage(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(TiersException.UpdateAssociateOrganizationsAgencyPage),
        takeWhile(() => this.isAlive)
      )
      .subscribe(() => {
        this.dispatchNewPage();
      });
  }

  private subscribeOnBusinessUnitChange(): void {
    combineLatest([this.lastSelectedOrganizationId$, this.lastSelectedAgencyId$])
      .pipe(takeWhile(() => this.isAlive))
      .subscribe(() => {
        this.store.dispatch(new TiersException.GetAssociateAgencyOrg());
        this.dispatchNewPage();
      });
  }

  private subscribeOnPageChanges(): void {
    this.pageSubject.pipe(
      debounceTime(1),
      takeWhile(() => this.isAlive)
    ).subscribe((page: number) => {
      this.currentPage = page;
      this.dispatchNewPage();
    });
  }

  private getAgencies(): void {
    this.associateListPage$
    .pipe(
      map((data) => {
        data.items.forEach((agency) => {
          CreateSuspensionTooltip(agency);
        });

        return data;
      }),
      takeWhile(() => this.isAlive),
    )
    .subscribe((data) => {
      this.agencyData = data;
    });
  }
}
