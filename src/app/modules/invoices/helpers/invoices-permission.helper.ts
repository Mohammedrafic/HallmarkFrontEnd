import { Directive } from '@angular/core';
import { Store } from '@ngxs/store';

import { Permission } from '@core/interface';
import { Destroyable } from '@core/helpers';
import { UserPermissions } from '@core/enums';

import { UserState } from '../../../store/user.state';

@Directive()
export class InvoicesPermissionHelper extends Destroyable {
  public createManualEnabled = true;
  public createInvoiceEnabled = true;
  public approveInvoiceEnabled = true;
  public payInvoiceEnabled = true;
  public deletePaymentDetailsEnabled = true;

  constructor(public store: Store) {
    super();
  }

  public get getCreateInvoiceTooltip(): string {
    return !this.createInvoiceEnabled? 'Separate permission right is required' : 'Select record in the table';
  }

  public checkPermissions(isAgency: boolean): void {
    const permission = this.store.selectSnapshot(UserState.userPermission);

    if (isAgency) {
      this.setAgencyPermissions(permission);
    } else {
      this.setOrgPermissions(permission);
    }
  }

  private setAgencyPermissions(permission: Permission): void {
    this.createManualEnabled = permission[UserPermissions.CanAgencyViewInvoices]
      && permission[UserPermissions.CanAgencyCreateManualInvoices];

    this.payInvoiceEnabled = permission[UserPermissions.CanAgencyViewInvoices]
      && permission[UserPermissions.CanAgencySetInvoiceStatusToPaid];
  }

  private setOrgPermissions(permission: Permission): void {
    this.createManualEnabled = permission[UserPermissions.CanOrganizationViewInvoices]
      && permission[UserPermissions.CanOrganizationCreateManualInvoices];

    this.createInvoiceEnabled = permission[UserPermissions.CanOrganizationViewInvoices]
      && permission[UserPermissions.CanOrganizationGenerateInvoices];

    this.approveInvoiceEnabled = permission[UserPermissions.CanOrganizationViewInvoices]
      && permission[UserPermissions.CanOrganizationApproveInvoices];

    this.payInvoiceEnabled = permission[UserPermissions.CanOrganizationViewInvoices]
      && permission[UserPermissions.CanOrganizationSetInvoiceStatusToPaid];

    this.deletePaymentDetailsEnabled = !!permission[UserPermissions.CanOrganizationViewInvoices];
  }
}
