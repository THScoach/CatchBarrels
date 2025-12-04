/**
 * HitTrax CSV Upload API
 * 
 * Handles upload of HitTrax CSV files, parses events, computes barrels,
 * and saves On-The-Ball metrics to player history.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { computeIsBarrel } from '@/lib/barrel-calculator';
import { computeOnTheBallMetrics, hittraxEventToBattedBall } from '@/lib/on-the-ball-engine';
import { parse } from 'csv-parse/sync';
import { Decimal } from '@prisma/client/runtime/library';

export const dynamic = 'force-dynamic';

interface HitTraxRow {
  '#': string;
  AB: string;
  Date: string;
  'Time Stamp': string;
  Pitch: string;
  'Strike Zone': string;
  'P. Type': string;
  Velo: string;
  LA: string;
  Dist: string;
  Res: string;
  Type: string;
  'Horiz. Angle'?: string;
  'Spray Chart X'?: string;
  'Spray Chart Z'?: string;
  User?: string;
  Batting?: string;
  Level?: string;
}

/**
 * Parse HitTrax CSV and create session with events
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const level = formData.get('level') as string | null;
    const notes = formData.get('notes') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read and parse CSV
    const fileContent = await file.text();
    const rows: HitTraxRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    // Infer level from CSV or use provided level
    const inferredLevel = level || rows[0]?.Level?.toLowerCase() || 'hs';

    // Create HitTrax session
    const hittraxSession = await prisma.hitTraxSession.create({
      data: {
        userId: session.user.id,
        sessionDate: new Date(),
        sourceFileName: file.name,
        level: inferredLevel,
        notes: notes || null,
      },
    });

    // Parse and save events
    const events = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const velo = parseFloat(row.Velo) || 0;
      const la = parseFloat(row.LA) || 0;
      const dist = parseFloat(row.Dist) || 0;
      const pitch = parseFloat(row.Pitch) || 0;
      const strikeZone = parseInt(row['Strike Zone']) || null;
      const res = row.Res || '';

      // Determine flags
      const hasContact = velo > 0;
      const isFoul = res.toLowerCase().includes('foul');
      const isMiss = velo === 0 && dist === 0 && !isFoul;
      const isFair = hasContact && !isFoul;
      const inZone = strikeZone ? [4, 5, 6, 7, 8, 9, 10, 11, 12].includes(strikeZone) : false;

      // Compute barrel flag
      const barrelResult = computeIsBarrel(velo, la, isFair, inferredLevel);

      // Create event
      const event = await prisma.hitTraxEvent.create({
        data: {
          sessionId: hittraxSession.id,
          rowNumber: i + 1,
          ab: parseInt(row.AB) || null,
          date: row.Date ? new Date(row.Date) : null,
          timeStamp: row['Time Stamp'] || null,
          pitch: pitch > 0 ? new Decimal(pitch) : null,
          strikeZone: strikeZone,
          pType: row['P. Type'] || null,
          velo: velo > 0 ? new Decimal(velo) : null,
          la: la !== 0 ? new Decimal(la) : null,
          dist: dist > 0 ? new Decimal(dist) : null,
          res: res || null,
          type: row.Type || null,
          horizAngle: row['Horiz. Angle'] ? new Decimal(parseFloat(row['Horiz. Angle'])) : null,
          sprayChartX: row['Spray Chart X'] ? new Decimal(parseFloat(row['Spray Chart X'])) : null,
          sprayChartZ: row['Spray Chart Z'] ? new Decimal(parseFloat(row['Spray Chart Z'])) : null,
          isFair,
          isFoul,
          isMiss,
          inZone,
          isBarrel: barrelResult.isBarrel,
          batting: row.Batting || null,
          playerLevel: inferredLevel,
        },
      });

      events.push(event);
    }

    // Compute On-The-Ball metrics
    const battedBallEvents = events.map((e) =>
      hittraxEventToBattedBall({
        velo: e.velo ? parseFloat(e.velo.toString()) : null,
        la: e.la ? parseFloat(e.la.toString()) : null,
        res: e.res,
        strikeZone: e.strikeZone,
        playerLevel: e.playerLevel,
      })
    );

    const metrics = computeOnTheBallMetrics(battedBallEvents, inferredLevel);

    // Save to player history
    await prisma.playerOnTheBallHistory.create({
      data: {
        userId: session.user.id,
        sourceType: 'hittrax',
        sourceId: hittraxSession.id,
        hittraxSessionId: hittraxSession.id,
        sessionDate: hittraxSession.sessionDate,
        barrelRate: metrics.barrelRate ? new Decimal(metrics.barrelRate) : null,
        avgEv: metrics.avgEv ? new Decimal(metrics.avgEv) : null,
        avgLa: metrics.avgLa ? new Decimal(metrics.avgLa) : null,
        sdLa: metrics.sdLa ? new Decimal(metrics.sdLa) : null,
        sdEv: metrics.sdEv ? new Decimal(metrics.sdEv) : null,
        inzoneBarrelRate: metrics.inzoneBarrelRate ? new Decimal(metrics.inzoneBarrelRate) : null,
        inzoneSdLa: metrics.inzoneSdLa ? new Decimal(metrics.inzoneSdLa) : null,
        inzoneSdEv: metrics.inzoneSdEv ? new Decimal(metrics.inzoneSdEv) : null,
        foulPct: metrics.foulPct ? new Decimal(metrics.foulPct) : null,
        missPct: metrics.missPct ? new Decimal(metrics.missPct) : null,
        fairPct: metrics.fairPct ? new Decimal(metrics.fairPct) : null,
        level: inferredLevel,
        contextJson: {
          totalEvents: metrics.totalEvents,
          barrels: metrics.barrels,
          fairBalls: metrics.fairBalls,
          sourceFileName: file.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: hittraxSession.id,
      eventsProcessed: events.length,
      metrics: {
        barrelRate: metrics.barrelRate,
        avgEv: metrics.avgEv,
        avgLa: metrics.avgLa,
        sdLa: metrics.sdLa,
        sdEv: metrics.sdEv,
        barrels: metrics.barrels,
        fairBalls: metrics.fairBalls,
      },
    });
  } catch (error: any) {
    console.error('[HitTrax Upload Error]', error);
    return NextResponse.json(
      { error: 'Failed to process HitTrax CSV', details: error.message },
      { status: 500 }
    );
  }
}
