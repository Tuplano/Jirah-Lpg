import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const utcDate = new Date(body.date).toISOString();

    const { data, error } = await supabase.from('sales').insert([
      {
        date: utcDate, 
        customer_name: body.customer_name,
        tank_size: body.tank_size,
        quantity: body.quantity,
        amount: body.amount,
      },
    ]);

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
