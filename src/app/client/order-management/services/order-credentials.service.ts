import { Injectable } from '@angular/core';

import { IOrderCredentialItem } from '@order-credentials/types';

@Injectable()
export class OrderCredentialsService {
  public updateOrderCredentials(
    orderCredentials: IOrderCredentialItem[], credData: IOrderCredentialItem): IOrderCredentialItem[] {
    const credToUpdate = orderCredentials.find(({ credentialId }: IOrderCredentialItem) => {
      return credData.credentialId === credentialId;
    });

    if (credToUpdate) {
      Object.assign(credToUpdate, credData);
    } else {
      orderCredentials.push(credData);
    }

    return [...orderCredentials];
  }

  public deleteOrderCredential(orderCredentials: IOrderCredentialItem[],
    cred: IOrderCredentialItem): IOrderCredentialItem[] {    
    return orderCredentials.filter((credential) => credential.credentialId !== cred.credentialId);
  }

  public hasSelectedCredentialFlags(credentials: IOrderCredentialItem[]): boolean {
    if (!credentials?.length) {
      return false;
    }

    const hasUnSelectedFlags = credentials?.find((credential) => {
      const { optional, reqForOnboard, reqForSubmission } = credential;
      return !optional && !reqForOnboard && !reqForSubmission;
    });

    return !hasUnSelectedFlags;
  }
}
