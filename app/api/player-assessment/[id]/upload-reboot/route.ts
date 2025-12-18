import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/s3';
import type { RebootMotionFile } from '@/types/player-assessment';

export const dynamic = 'force-dynamic';

/**
 * POST /api/player-assessment/[id]/upload-reboot
 * Upload Reboot Motion files to an assessment (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'player';
    const isAdmin = userRole === 'admin' || userRole === 'coach';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const assessmentId = params.id;
    const userId = (session.user as any).id;

    // Get the assessment
    const assessment = await prisma.playerAssessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const rebootDerivedConfidence = formData.get('rebootDerivedConfidence') as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ['csv', 'json', 'pdf'];
    const uploadedFiles: RebootMotionFile[] = [];

    for (const file of files) {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      
      if (!fileType || !allowedTypes.includes(fileType)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Allowed: csv, json, pdf` },
          { status: 400 }
        );
      }

      // Read file buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Upload to S3
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const s3Key = `reboot-motion/${assessmentId}/${timestamp}_${sanitizedName}`;
      
      await uploadFile(buffer, s3Key, file.type);

      // Create file reference
      const fileRef: RebootMotionFile = {
        fileName: file.name,
        fileUrl: s3Key,
        fileType: fileType as 'csv' | 'json' | 'pdf',
        uploadedAt: new Date().toISOString(),
      };

      uploadedFiles.push(fileRef);
    }

    // Get existing files
    const existingFiles = (assessment.rebootMotionFiles as RebootMotionFile[]) || [];
    const updatedFiles = [...existingFiles, ...uploadedFiles];

    // Update assessment with new files
    const updateData: any = {
      rebootMotionFiles: updatedFiles,
      updatedAt: new Date(),
    };

    // Add reboot confidence if provided
    if (rebootDerivedConfidence) {
      const confidence = parseFloat(rebootDerivedConfidence);
      if (!isNaN(confidence) && confidence >= 0 && confidence <= 100) {
        updateData.rebootDerivedIdentityConfidence = confidence;
      }
    }

    const updatedAssessment = await prisma.playerAssessment.update({
      where: { id: assessmentId },
      data: updateData,
    });

    // Create history entry
    await prisma.assessmentHistory.create({
      data: {
        assessmentId,
        changedBy: userId,
        changeType: 'reboot_files_uploaded',
        previousValues: {
          fileCount: existingFiles.length,
        },
        newValues: {
          fileCount: updatedFiles.length,
          newFiles: uploadedFiles.map(f => f.fileName),
          rebootDerivedIdentityConfidence: updateData.rebootDerivedIdentityConfidence,
        },
        notes: `Uploaded ${uploadedFiles.length} Reboot Motion file(s)`,
      },
    });

    return NextResponse.json({
      success: true,
      uploadedFiles,
      assessment: updatedAssessment,
    });
  } catch (error) {
    console.error('Error uploading Reboot files:', error);
    return NextResponse.json(
      { error: 'Failed to upload Reboot files' },
      { status: 500 }
    );
  }
}
