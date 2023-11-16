import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngxs/store';

import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { HelpIterator } from '@shared/helpers/iterator';
import { HelpDomain, HelpNavigationLinks } from '@shell/shell.constant';
import { DomainLinks } from '@shared/models/help-site-url.model';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { AppState } from 'src/app/store/app.state';

@Injectable()
export class HelpNavigationService {
  constructor(
    private router: Router,
    private store: Store,
  ) {}

  navigateHelpPage(isAgency: boolean, links: DomainLinks): void {
    const { isIRPEnabled, isVMCEnabled } =
    this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences || {};
    const selectedDomain = this.resolveDomain(links, isAgency, isIRPEnabled, isVMCEnabled);
    const currentUrl = this.router.url;
    const fragments = currentUrl.split('/').filter((fragment) => !!fragment);

    if (!fragments || !fragments.length) {
      return;
    }

    const isIrpHelpSystem = this.store.selectSnapshot(AppState.getHelpSystem);
    const helpUrls: Record<string, string | Record<string, string>>
    = isIrpHelpSystem ? HelpNavigationLinks(isAgency).irpLinks : HelpNavigationLinks(isAgency).vmsLinks;
    const iterator = new HelpIterator(fragments, true);
    let keyFound = false;

    //TODO: A temporary solution for a redirect when an organization is created for VMS and IRP.
    // Should implement resolve context, after IRP implementation
    if(!!isIRPEnabled && !!isVMCEnabled && !isAgency) {
      this.redirectToDefaultSelectedDomain(isAgency, selectedDomain);
    }

    while (!helpUrls[iterator.getCurrent()] && iterator.hasNext()) {
      const urlKey = iterator.getNext();
      const isComplexUrl = urlKey === 'add' || urlKey === 'edit';

      if (helpUrls[urlKey]) {
        keyFound = true;
        const helpPage = !isComplexUrl ? helpUrls[urlKey] as string
        : (helpUrls[urlKey] as Record<string, string>)[iterator.getNext()];
        const url = this.constructUrl(isAgency, helpPage, selectedDomain);
        window.open(url, '_blank', 'noopener');
        break;
      }
    }

    if (!keyFound) {
      this.redirectToDefaultSelectedDomain(isAgency, selectedDomain);
    }
  }

  private redirectToDefaultSelectedDomain(isAgency: boolean, selectedDomain: string): void {
    const url = this.constructUrl(isAgency, '', selectedDomain);
    window.open(url, '_blank', 'noopener');
  }

  private resolveDomain(
    domainLinks: DomainLinks,
    isAgency: boolean,
    isIRPEnabled = false,
    isVMCEnabled = false
  ): string {
    switch (true) {
      case isAgency:
        return domainLinks.agency;
      case isIRPEnabled && isVMCEnabled:
        return domainLinks.both;
      case isIRPEnabled:
        return domainLinks.irp;
      case isVMCEnabled:
        return domainLinks.vms;
      default:
        return domainLinks.vms;
    }
  }

  private constructUrl(isAgency: boolean, helpLink: string, orgDomain?: string): string {
    if (helpLink && !isAgency) {
       return `${orgDomain}/.auth/login/aadb2c?post_login_redirect_uri=${encodeURIComponent(`/Topics_Org/${helpLink}`)}`;
    } else if (helpLink && isAgency) {
      return `${HelpDomain[BusinessUnitType.Agency]}${helpLink}`;
    }

    const domain = isAgency ? HelpDomain['agencyFallbackUrl'] : `${orgDomain}` as string;

    return domain;
  }
}
