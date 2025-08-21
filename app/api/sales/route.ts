import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data, error } = await supabase.from('sales').insert([
      {
        date: body.date,
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
  }
}
