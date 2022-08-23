import { PurchaseOrder } from "src/app/shared/models/purchase-order.model";

export class GetPurchaseOrders {
  static readonly type = '[PurchaseOrder] Get Purchase Orders';
  constructor() { }
}

export class SavePurchaseOrder {
  static readonly type = '[SavePurchaseOrder] Save Purchase Order';
  constructor(public purchaseOrder: PurchaseOrder) { }
}

export class SavePurchaseOrderSucceeded {
  static readonly type = '[PurchaseOrder] Save Purchase order Succeeded';
  constructor() { }
}

export class SetIsDirtyPurchaseOrderForm {
  static readonly type = '[PurchaseOrder] Set Is Dirty Purchase order Form';
  constructor(public isDirtyPurchaseOrderForm: boolean) { }
}

export class DeletPurchaseOrder {
  static readonly type = '[PurchaseOrder] Delete Purchase Order';
  constructor(public id: number) { }
}

export class DeletPurchaseOrderSucceeded {
  static readonly type = '[PurchaseOrder] Delete Purchase Order Succeeded';
  constructor() { }
}

export class GetPurchaseOrderById {
  static readonly type = '[PurchaseOrder] Get Purchase Order by Id';
  constructor(public id: number) { }
}
