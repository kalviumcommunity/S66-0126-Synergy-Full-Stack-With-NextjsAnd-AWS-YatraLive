import { NextRequest, NextResponse } from 'next/server';
import { trainService } from '@/lib/services/trainService';
import { TrainUpdate } from '@/types';
import { StatusCodes } from 'http-status-codes';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, context: any) {
  try {
    const id = context?.params?.id ?? (context?.params instanceof Promise ? (await context.params).id : undefined);
    const train = id ? await trainService.getTrain(id) : null;
    if (!train) return NextResponse.json({ success: false, error: 'Train not found' }, { status: StatusCodes.NOT_FOUND });
    return NextResponse.json({ success: true, data: train });
  } catch (error) {
    console.error('Failed to get train:', error);
    return NextResponse.json({ success: false, error: 'Failed to get train', status: StatusCodes.INTERNAL_SERVER_ERROR }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
}

export async function PATCH(request: NextRequest, context: any) {
  try {
    const body = await request.json();
    const updates: TrainUpdate = body;
    const id = context?.params?.id ?? (context?.params instanceof Promise ? (await context.params).id : undefined);
    const train = id ? await trainService.updateTrain(id, updates) : null;
    if (!train) return NextResponse.json({ success: false, error: 'Train not found' }, { status: StatusCodes.NOT_FOUND });
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/system/logs`, { method: 'POST', body: JSON.stringify({ level: 'info', source: 'admin', message: `Train updated: ${train.number}`, data: { trainId: train.id, updates } }) });
    return NextResponse.json({ success: true, data: train });
  } catch (error) {
    console.error('Failed to update train:', error);
    return NextResponse.json({ success: false, error: 'Failed to update train', status: StatusCodes.INTERNAL_SERVER_ERROR }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    const id = context?.params?.id ?? (context?.params instanceof Promise ? (await context.params).id : undefined);
    const train = id ? await trainService.getTrain(id) : null;
    if (!train) return NextResponse.json({ success: false, error: 'Train not found' }, { status: StatusCodes.NOT_FOUND });
    const deleted = id ? await trainService.deleteTrain(id) : false;
    if (!deleted) return NextResponse.json({ success: false, error: 'Failed to delete train' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/system/logs`, { method: 'POST', body: JSON.stringify({ level: 'info', source: 'admin', message: `Train deleted: ${train.name} (${train.number})`, data: { trainId: train.id } }) });
    return NextResponse.json({ success: true, message: 'Train deleted' });
  } catch (error) {
    console.error('Failed to delete train:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete train', status: StatusCodes.INTERNAL_SERVER_ERROR }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
}
