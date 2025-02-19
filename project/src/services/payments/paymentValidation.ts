import { PaymentFormData } from '../../types/payment';
import { PaymentValidationError } from './paymentErrors';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const PAYMENT_LIMITS = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 1000000, // $1M limit
  MIN_CHECK_NUMBER_LENGTH: 3,
  MAX_CHECK_NUMBER_LENGTH: 20,
  MIN_REFERENCE_LENGTH: 3,
  MAX_REFERENCE_LENGTH: 50
};

export const validatePayment = (payment: PaymentFormData): ValidationResult => {
  const errors: string[] = [];

  // Validate amount
  const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
  
  if (isNaN(amount)) {
    errors.push('Invalid payment amount');
  } else if (amount < PAYMENT_LIMITS.MIN_AMOUNT) {
    errors.push(`Payment amount must be at least $${PAYMENT_LIMITS.MIN_AMOUNT}`);
  } else if (amount > PAYMENT_LIMITS.MAX_AMOUNT) {
    errors.push(`Payment amount cannot exceed $${PAYMENT_LIMITS.MAX_AMOUNT.toLocaleString()}`);
  }

  // Validate payment method specific fields
  switch (payment.method) {
    case 'credit_card':
      if (!payment.cardLast4) {
        errors.push('Card last 4 digits are required');
      } else if (!/^\d{4}$/.test(payment.cardLast4)) {
        errors.push('Card last 4 digits must be numeric');
      }
      break;

    case 'check':
      if (!payment.checkNumber) {
        errors.push('Check number is required');
      } else if (payment.checkNumber.length < PAYMENT_LIMITS.MIN_CHECK_NUMBER_LENGTH) {
        errors.push(`Check number must be at least ${PAYMENT_LIMITS.MIN_CHECK_NUMBER_LENGTH} characters`);
      } else if (payment.checkNumber.length > PAYMENT_LIMITS.MAX_CHECK_NUMBER_LENGTH) {
        errors.push(`Check number cannot exceed ${PAYMENT_LIMITS.MAX_CHECK_NUMBER_LENGTH} characters`);
      } else if (!/^[A-Za-z0-9-]+$/.test(payment.checkNumber)) {
        errors.push('Check number can only contain letters, numbers, and hyphens');
      }
      break;

    case 'bank_transfer':
      if (!payment.reference) {
        errors.push('Reference number is required for bank transfers');
      }
      break;
  }

  // Validate reference number format if provided
  if (payment.reference) {
    if (payment.reference.length < PAYMENT_LIMITS.MIN_REFERENCE_LENGTH) {
      errors.push(`Reference number must be at least ${PAYMENT_LIMITS.MIN_REFERENCE_LENGTH} characters`);
    } else if (payment.reference.length > PAYMENT_LIMITS.MAX_REFERENCE_LENGTH) {
      errors.push(`Reference number cannot exceed ${PAYMENT_LIMITS.MAX_REFERENCE_LENGTH} characters`);
    } else if (!/^[A-Za-z0-9-]+$/.test(payment.reference)) {
      errors.push('Reference number can only contain letters, numbers, and hyphens');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};