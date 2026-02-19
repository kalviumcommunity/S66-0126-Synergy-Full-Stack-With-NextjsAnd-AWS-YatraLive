import { NextRequest, NextResponse } from 'next/server';
import { trainService } from '@/lib/services/trainService';
import { TrainInput } from '@/types';
import { StatusCodes } from 'http-status-codes';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as any;
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');
  try {
    const trains = await trainService.getAllTrains({ status: status || undefined, limit, offset });
    const counts = await trainService.countTrainsByStatus();
    return NextResponse.json({ success: true, data: { trains, total: trains.length, counts } });
  } catch (error) {
    console.error('Failed to get trains:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get trains', status: StatusCodes.INTERNAL_SERVER_ERROR },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const trainInput: TrainInput = body;
    if (!trainInput.number || !trainInput.name || !trainInput.source || !trainInput.destination || !trainInput.route) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: StatusCodes.BAD_REQUEST });
    }
    const train = await trainService.createTrain(trainInput);
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/system/logs`, { method: 'POST', body: JSON.stringify({ level: 'info', source: 'admin', message: `Train created: ${train.name} (${train.number})`, data: { trainId: train.id } }) });
    return NextResponse.json({ success: true, data: train }, { status: StatusCodes.CREATED });
  } catch (error) {
    console.error('Failed to create train:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create train', status: StatusCodes.INTERNAL_SERVER_ERROR },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
