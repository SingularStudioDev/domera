// Simple test endpoint to verify client-side execution
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📡 [TEST-PING] Client-side component executed:', body);
    
    // Write to file for debugging
    const fs = require('fs');
    const timestamp = new Date().toISOString();
    fs.appendFileSync('/tmp/client-side-test.log', `${timestamp}: Component executed: ${JSON.stringify(body)}\n`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [TEST-PING] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed' });
  }
}