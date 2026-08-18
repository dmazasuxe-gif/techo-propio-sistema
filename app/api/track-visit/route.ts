import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    // Generate a simple session id based on IP/UserAgent (very basic, don't use real IP for simplicity in Vercel edge without req.ip)
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    await supabase.from('landing_traffic').insert([
      { 
        path: body.path || '/', 
        user_agent: userAgent, 
        event_type: body.eventType || 'pageview',
        session_id: sessionId
      }
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
