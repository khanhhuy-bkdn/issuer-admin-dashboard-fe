import { NextRequest, NextResponse } from 'next/server';

// Mock data for demonstration - replace with actual database/blockchain calls
const mockApplications = [
  {
    address: '0x1234567890123456789012345678901234567890',
    name: 'Acme Corp',
    requestedCategories: JSON.stringify(['Technology', 'Finance']),
    proposedFixedFee: '100',
    publicKey: '0xabcdef1234567890abcdef1234567890abcdef12',
    stakeAmount: '1000',
    status: 'pending',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
    blockNumber: '12345678'
  },
  {
    address: '0x2345678901234567890123456789012345678901',
    name: 'Beta LLC',
    requestedCategories: JSON.stringify(['Healthcare', 'Education']),
    proposedFixedFee: '150',
    publicKey: '0x123456789abcdef0123456789abcdef0123456789',
    stakeAmount: '1500',
    status: 'pending',
    submittedAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    txHash: '0x2345678901bcdef02345678901bcdef02345678901bcdef02345678901bcdef02',
    blockNumber: '12345679'
  },
  {
    address: '0x3456789012345678901234567890123456789012',
    name: 'Gamma Inc',
    requestedCategories: JSON.stringify(['Government', 'Identity']),
    proposedFixedFee: '200',
    publicKey: '0x3456789abcdef123456789abcdef123456789abc',
    stakeAmount: '2000',
    status: 'pending',
    submittedAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
    txHash: '0x3456789012cdef123456789012cdef123456789012cdef123456789012cdef123',
    blockNumber: '12345680'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    // Filter applications based on search term
    let filteredApplications = mockApplications;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredApplications = mockApplications.filter(app => 
        app.name.toLowerCase().includes(searchLower) ||
        app.address.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const total = filteredApplications.length;
    const paginatedApplications = filteredApplications.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const response = {
      success: true,
      data: {
        issuers: paginatedApplications,
        total: paginatedApplications.length,
        limit,
        offset
      },
      meta: {
        total,
        limit,
        offset,
        hasMore
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pending applications',
        data: {
          issuers: [],
          total: 0,
          limit: 50,
          offset: 0
        },
        meta: {
          total: 0,
          limit: 50,
          offset: 0,
          hasMore: false
        }
      },
      { status: 500 }
    );
  }
}