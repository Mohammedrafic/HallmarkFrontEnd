import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngxs/store';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { AbstractPermission } from '@shared/helpers/permissions';
import { PagerConfig } from '../../constants/pager-grid-config.constants';
import { AvailabilityRestrictionColumnDef } from '../../constants/availability-restriction-grid-config.constants';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-availability-restriction',
  templateUrl: './availability-restriction.component.html',
  styleUrls: ['./availability-restriction.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailabilityRestrictionComponent extends AbstractPermission implements OnInit {

  public columnDef: ColumnDefinitionModel[];
  public rowSelection = undefined;
  public pageNumber = 1;
  public pageSize = 5;
  public gridTitle = 'Availability Restriction';
  public customRowsPerPageDropDownObject = PagerConfig;
  public readonly dialogSubject$: Subject<{ isOpen: boolean, isEdit: boolean, data?: unknown }> = new Subject();

  constructor(protected override store: Store,) { super(store); }

  public handleChangePage(pageNumber: number): void {
    if(pageNumber && this.pageNumber !== pageNumber) {
      this.pageNumber = pageNumber;
      // this.dispatchNewPage();
    }
  }

  public addRestriction(): void {
    this.dialogSubject$.next({isOpen:true, isEdit: false});
  }

  override ngOnInit(): void {
    super.ngOnInit();
    setTimeout(() => {
      console.error(this.userPermission[this.userPermissions.ManageIrpCandidateProfile]);
      console.error(this.userPermission);
      console.error(this.userPermissions.ManageIrpCandidateProfile);
      
      
    }, 2000);
    this.columnDef = AvailabilityRestrictionColumnDef(
      this.editRestriction.bind(this),
      this.deleteRestriction.bind(this));
  }

  private editRestriction(): void {
    console.error('edit'); 
  }

  private deleteRestriction(): void {
    console.error('delete'); 
  }

}
