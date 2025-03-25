// src/app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { documentRepository } from '@/lib/db/documents';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/session';

export async function POST(request: NextRequest) {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  try {
    const { name, path, mimeType, size, projectId } = await request.json();

    if (!name || !path || !mimeType || !size || !projectId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create document record in database
    const document = await documentRepository.create({
      name,
      path,
      mimeType,
      size,
      projectId,
    });

    // Revalidate the project page
    revalidatePath(`/projects/${projectId}`);

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Document creation error:', error);
    return NextResponse.json(
      { error: 'Failed to store document' },
      { status: 500 }
    );
  }
}