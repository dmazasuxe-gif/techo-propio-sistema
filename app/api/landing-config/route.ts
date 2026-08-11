import { NextResponse } from 'next/server';
import { getLandingConfig, updateLandingConfig } from '@/lib/landing_db';

export async function GET() {
  try {
    const config = await getLandingConfig();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = await updateLandingConfig(body);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
