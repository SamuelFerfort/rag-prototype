// src/app/api/blob/upload/route.ts
import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/session';

export async function POST(request: Request): Promise<NextResponse> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
        // Parse the client payload if it's a string
        let parsedPayload = null;
        try {
          parsedPayload = clientPayload ? JSON.parse(clientPayload) : null;
        } catch (e) {
          console.error('Error parsing client payload:', e);
        }
        
        const projectId = parsedPayload?.projectId;
        
        if (!projectId) {
          throw new Error('Missing project ID in client payload');
        }
        
        // Return the correct type
        return {
          allowedContentTypes: [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain',
            'text/markdown',
          ],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB max file size
          // This must be a string, not an object
          tokenPayload: JSON.stringify({
            userId,
            projectId,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Parse the token payload
        let parsedPayload = null;
        try {
          parsedPayload = tokenPayload ? JSON.parse(tokenPayload) : null;
        } catch (e) {
          console.error('Error parsing token payload:', e);
        }
        
        console.log('Upload completed:', blob.url, parsedPayload);
        
        // Here you could update your database or trigger additional processing
        // Note: This won't work locally, so implement the database update in
        // the client-side code too, as we did in the DocumentUploader component
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
}