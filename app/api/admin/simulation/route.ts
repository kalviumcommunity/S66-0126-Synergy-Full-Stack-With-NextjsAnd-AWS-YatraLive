import { NextResponse } from 'next/server';
import { simulationEngine } from '@/worker/simulationEngine';
import { StatusCodes } from 'http-status-codes';

export async function GET() {
  try {
    const stats = simulationEngine.getStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Failed to get simulation stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get simulation stats', status: StatusCodes.INTERNAL_SERVER_ERROR },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
