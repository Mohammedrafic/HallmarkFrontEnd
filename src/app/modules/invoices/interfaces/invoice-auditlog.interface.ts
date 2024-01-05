export interface commonInvoiceHistory {
    Invoicebase: Invoicebase[];
    agencyInvoicebase:agencyInvoicebase[];
    InvoicecheckAuditHistory:InvoicecheckAuditHistory[];
    InvoicepaymentAuditHistory:InvoicepaymentAuditHistory[]
}

export interface InvoiceAuditLogPayload {
    entityType: string;
    InvoiceId: number;
    organizationId: number;
    AgencySuffix?:number;
}

export interface Invoicebase {
    historyId: string,
    entityType: string,
    keyValue: string,
    changeType: string,
    modifiedOn: string,
    modifiedBy: string | null,
    modifiedByName: string | null
    jsonData: InvoiceAuditHistory
}

export interface InvoiceAuditHistory {
    agencypaymentDetails: any;
    invoiceId: number
    invoiceState: number
    invoiceStateText: string
    apDelivery: number
    apDeliveryText: string
    aggregateByType: number
    aggregateByTypeText: string
    issuedDate: string
    dueDate: string,
    organizationId: number,
    organizationName: string,
    isDeleted: boolean,
    paymentDetails: paymentDetatils[],
    createdAt: string
    lastModifiedAt: string,
}

export interface paymentDetatils {
    id: number,
    invoiceId: number,
    checkId: number,
    paymentDate: string,
    payment: any,
    organizationId: number,
    isDeleted: boolean,
    createdAt: string,
    lastModifiedAt: string,
    createdBy: string | null,
    lastModifiedBy: string,
    createdByName?: string | null,
    lastModifiedName: string
    invoiceStateText?: string
    organizationName?: string,


}

//Agency 

export interface agencyInvoicebase {
    historyId: string,
    entityType: string,
    keyValue: string,
    changeType: string,
    modifiedOn: string,
    modifiedBy: string | null,
    modifiedByName: string | null
    jsonData: agencyInvoiceRecord
}
export interface agencyInvoiceRecord {
    invoiceId: number,
    organizationId: number,
    agencyId: number,
    agencyName: string | null,
    invoiceState: number,
    invoiceStateText: string,
    agencySuffix: number,
    apDelivery: number,
    apDeliveryText: string,
    aggregateByType: number,
    aggregateByTypeText: string,
    issuedDate: string,
    dueDate: string,
    isDeleted: boolean,
    createdAt: string,
    lastModifiedAt: string,
    createdBy: string,
    lastModifiedBy: string,
    paymentDetails: agencypaymentDetails[],
    organizationName: string,
    organizationPrefix: string | null,
    formattedInvoiceId: string
}


export interface agencypaymentDetails {
    id: number;
    invoiceId: number;
    checkId: number;
    paymentDate: string;
    payment: number;
    organizationId: number;
    agencySuffix: number;
    isDeleted: boolean;
    paymentMode: number | null;
    paymentOption: number;
    referenceNumber: string;
}

export interface InvoicecheckAuditHistory
{
historyId: string,
entityType: string,
keyValue: string,
changeType: string,
modifiedOn: string,
modifiedBy: string,
modifiedByName: string,
jsonData: {
    id: number,
    number: string,
    date: string,
    paymentMode: number,
    paymentModeText: string,
    isRefund: boolean,
    isDeleted: boolean,
    createdAt: string,
    lastModifiedAt: string,
    organizationName:string
},
}

export interface InvoicepaymentAuditHistory
{
historyId: string,
entityType: string,
keyValue: string,
changeType: string,
modifiedOn: string,
modifiedBy: string,
modifiedByName: string,
jsonData: {
    id: number,
    invoiceId: number,
    paymentDate: string,
    payment: number,
    organizationId: number,
    isDeleted: boolean,
    lastModifiedAt: string,
    organizationName:string,
},
}




