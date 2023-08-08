import { AllowedAgencyCandidateUrlForOrgUser } from '@core/guards/guards.constant';
import { BusinessUnitType } from '@shared/enums/business-unit-type';

export const HasCandidatesLink = (
  currentUrl: string,
  businessUnitType: number,
  isEmployee: boolean | undefined
): boolean => {
  const urlWithoutId = createUrlWithoutId(currentUrl);

  return businessUnitType === BusinessUnitType.Organization &&
    !isEmployee &&
    AllowedAgencyCandidateUrlForOrgUser.includes(urlWithoutId);
};

const createUrlWithoutId = (currentUrl: string): string => {
  /**
   * This method create links without id for specific case:
   * /agency/candidates/edit/
   * /agency/candidates/
   *
   * @param isCandidateLink - Use in condition to build link and take just first two word to build link,
   * base on url length
   * @param isCandidateEditLink - Use in condition to build link and take first three word to build link,
   * base on url length
   */
  const url = currentUrl.split('/').filter((value: string) => value.length);
  return url.reduce((acc: string, current: string, index: number) => {
    const isCandidateLink = url.length === 3 && index === 2;
    const isCandidateEditLink = url.length >= 4 && index === 3;

    if ( isCandidateLink || isCandidateEditLink ) {
      return acc;
    }

    return acc.concat(`${current}/`);
  }, '/');
};
