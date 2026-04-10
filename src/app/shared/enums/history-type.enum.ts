export enum HistoryType {
  VOFFICE_HISTORY = 'VOFFICE_HISTORY',
}

export enum DocumentType {
  MAIN_DOCUMENT = 'MAIN_DOCUMENT',
  ATTACHMENT = 'ATTACHMENT',
  MAIN_DOCUMENT_SIGNED = 'MAIN_DOCUMENT_SIGNED',
  ATTACHMENT_SIGNED = 'ATTACHMENT_SIGNED',
}

export enum VOStatus {
  _IN_PROGRESS = 'vo.status.in-progress',
  _WAITING = 'vo.status.waiting',
  _APPROVED = 'vo.status.approved',
  _REJECTED = 'vo.status.rejected',
  _REVOKED = 'vo.status.revoked',
  _CANCELLED = 'vo.status.canceled',
}

export enum ProgressStatus {
  _IN_PROGRESS = 'progress.status.inprogress',
  _APPROVED = 'progress.status.approved',
  _REJECTED = 'progress.status.rejected',
  _COMPLETED = 'progress.status.completed',
}

export enum CheckInOutStatus {
  _APPROVED = 'common.status.success',
  _REJECTED = 'common.status.failed',
}
