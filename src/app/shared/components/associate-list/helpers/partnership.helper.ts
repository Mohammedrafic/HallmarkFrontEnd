import { formatDate } from '@angular/common';
import { PartnershipStatus } from '@shared/enums/partnership-settings';
import { AssociateOrganizationsAgency } from '@shared/models/associate-organizations.model';

export const CreateSuspensionTooltip = (agency: AssociateOrganizationsAgency): AssociateOrganizationsAgency => {
  if (agency.partnershipStatus !== PartnershipStatus.Active && agency.suspentionDate) {
    agency.suspensionMessage = `Suspension Start Date ${formatDate(agency.suspentionDate, 'MM/dd/yyyy', 'en-US', 'utc')}`;
  } else if (agency.suspentionDate && agency.partnershipStatus === PartnershipStatus.Active) {
    agency.suspensionMessage = `Active till ${formatDate(agency.suspentionDate, 'MM/dd/yyyy', 'en-US', 'utc')}`;
  }

  return agency;
};
