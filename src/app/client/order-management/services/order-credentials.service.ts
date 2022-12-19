import { Injectable } from '@angular/core';

import { IOrderCredentialItem } from "@order-credentials/types";

@Injectable()
export class OrderCredentialsService {
  public updateOrderCredentials(orderCredentials: IOrderCredentialItem[], cred: IOrderCredentialItem): void {
    const isExist = orderCredentials.find(({ credentialId }: IOrderCredentialItem) => {
      return cred.credentialId === credentialId;
    });

    if (isExist) {
      Object.assign(isExist, cred);
    } else {
      orderCredentials.push(cred);
    }
  }

  public deleteOrderCredential(orderCredentials: IOrderCredentialItem[], cred: IOrderCredentialItem): void {
    const credToDelete = orderCredentials.find(({ credentialId }: IOrderCredentialItem) => {
      return cred.credentialId === credentialId;
    }) as IOrderCredentialItem;

    if (credToDelete) {
      const index = orderCredentials.indexOf(credToDelete);
      orderCredentials.splice(index, 1);
    }
  }
}
