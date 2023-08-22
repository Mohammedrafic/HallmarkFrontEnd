import { FormGroup } from '@angular/forms';

import {
  CredentialSetupDetails, CredentialSetupFilterDto, CredentialSetupFilterGet,
  CredentialSetupGet,
  CredentialSetupMappingPost,
} from '@shared/models/credential-setup.model';

export class CredentialSetupAdapter {
  static getCredentialDetail(credential: CredentialSetupGet): CredentialSetupDetails {
    return {
      masterCredentialId: credential.masterCredentialId,
      optional: credential.isActive,
      reqSubmission: credential.reqSubmission,
      reqOnboard: credential.reqOnboard,
      comments: credential.comments,
      inactiveDate: credential.inactiveDate,
      irpComment: credential.irpComments,
    };
  }

  static credentialMappingForEdit(
    lastSelectedCredential: CredentialSetupFilterGet,
    mappingData: CredentialSetupGet[]
  ): CredentialSetupMappingPost {
    const credentials: CredentialSetupDetails[] = mappingData.map((credential) =>
      CredentialSetupAdapter.getCredentialDetail(credential)
    );
    const regionIds = lastSelectedCredential.regionId ? [lastSelectedCredential.regionId] : undefined;
    const locationIds = lastSelectedCredential.locationId ? [lastSelectedCredential.locationId] : undefined;
    const departmentIds = lastSelectedCredential.departmentId ? [lastSelectedCredential.departmentId] : undefined;
    const skillGroupIds = lastSelectedCredential.skillGroups?.length
      ? lastSelectedCredential.skillGroups?.map(s => s.id) as number[]
      : undefined;

    return {
      credentionSetupMappingId: lastSelectedCredential.mappingId,
      regionIds,
      locationIds,
      departmentIds,
      skillGroupIds,
      credentials,
    };
  }

  static prepareFilter(form: FormGroup): CredentialSetupFilterDto {
    const { groupId, ...formValue } = form.getRawValue();

    const preparedFormValue = {
      ...formValue,
      skillGroupId: groupId,
    };

    return Object.keys(preparedFormValue).reduce((acc: CredentialSetupFilterDto, el: string) => {
      if (preparedFormValue[el] !== null && preparedFormValue[el] !== undefined) {
        acc[el as keyof CredentialSetupFilterDto] = preparedFormValue[el];
      }

      return acc;
    }, {});
  }

  static prepareFiltersByKeys(form: FormGroup, keys: string[]): CredentialSetupFilterDto {
    keys.push('includeInIRP', 'includeInVMS');

    return keys.reduce((acc: CredentialSetupFilterDto, el: string) => {
      const key = el === 'groupId' ? 'skillGroupId' : el;
      const value = form.getRawValue()[el];

      if (value !== null && value !== undefined) {
        acc[key as keyof CredentialSetupFilterDto] = value;
      }

      return acc;
    }, {} as CredentialSetupFilterDto);
  }
}
