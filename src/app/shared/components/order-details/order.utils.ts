import { Order } from '@shared/models/order-management.model';

export const getGroupedCredentials = (credentials: Order['credentials']) =>
  credentials.reduce((rv, x) => {
    (rv[x['credentialType']] = rv[x['credentialTypeId']] || []).push(x);
    return rv;
  }, {});

