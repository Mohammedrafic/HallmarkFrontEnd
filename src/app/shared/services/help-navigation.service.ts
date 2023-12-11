import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngxs/store';

import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { HelpIterator } from '@shared/helpers/iterator';
import { HelpDomain, HelpNavigationLinks } from '@shell/shell.constant';
import { DomainLinks } from '@shared/models/help-site-url.model';
import { AppState } from 'src/app/store/app.state';
import { AdminState } from '@admin/store/admin.state';

@Injectable()
export class HelpNavigationService {
  constructor(
    private router: Router,
    private store: Store,
  ) {}

  navigateHelpPage(isAgency: boolean, links: DomainLinks): void {
    const { isIRPEnabled, isVMCEnabled } = this.store.selectSnapshot(AdminState.organization)?.preferences || {};

    let isIrpHelpSystem = false;

    if (isIRPEnabled && !isVMCEnabled) {
      isIrpHelpSystem = true;
    }

    if (isIRPEnabled && isVMCEnabled) {
      isIrpHelpSystem = this.store.selectSnapshot(AppState.getHelpSystem);
    }

    const selectedDomain = this.resolveDomain(links, isAgency, isIrpHelpSystem);
    const currentUrl = this.router.url;
    const fragments = currentUrl.split('/').filter((fragment) => !!fragment);

    if (!fragments || !fragments.length) {
      return;
    }

    const helpUrls: Record<string, string | Record<string, string>>
    = HelpNavigationLinks(isAgency, !!isIRPEnabled, !!isVMCEnabled, isIrpHelpSystem);


    const iterator = new HelpIterator(fragments, true);
    let keyFound = false;

    if(!isIRPEnabled && !isVMCEnabled && !isAgency) {
      this.redirectToFallBackUrl(isAgency, links, !!isIRPEnabled, !!isVMCEnabled);
      return;
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
      this.redirectToFallBackUrl(isAgency, links, !!isIRPEnabled, !!isVMCEnabled);
    }
  }

  private redirectToFallBackUrl(isAgency: boolean, links: DomainLinks, isIrp: boolean, isVms: boolean): void {
    const domain = this.resolveFallbackDomain(links, isAgency, isIrp, isVms);
    const url = this.constructUrl(isAgency, '', domain);
    window.open(url, '_blank', 'noopener');
  }

  private resolveDomain(
    domainLinks: DomainLinks,
    isAgency: boolean,
    isIrp: boolean,
  ): string {
    switch (true) {
      case isAgency:
        return domainLinks.agency;
      case isIrp:
        return domainLinks.irp;
      default:
        return domainLinks.vms;
    }
  }

  private resolveFallbackDomain(
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
      case isIRPEnabled && !isVMCEnabled:
        return domainLinks.irp;
      case isVMCEnabled && !isIRPEnabled:
        return domainLinks.vms;
      default:
        return domainLinks.both;
    }
  }

  private constructUrl(isAgency: boolean, helpLink: string, orgDomain?: string): string {
    if (helpLink && !isAgency) {
       return `${orgDomain}/.auth/login/aadb2c?post_login_redirect_uri=${encodeURIComponent(helpLink)}`;
    } else if (helpLink && isAgency) {
      return `${HelpDomain[BusinessUnitType.Agency]}${helpLink}`;
    }

    const domain = isAgency ? HelpDomain['agencyFallbackUrl'] : `${orgDomain}` as string;

    return domain;
  }
}
