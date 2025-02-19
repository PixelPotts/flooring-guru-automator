export class PaymentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentValidationError';
  }
}

export class PaymentProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentProcessingError';
  }
}

export class PaymentSyncError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentSyncError';
  }
}