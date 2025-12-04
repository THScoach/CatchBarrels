
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { parse } from 'csv-parse/sync';

export const dynamic = 'force-dynamic';

interface HitTraxRow {
  exitVelocity: number;
  launchAngle: number;
  distance: number;
  sprayAngle: number;
}

/**
 * POST /api/assessments/[id]/import-hittrax
 * Imports Hit Trax launch monitor CSV data for an assessment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const assessmentId = params.id;

    // Verify assessment exists and belongs to user or admin
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        OR: [
          { userId: session.user.id },
          // Allow admin access (assuming username 'admin')
          { user: { username: 'admin' } }
        ]
      },
      include: {
        user: true
      }
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Read CSV content
    const csvContent = await file.text();

    // Parse CSV (assuming columns: Exit Velocity, Launch Angle, Distance, Spray Angle)
    let records: any[];
    try {
      records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid CSV format' },
        { status: 400 }
      );
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      );
    }

    // Map CSV data to HitTraxRow format
    // Support multiple column name variations
    const hitTraxData: HitTraxRow[] = records
      .map((row) => {
        // Find exit velocity column (could be "Exit Velocity", "ExitVelo", "EV", etc.)
        const exitVelocity = parseFloat(
          row['Exit Velocity'] || 
          row['ExitVelo'] || 
          row['Exit_Velocity'] || 
          row['EV'] || 
          row['exit_velocity'] || 
          '0'
        );

        // Find launch angle column
        const launchAngle = parseFloat(
          row['Launch Angle'] || 
          row['LaunchAngle'] || 
          row['Launch_Angle'] || 
          row['LA'] || 
          row['launch_angle'] || 
          '0'
        );

        // Find distance column
        const distance = parseFloat(
          row['Distance'] || 
          row['Dist'] || 
          row['distance'] || 
          '0'
        );

        // Find spray angle column
        const sprayAngle = parseFloat(
          row['Spray Angle'] || 
          row['SprayAngle'] || 
          row['Spray_Angle'] || 
          row['Spray'] || 
          row['spray_angle'] || 
          '0'
        );

        return {
          exitVelocity,
          launchAngle,
          distance,
          sprayAngle
        };
      })
      .filter(row => row.exitVelocity > 0 && row.distance > 0); // Filter out invalid rows

    if (hitTraxData.length === 0) {
      return NextResponse.json(
        { error: 'No valid data found in CSV. Please check column names.' },
        { status: 400 }
      );
    }

    // Calculate aggregate metrics
    const exitVelocities = hitTraxData.map(d => d.exitVelocity);
    const launchAngles = hitTraxData.map(d => d.launchAngle);
    const distances = hitTraxData.map(d => d.distance);
    const sprayAngles = hitTraxData.map(d => d.sprayAngle);

    const exitVelocityAvg = exitVelocities.reduce((a, b) => a + b, 0) / exitVelocities.length;
    const exitVelocityMax = Math.max(...exitVelocities);
    const launchAngleAvg = launchAngles.reduce((a, b) => a + b, 0) / launchAngles.length;
    const launchAngleMax = Math.max(...launchAngles);
    const ballFlightDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const ballFlightDistanceMax = Math.max(...distances);
    const sprayAngle = sprayAngles.reduce((a, b) => a + b, 0) / sprayAngles.length;

    // Calculate Ball Score Composite (0-100)
    // Formula: Weight exit velo (40%), distance (30%), launch angle consistency (30%)
    const exitVeloScore = Math.min((exitVelocityAvg / 100) * 100, 100); // 100mph = perfect
    const distanceScore = Math.min((ballFlightDistance / 400) * 100, 100); // 400ft = perfect
    
    // Launch angle consistency: prefer 15-25 degrees (optimal line drive range)
    const optimalLA = Math.abs(launchAngleAvg - 20) <= 10 ? 100 : Math.max(0, 100 - Math.abs(launchAngleAvg - 20) * 5);
    
    const ballScoreComposite = (
      exitVeloScore * 0.4 +
      distanceScore * 0.3 +
      optimalLA * 0.3
    );

    // Calculate additional ball metrics
    const barrelRate = hitTraxData.filter(
      d => d.exitVelocity >= 95 && d.launchAngle >= 10 && d.launchAngle <= 30
    ).length / hitTraxData.length * 100;

    const hardHitRate = hitTraxData.filter(d => d.exitVelocity >= 95).length / hitTraxData.length * 100;
    const lineDriverate = hitTraxData.filter(d => d.launchAngle >= 10 && d.launchAngle <= 25).length / hitTraxData.length * 100;

    // Update assessment with Hit Trax data
    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        exitVelocityAvg,
        exitVelocityMax,
        launchAngleAvg,
        launchAngleMax,
        ballFlightDistance,
        ballFlightDistanceMax,
        sprayAngle,
        ballScoreComposite,
        barrelRate,
        hardHitRate,
        lineDriverate,
        hitTraxDataImported: true,
        hitTraxImportDate: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${hitTraxData.length} swings from Hit Trax`,
      data: {
        swingsImported: hitTraxData.length,
        exitVelocityAvg: Math.round(exitVelocityAvg * 10) / 10,
        exitVelocityMax: Math.round(exitVelocityMax * 10) / 10,
        ballFlightDistance: Math.round(ballFlightDistance),
        ballScoreComposite: Math.round(ballScoreComposite),
        barrelRate: Math.round(barrelRate * 10) / 10,
        hardHitRate: Math.round(hardHitRate * 10) / 10
      }
    });

  } catch (error) {
    console.error('Hit Trax import error:', error);
    return NextResponse.json(
      { error: 'Failed to import Hit Trax data' },
      { status: 500 }
    );
  }
}
