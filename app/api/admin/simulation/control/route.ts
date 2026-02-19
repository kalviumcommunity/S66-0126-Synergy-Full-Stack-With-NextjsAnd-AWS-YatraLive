import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { hasPermission } from '@/lib/auth/rbac';
import { redis } from '@/lib/redis/client';
import { trainService } from '@/lib/services/trainService';
import { simulationEngine } from '@/worker/simulationEngine';
import { SimulationCommand, SimulationStatus } from '@/types/admin';
import { WORKER_KEYS } from '@/worker/config/constants';
import { DEFAULT_PROBABILITIES } from '@/worker/config/probabilities';
import { auditService } from '@/lib/services/auditService';
import { StatusCodes } from 'http-status-codes';

// Protect with authentication
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    // Check permission
    if (!hasPermission(req.admin!.role, 'control', 'simulation')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions',
        },
        { status: 403 }
      );
    }

    const command: SimulationCommand = await req.json();

    // Log action
    await auditService.logAdminAction({
      adminId: req.admin!.id,
      adminEmail: req.admin!.email,
      action: command.type,
      entityType: 'SIMULATION',
      metadata: command as any,
    });

    switch (command.type) {
      case 'PAUSE':
        await redis.set(WORKER_KEYS.CONTROL, 'PAUSED');
        await fetch('/api/admin/system/logs', { method: 'POST', body: JSON.stringify({ level: 'info', source: 'admin', message: 'Simulation paused by admin' }) });
        return NextResponse.json({ success: true, message: 'Simulation paused' });
      case 'RESUME':
        await redis.del(WORKER_KEYS.CONTROL);
        await fetch('/api/admin/system/logs', { method: 'POST', body: JSON.stringify({ level: 'info', source: 'admin', message: 'Simulation resumed by admin' }) });
        return NextResponse.json({ success: true, message: 'Simulation resumed' });
      case 'SET_SPEED':
        const baseInterval = 8000;
        const newInterval = baseInterval / command.speed;
        await redis.hset(WORKER_KEYS.STATUS, 'interval', newInterval as any);
        await fetch('/api/admin/system/logs', { method: 'POST', body: JSON.stringify({ level: 'info', source: 'admin', message: `Simulation speed set to ${command.speed}x` }) });
        return NextResponse.json({ success: true, message: `Speed set to ${command.speed}x` });
      case 'SET_PROBABILITIES':
        const currentProbs = simulationEngine.getStats().probabilities;
        const newProbs = { ...currentProbs, ...command.probabilities };
        simulationEngine.updateProbabilities(newProbs);
        await redis.hset('worker:probabilities', newProbs as any);
        await fetch('/api/admin/system/logs', { method: 'POST', body: JSON.stringify({ level: 'info', source: 'admin', message: 'Simulation probabilities updated', data: command.probabilities }) });
        return NextResponse.json({ success: true, message: 'Probabilities updated', data: newProbs });
      case 'RESET_SIMULATION':
        const allTrains = await trainService.getAllTrains();
        for (const train of allTrains) {
          await trainService.updateTrain(train.id, { status: 'ON_TIME', delayMinutes: 0, expectedArrival: train.scheduledArrival });
        }
        await fetch('/api/admin/system/logs', { method: 'POST', body: JSON.stringify({ level: 'info', source: 'admin', message: 'Simulation reset by admin', data: { trainsReset: allTrains.length } }) });
        return NextResponse.json({ success: true, message: 'Simulation reset', data: { trainsReset: allTrains.length } });
      case 'TRIGGER_EVENT':
        const { event } = command as any;
        const train = await trainService.getTrain(event.trainId);
        if (!train) return NextResponse.json({ success: false, error: 'Train not found' }, { status: StatusCodes.NOT_FOUND });
        let result: any;
        switch (event.type) {
          case 'DELAY':
            const delayMinutes = event.params?.minutes || 15;
            result = await trainService.updateTrain(train.id, { delayMinutes: train.delayMinutes + delayMinutes, status: 'DELAYED', expectedArrival: addMinutesToTime(train.expectedArrival, delayMinutes) });
            break;
          case 'PLATFORM_CHANGE':
            const newPlatform = event.params?.platform || (train.platform === 1 ? 2 : train.platform - 1);
            result = await trainService.updateTrain(train.id, { platform: newPlatform });
            break;
          case 'CANCELLATION':
            result = await trainService.updateTrain(train.id, { status: 'CANCELLED', delayMinutes: 0 });
            break;
        }
        await fetch('/api/admin/system/logs', { method: 'POST', body: JSON.stringify({ level: 'info', source: 'admin', message: `Manual event triggered: ${event.type} on train ${train.number}`, data: event }) });
        return NextResponse.json({ success: true, message: 'Event triggered', data: result });
      default:
        return NextResponse.json({ success: false, error: 'Invalid command type' }, { status: StatusCodes.BAD_REQUEST });
    }
  } catch (error) {
    console.error('Simulation control error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to control simulation' },
      { status: 500 }
    );
  }
});

// Get status - viewer can view
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (!hasPermission(req.admin!.role, 'view', 'simulation')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const control = await redis.get(WORKER_KEYS.CONTROL);
    const workerStats = await redis.hgetall(WORKER_KEYS.STATUS);
    const lastRun = await redis.hgetall(WORKER_KEYS.LAST_RUN);
    const probabilities = await redis.hgetall('worker:probabilities');
    const status: SimulationStatus = {
      running: control !== 'PAUSED',
      speed: workerStats.interval ? 8000 / parseInt(workerStats.interval as any) : 1,
      probabilities: (probabilities as any) || DEFAULT_PROBABILITIES,
      lastUpdate: lastRun.timestamp ? parseInt(lastRun.timestamp as any) : 0,
      nextUpdateIn: workerStats.interval ? parseInt(workerStats.interval as any) : 8000,
      trainsUpdated: lastRun.trainsUpdated ? parseInt(lastRun.trainsUpdated as any) : 0,
      eventsGenerated: workerStats.totalEvents ? parseInt(workerStats.totalEvents as any) : 0,
    };
    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    console.error('Failed to get simulation status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get simulation status', status: StatusCodes.INTERNAL_SERVER_ERROR },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}, { requireAuth: true });

function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}
