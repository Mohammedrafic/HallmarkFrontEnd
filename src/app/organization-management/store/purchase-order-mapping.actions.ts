import { SavePurchaseOrderMappingDto, PurchaseOrderMapping, PurchaseOrderMappingFilters } from "src/app/shared/models/purchase-order-mapping.model";

export class GetPurchaseOrderMappings {
  static readonly type = '[PurchaseOrderMappings] Get purchase order mappings';
  constructor(public filter: PurchaseOrderMappingFilters) { }
}

export class SavePurchaseOrderMapping {
  static readonly type = '[PurchaseOrderMappings] Save purchase order mapping';
  constructor(public purchaseOrderMapping: SavePurchaseOrderMappingDto) { }
}

export class SavePurchaseOrderMappingSucceeded {
  static readonly type = '[PurchaseOrderMappings] Save purchase order mapping succeeded';
  constructor() { }
}

export class SetIsDirtyPurchaseOrderMappingForm {
  static readonly type = '[PurchaseOrderMappings] Set is dirty purchase order mapping Form';
  constructor(public isDirtyPurchaseOrderMappingForm: boolean) { }
}

export class DeletePurchaseOrderMapping {
  static readonly type = '[PurchaseOrderMappings] Delete purchase order mapping';
  constructor(public id: number) { }
}

export class DeletePurchaseOrderMappingSucceeded {
  static readonly type = '[PurchaseOrderMappings] delete purchase order mapping succeeded';
  constructor() { }
}

export class ShowConfirmationPopUp {
  static readonly type = '[PurchaseOrderMappings] Save/Update purchase order mapping Failed';
  constructor() { }
}

