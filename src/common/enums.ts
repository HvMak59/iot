// All application enums consolidated in one file

export enum RoleType {
  ADMIN = 'admin',
  SERVICE_MANAGER = 'service_manager',
  FIELD_ENGINEER = 'field_engineer',
  CUSTOMER = 'customer',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  QUOTATION_SENT = 'QUOTATION_SENT',
  APPROVED = 'APPROVED',
  ASSIGNED = 'ASSIGNED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketActivityAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  STATUS_CHANGED = 'STATUS_CHANGED',

  QUOTATION_UPLOADED = 'QUOTATION_UPLOADED',
  QUOTATION_SENT = 'QUOTATION_SENT',
  QUOTATION_REJECTED = 'QUOTATION_REJECTED',
  QUOTATION_ACCEPTED = 'QUOTATION_ACCEPTED',
  QUOTATION_REVISED = 'QUOTATION_REVISED',
}


// export enum QuotationStatus {
//   PENDING = 'PENDING',
//   ACCEPTED = 'ACCEPTED',
//   REJECTED = 'REJECTED',
// }

export enum QuotationStatus {
  DRAFT = 'DRAFT',                 // uploaded but not sent
  SENT = 'SENT',                   // sent to customer
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CHANGE_REQUESTED = 'CHANGE_REQUESTED',
  REVISED = 'REVISED',             // new PDF uploaded after change
  // EXPIRED = 'EXPIRED',
}


export enum FileType {
  IMAGE = 'Image',
  VIDEO = 'Video',
}


export enum MetricsFrequency {
  INSTANT, DAILY, MONTHLY, YEARLY, TOTAL
}
