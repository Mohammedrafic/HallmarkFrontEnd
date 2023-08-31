import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngxs/store';

import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { HelpIterator } from '@shared/helpers/iterator';
import { HelpDomain, HelpNavigationLinks } from '@shell/shell.constant';
import { AppState } from 'src/app/store/app.state';

@Injectable()
export class HelpNavigationService {
  constructor(
    private router: Router,
    private store: Store,
  ) {}

  navigateHelpPage(isAgency: boolean): void {
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

    while (!helpUrls[iterator.getCurrent()] && iterator.hasNext()) {
      const urlKey = iterator.getNext();
      const isComplexUrl = urlKey === 'add' || urlKey === 'edit';

      if (helpUrls[urlKey]) {
        keyFound = true;
        const helpPage = !isComplexUrl ? helpUrls[urlKey] as string
        : (helpUrls[urlKey] as Record<string, string>)[iterator.getNext()];
        const url = this.constructUrl(isAgency, helpPage);

        window.open(url, '_blank', 'noopener');
        break;
      }
    }

    if (!keyFound) {
      const url = this.constructUrl(isAgency, '');
      window.open(url, '_blank', 'noopener');
    }
  }

  private constructUrl(isAgency: boolean, helpLink: string): string {
    if (helpLink) {
      const domain = isAgency ? HelpDomain[BusinessUnitType.Agency] : HelpDomain[BusinessUnitType.Organization];

      return `${domain}${helpLink}`;
    }

    const domain = isAgency ? HelpDomain['agencyFallbackUrl'] : HelpDomain['orgFallbackUrl'];

    return domain;
  }
}
