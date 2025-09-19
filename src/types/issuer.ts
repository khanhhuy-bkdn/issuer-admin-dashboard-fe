export interface IssuerApplication {
  id: string;
  name: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  categories: string[];
  proposedFixedFee: string;
  timestamp: number;
  description?: string;
  website?: string;
  email?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  documents?: {
    businessLicense?: string;
    identityVerification?: string;
    additionalDocs?: string[];
  };
}

export interface IssuerStats {
  totalApplications: number;
  pendingApplications: number;
  approvedIssuers: number;
  rejectedApplications: number;
  revokedIssuers: number;
}

export interface IssuerFilters {
  status?: 'all' | 'pending' | 'approved' | 'rejected' | 'revoked';
  category?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  searchTerm?: string;
}

export interface IssuerActionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  message?: string;
}

export interface ContractIssuerData {
  isApproved: boolean;
  isRejected: boolean;
  fixedFee: bigint;
  categories: readonly string[];
  timestamp: bigint;
}

export interface IssuerRole {
  ADMIN_ROLE: string;
  ISSUER_ROLE: string;
  DEFAULT_ADMIN_ROLE: string;
}

export type IssuerStatus = 'pending' | 'approved' | 'rejected' | 'revoked';

export type IssuerCategory = 
  | 'identity'
  | 'education'
  | 'professional'
  | 'financial'
  | 'healthcare'
  | 'government'
  | 'technology'
  | 'other';

export interface IssuerMetadata {
  name: string;
  description: string;
  website?: string;
  logo?: string;
  contactEmail?: string;
  supportedCategories: IssuerCategory[];
  establishedDate?: string;
  jurisdiction?: string;
}

export interface IssuerActionState {
  isLoading: boolean;
  error: string | null;
  txHash?: string;
}

export type IssuerAction = 'approve' | 'reject' | 'revoke' | null;