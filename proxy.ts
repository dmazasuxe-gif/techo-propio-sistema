import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic in-memory rate limiting map
// This works per-instance. For serverless it's a best-effort rate limiter.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60;

export function proxy(request: NextRequest) {
  // Solo aplicar rate limiting a las rutas de API
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Intentar obtener la IP del usuario
    let ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for') ?? 'unknown-ip';
    
    // Si la IP viene como lista (x-forwarded-for puede ser una lista), tomar la primera
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }

    const now = Date.now();
    const rateLimitData = rateLimitMap.get(ip);

    if (rateLimitData) {
      // Si ya pasó la ventana de tiempo, resetear el conteo
      if (now - rateLimitData.lastReset > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(ip, { count: 1, lastReset: now });
      } else {
        // Incrementar el conteo
        rateLimitData.count += 1;
        
        if (rateLimitData.count > MAX_REQUESTS_PER_WINDOW) {
          console.warn(`Rate limit excedido para IP: ${ip}`);
          return new NextResponse(
            JSON.stringify({ error: "Demasiadas peticiones. Por favor, intenta de nuevo más tarde." }),
            { 
              status: 429, 
              headers: { 
                'Content-Type': 'application/json',
                'Retry-After': Math.ceil((RATE_LIMIT_WINDOW_MS - (now - rateLimitData.lastReset)) / 1000).toString()
              } 
            }
          );
        }
      }
    } else {
      // Primera vez que se ve esta IP
      rateLimitMap.set(ip, { count: 1, lastReset: now });
    }

    // Para evitar que el Map crezca indefinidamente en memoria (Memory leak en servidores persistentes)
    // Limpiamos si crece demasiado.
    if (Math.random() < 0.1 && rateLimitMap.size > 10000) {
      const expirationTime = now - RATE_LIMIT_WINDOW_MS;
      for (const [key, data] of rateLimitMap.entries()) {
        if (data.lastReset < expirationTime) {
          rateLimitMap.delete(key);
        }
      }
    }
  }

  return NextResponse.next();
}

// Configurar sobre qué rutas se ejecuta el middleware
export const config = {
  matcher: '/api/:path*',
};
