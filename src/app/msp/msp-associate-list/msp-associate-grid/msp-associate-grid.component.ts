import { Component, EventEmitter, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AbstractGridConfigurationComponent,
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { combineLatest, debounceTime, filter, map, Observable, Subject, take, takeWhile } from 'rxjs';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { TiersException } from '@shared/components/associate-list/store/associate.actions';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { AgencyStatus } from '@shared/enums/status';
import { UserPermissions } from "@core/enums";
import { Permission } from "@core/interface";
import { MSPAssociateOrganizationsAgency, MSPAssociateOrganizationsAgencyPage } from '../../store/model/msp.model';
import { MspState } from '../../store/state/msp.state';
import { DeleteMspAssociateOrganizationsAgencyById, GetMspAssociateAgency, GetMSPAssociateListPage } from '../../store/actions/msp.actions';
import { UserState } from '../../../store/user.state';

@Component({
  selector: 'app-msp-associate-grid',
  templateUrl: './msp-associate-grid.component.html',
  styleUrls: ['./msp-associate-grid.component.scss'],
})
export class MSPAssociateGridComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Input() public mspAssociateEvent$: Subject<boolean>;
  @Input() public isMSPAgency: boolean;
  @Input() areMSPAgencyActionsAllowed: boolean;
  @Input() userPermission: Permission;

  @ViewChild('grid') grid: GridComponent;

  @Select(MspState.mspAssociateListPage)
  public mspAssociateListPage$: Observable<MSPAssociateOrganizationsAgencyPage>;

  @Select(UserState.lastSelectedMspId)
  private lastSelectedMspId$: Observable<number>;
  get headerText(): string {
    return 'Agency';
  }

  public mspAgencyData: MSPAssociateOrganizationsAgencyPage;
  public readonly userPermissions = UserPermissions;
  public readonly agencyStatus = AgencyStatus;
  public openMspAssociateAgencyDialog = new EventEmitter<boolean>();

  private isAlive = true;
  private pageSubject = new Subject<number>();

  constructor(private confirmService: ConfirmService, private store: Store, private actions$: Actions) {
    super();
  }

  ngOnInit(): void {
    this.getAgencies();
    this.subscribeOnMspAssociateAgencyDialogEvent();
    this.subscribeOnBusinessUnitChange();
    this.subscribeOnPageChanges();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onRemove({ index, ...row }: { index: string } & MSPAssociateOrganizationsAgency): void {
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
          this.store.dispatch(new DeleteMspAssociateOrganizationsAgencyById(row.id));
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
    this.store.dispatch(new GetMSPAssociateListPage(this.currentPage, this.pageSize));
  }

  private subscribeOnMspAssociateAgencyDialogEvent(): void {
    this.mspAssociateEvent$.pipe(takeWhile(() => this.isAlive)).subscribe(() => {
      this.openMspAssociateAgencyDialog.emit(true);
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

  private subscribeOnBusinessUnitChange(): void {
    this.lastSelectedMspId$
      .pipe(takeWhile(() => this.isAlive))
      .subscribe(() => {
        this.store.dispatch(new GetMspAssociateAgency());
        this.dispatchNewPage();
      });
  }

  private getAgencies(): void {
    this.mspAssociateListPage$
      .pipe(
        map((data) => {
          return data;
        }),
        takeWhile(() => this.isAlive),
      )
      .subscribe((data) => {
        this.mspAgencyData = data;
      });
  }
}
