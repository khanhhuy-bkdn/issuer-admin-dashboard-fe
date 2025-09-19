import { BaseError, ContractFunctionRevertedError } from 'viem';

export interface ErrorDetails {
  message: string;
  code?: string | number;
  details?: string;
  userMessage: string;
}

/**
 * Parses various types of errors and returns a user-friendly error object
 */
export function parseError(error: unknown): ErrorDetails {
  // Handle viem/wagmi contract errors
  if (error instanceof BaseError) {
    const revertError = error.walk(err => err instanceof ContractFunctionRevertedError);
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName ?? '';
      const args = revertError.data?.args ?? [];
      
      return {
        message: `Contract reverted: ${errorName}`,
        code: errorName,
        details: args.length > 0 ? `Args: ${JSON.stringify(args)}` : undefined,
        userMessage: getContractErrorMessage(errorName, args)
      };
    }
    
    // Handle other viem errors
    return {
      message: error.shortMessage || error.message,
      details: error.details,
      userMessage: getViemErrorMessage(error)
    };
  }
  
  // Handle standard JavaScript errors
  if (error instanceof Error) {
    return {
      message: error.message,
      userMessage: getGenericErrorMessage(error.message)
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      userMessage: getGenericErrorMessage(error)
    };
  }
  
  // Handle unknown errors
  return {
    message: 'Unknown error occurred',
    userMessage: 'An unexpected error occurred. Please try again.'
  };
}

/**
 * Returns user-friendly messages for contract-specific errors
 */
function getContractErrorMessage(errorName: string, args: readonly unknown[]): string {
  switch (errorName) {
    case 'AccessControlUnauthorizedAccount':
      return 'You do not have permission to perform this action. Please ensure you are connected with an admin account.';
    
    case 'IssuerAlreadyApproved':
      return 'This issuer has already been approved.';
    
    case 'IssuerAlreadyRejected':
      return 'This issuer has already been rejected.';
    
    case 'IssuerNotFound':
      return 'The specified issuer was not found in the registry.';
    
    case 'InvalidAddress':
      return 'The provided address is invalid. Please check and try again.';
    
    case 'InsufficientBalance':
      return 'Insufficient balance to complete this transaction.';
    
    case 'TransferFailed':
      return 'Transaction failed. Please check your wallet and try again.';
    
    default:
      return `Contract error: ${errorName}. Please contact support if this issue persists.`;
  }
}

/**
 * Returns user-friendly messages for viem/wagmi errors
 */
function getViemErrorMessage(error: BaseError): string {
  const message = error.shortMessage || error.message;
  
  if (message.includes('User rejected')) {
    return 'Transaction was cancelled by user.';
  }
  
  if (message.includes('insufficient funds')) {
    return 'Insufficient funds to complete this transaction.';
  }
  
  if (message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (message.includes('nonce')) {
    return 'Transaction nonce error. Please try again.';
  }
  
  if (message.includes('gas')) {
    return 'Transaction failed due to gas issues. Please try again with higher gas limit.';
  }
  
  return 'Transaction failed. Please try again.';
}

/**
 * Returns user-friendly messages for generic errors
 */
function getGenericErrorMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  if (lowerMessage.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('forbidden')) {
    return 'You do not have permission to perform this action.';
  }
  
  return 'An error occurred. Please try again.';
}

/**
 * Logs error details for debugging purposes
 */
export function logError(error: unknown, context?: string): void {
  const errorDetails = parseError(error);
  
  console.error('Error occurred:', {
    context,
    message: errorDetails.message,
    code: errorDetails.code,
    details: errorDetails.details,
    timestamp: new Date().toISOString(),
    originalError: error
  });
}

/**
 * Creates a standardized error notification object
 */
export interface ErrorNotification {
  title: string;
  message: string;
  type: 'error' | 'warning';
  duration?: number;
}

export function createErrorNotification(
  error: unknown,
  title: string = 'Error',
  type: 'error' | 'warning' = 'error'
): ErrorNotification {
  const errorDetails = parseError(error);
  
  return {
    title,
    message: errorDetails.userMessage,
    type,
    duration: type === 'error' ? 5000 : 3000
  };
}

/**
 * Utility function to safely execute async operations with error handling
 */
export async function safeExecute<T>(
  operation: () => Promise<T>,
  errorContext?: string
): Promise<{ success: true; data: T } | { success: false; error: ErrorDetails }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    if (errorContext) {
      logError(error, errorContext);
    }
    return { success: false, error: parseError(error) };
  }
}

/**
 * Retry mechanism for failed operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}