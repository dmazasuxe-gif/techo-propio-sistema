import { NextResponse } from 'next/server';
import { asignarBeneficiarioAMaestro } from '@/lib/ai-tools';

export async function GET(req: Request) {
  try {
    const res = await asignarBeneficiarioAMaestro.execute({
      beneficiario: "Yoar Daniel Maza Suxe",
      maestro: "Daniel Maza Suxe"
    });
    return NextResponse.json({ success: true, result: res });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack });
  }
}
