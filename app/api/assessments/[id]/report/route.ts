
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface ReportData {
  playerInfo: {
    name: string;
    age?: number;
    level?: string;
    bats?: string;
  };
  assessmentDate: string;
  scores: {
    brain: number | null;
    body: number | null;
    bat: number | null;
    ball: number | null;
    overall: number | null;
  };
  details: {
    // Cognitive (Brain)
    timingControl?: number;
    impulseControl?: number;
    trajectoryPrediction?: number;
    
    // Biomechanical (Body)
    anchor?: number;
    engine?: number;
    whip?: number;
    
    // Contact Quality (Bat)
    contactRate?: number;
    hardContactRate?: number;
    onTimeSwingRate?: number;
    
    // Ball Flight (Ball)
    exitVelocity?: number;
    launchAngle?: number;
    distance?: number;
    ballScore?: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  trialEligible: boolean;
  trialTier: string;
}

/**
 * GET /api/assessments/[id]/report
 * Generates a comprehensive 4Bs assessment report
 */
export async function GET(
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

    // Fetch assessment with user data
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            name: true,
            dateOfBirth: true,
            level: true,
            bats: true,
            trialUsed: true,
            membershipTier: true,
            membershipStatus: true
          }
        }
      }
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Calculate age from date of birth
    let age: number | undefined;
    if (assessment.user.dateOfBirth) {
      const birthDate = new Date(assessment.user.dateOfBirth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Calculate 4Bs scores
    const brainScore = assessment.neuroCompositeScore || null;
    const bodyScore = assessment.biomechanicalComposite || null;
    const batScore = assessment.contactRate ? (assessment.contactRate * (assessment.onTimeSwingRate || 80) / 100) : null;
    const ballScore = assessment.ballScoreComposite || null;
    
    // Overall score (average of available scores)
    const availableScores = [brainScore, bodyScore, batScore, ballScore].filter(s => s !== null) as number[];
    const overallScore = availableScores.length > 0 
      ? availableScores.reduce((a, b) => a + b, 0) / availableScores.length 
      : null;

    // Generate strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Brain (Cognitive) Analysis
    if (brainScore !== null) {
      if (brainScore >= 70) {
        strengths.push("Excellent cognitive processing and decision-making");
      } else if (brainScore < 50) {
        weaknesses.push("Cognitive timing and pitch recognition needs work");
        recommendations.push("Practice S2 cognitive training drills to improve pitch recognition");
      }
      
      if (assessment.impulseControlScore && assessment.impulseControlScore >= 70) {
        strengths.push("Strong impulse control and zone discipline");
      } else if (assessment.impulseControlScore && assessment.impulseControlScore < 50) {
        weaknesses.push("Tendency to chase pitches outside the zone");
        recommendations.push("Focus on impulse control drills and zone awareness");
      }
    }

    // Body (Biomechanical) Analysis
    if (bodyScore !== null) {
      if (bodyScore >= 70) {
        strengths.push("Solid biomechanical foundation and swing mechanics");
      } else if (bodyScore < 50) {
        weaknesses.push("Swing mechanics need refinement");
        recommendations.push("Work with model video overlays to improve form");
      }
      
      // Specific subcategory analysis
      if (assessment.anchorScore && assessment.anchorScore >= 75) {
        strengths.push("Strong lower body foundation and weight transfer");
      } else if (assessment.anchorScore && assessment.anchorScore < 55) {
        weaknesses.push("Lower body mechanics need attention");
        recommendations.push("Practice Anchor drills focusing on stance and weight shift");
      }
      
      if (assessment.whipScore && assessment.whipScore >= 75) {
        strengths.push("Excellent bat speed and path efficiency");
      } else if (assessment.whipScore && assessment.whipScore < 55) {
        weaknesses.push("Bat speed and connection need improvement");
        recommendations.push("Focus on Whip drills to increase bat speed and improve path");
      }
    }

    // Bat (Contact Quality) Analysis
    if (batScore !== null) {
      if (assessment.contactRate && assessment.contactRate >= 70) {
        strengths.push(`High contact rate (${Math.round(assessment.contactRate)}%)`);
      } else if (assessment.contactRate && assessment.contactRate < 50) {
        weaknesses.push("Contact rate needs improvement");
        recommendations.push("Practice timing drills with varied pitch speeds");
      }
      
      if (assessment.hardContactRate && assessment.hardContactRate >= 50) {
        strengths.push("Generating quality hard contact consistently");
      } else if (assessment.hardContactRate && assessment.hardContactRate < 30) {
        weaknesses.push("Need to generate more hard contact");
        recommendations.push("Focus on power development and impact drills");
      }
    }

    // Ball (Ball Flight) Analysis
    if (ballScore !== null) {
      if (assessment.exitVelocityAvg && assessment.exitVelocityAvg >= 85) {
        strengths.push(`Strong exit velocity (${Math.round(assessment.exitVelocityAvg)} mph avg)`);
      } else if (assessment.exitVelocityAvg && assessment.exitVelocityAvg < 70) {
        weaknesses.push("Exit velocity below optimal range");
        recommendations.push("Work on strength training and bat speed development");
      }
      
      if (assessment.barrelRate && assessment.barrelRate >= 40) {
        strengths.push(`Excellent barrel rate (${Math.round(assessment.barrelRate)}%)`);
      } else if (assessment.barrelRate && assessment.barrelRate < 20) {
        weaknesses.push("Barrel rate needs improvement");
        recommendations.push("Focus on contact point and bat path drills");
      }
    }

    // Default recommendations if none generated
    if (recommendations.length === 0) {
      recommendations.push("Continue practicing with model video overlays");
      recommendations.push("Complete the timing test to track cognitive progress");
      recommendations.push("Upload swing videos regularly to track improvement");
    }

    // Check trial eligibility
    const trialEligible = !assessment.user.trialUsed && 
                         (assessment.user.membershipStatus !== 'active' || 
                          assessment.user.membershipTier === 'free');

    // Build report data
    const reportData: ReportData = {
      playerInfo: {
        name: assessment.user.name || 'Athlete',
        age,
        level: assessment.user.level || undefined,
        bats: assessment.user.bats || undefined
      },
      assessmentDate: assessment.testDate?.toISOString() || assessment.createdAt.toISOString(),
      scores: {
        brain: brainScore !== null ? Math.round(brainScore) : null,
        body: bodyScore !== null ? Math.round(bodyScore) : null,
        bat: batScore !== null ? Math.round(batScore) : null,
        ball: ballScore !== null ? Math.round(ballScore) : null,
        overall: overallScore !== null ? Math.round(overallScore) : null
      },
      details: {
        // Cognitive
        timingControl: assessment.timingControlScore || undefined,
        impulseControl: assessment.impulseControlScore || undefined,
        trajectoryPrediction: assessment.trajectoryScore || undefined,
        
        // Biomechanical
        anchor: assessment.anchorScore || undefined,
        engine: assessment.engineScore || undefined,
        whip: assessment.whipScore || undefined,
        
        // Contact
        contactRate: assessment.contactRate || undefined,
        hardContactRate: assessment.hardContactRate || undefined,
        onTimeSwingRate: assessment.onTimeSwingRate || undefined,
        
        // Ball Flight
        exitVelocity: assessment.exitVelocityAvg || undefined,
        launchAngle: assessment.launchAngleAvg || undefined,
        distance: assessment.ballFlightDistance || undefined,
        ballScore: assessment.ballScoreComposite || undefined
      },
      strengths,
      weaknesses,
      recommendations,
      trialEligible,
      trialTier: 'athlete' // Default trial tier
    };

    // Update assessment to mark report as generated
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        reportGenerated: true,
        reportData: reportData as any,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      report: reportData
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
