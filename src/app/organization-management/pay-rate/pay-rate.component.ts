import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ShowExportDialog, ShowFilterDialog, ShowSideDialog } from '../../store/app.actions';
import { Select, Store } from '@ngxs/store';
import { UserState } from '../../store/user.state';
import { debounceTime, distinctUntilChanged, filter, Observable, Subject, takeUntil } from 'rxjs';
import { SearchComponent } from '@shared/components/search/search.component';
import { map } from 'rxjs/operators';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { SecurityState } from '../../security/store/security.state';
import { RoleTreeField } from '../../security/roles-and-permissions/role-form/role-form.component';
import { ExternalBillRatePermissions } from '@organization-management/bill-rates/models/external-bill-rate-permissions.enum';
import { GetOrganizationStructure } from '../../store/user.actions';
import { AbstractPermissionGrid } from "@shared/helpers/permissions";

@Component({
  selector: 'app-pay-rate',
  templateUrl: './pay-rate.component.html',
  styleUrls: ['./pay-rate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayRateComponent extends AbstractPermissionGrid implements OnInit, AfterViewInit, OnDestroy {
  @Select(SecurityState.roleTreeField)
  public roleTreeField$: Observable<RoleTreeField>;

  @ViewChild('search') search: SearchComponent;
  public isBillRateSetupTabActive: boolean = true;
  public isExternalBillRateType: boolean = false;
  public isExternalBillRateTypeMapping: boolean = false;
  public importDialogEvent: Subject<boolean> = new Subject<boolean>();
  public canAddBillRate = true;
  public exportMap = new Subject<ExportedFileType>()

  addBillRateBtnText: string = 'Add Record';

  searchQuery: string = '';
  private unsubscribe$: Subject<void> = new Subject();
  public filteredItems$ = new Subject<number>();
  externalBillRatePermissions = ExternalBillRatePermissions;
  externalBillRatePermissionsMap: Map<ExternalBillRatePermissions, boolean> = new Map<
    ExternalBillRatePermissions,
    boolean
  >();

  get showButton(): boolean {
    return !this.isExternalBillRateTypeMapping || this.isExternalBillRateType;
  }

  constructor(protected override store: Store) {
    super(store);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.canAddRates();
    this.store.dispatch(new GetOrganizationStructure());
  }


  ngAfterViewInit(): void {
    this.subsToSearch();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }



  public filter(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }


  public addBillRateSetupRecord(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onImportDataClick(): void {
    this.importDialogEvent.next(true);
  }


  subsToSearch(): void {
    this.search?.inputKeyUpEnter
      .pipe(
        map((event: KeyboardEvent) => (event.target as HTMLInputElement).value),
        map((q) => q.toLowerCase().trim()),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((q) => {
        if (q.length >= 2 || q.length === 0) {
          this.searchQuery = q;
        }
      });
  }

  subsToPermissions(): void {
    this.userPermission = this.store.selectSnapshot(UserState.userPermission);

    this.roleTreeField$
      .pipe(
        map((tree) => tree.dataSource),
        filter((items) => Boolean(items.length)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((permissions) => {
        this.externalBillRatePermissionsMap
          .set(
            ExternalBillRatePermissions.ViewExternalBillRates,
            Boolean(
              permissions.find((item) => item.name === ExternalBillRatePermissions.ViewExternalBillRates)?.isAssignable
            )
          )
          .set(
            ExternalBillRatePermissions.ManageExternalBillRates,
            Boolean(
              permissions.find((item) => item.name === ExternalBillRatePermissions.ManageExternalBillRates)
                ?.isAssignable
            )
          );
      });
  }

  private canAddRates(): void {
    this.canAddBillRate = this.userPermission[this.userPermissions.CanEditSettingsBillRates] 
  }
}
