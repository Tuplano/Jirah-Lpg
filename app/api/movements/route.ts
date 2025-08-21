import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server'; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, type, tank_size, quantity, customer_name } = body;

    const { data, error } = await supabase.from('inventory_movements').insert([
      {
        date,
        type,
        tank_size,
        quantity,
        customer_name: customer_name || null,
      },
    ]);

    if (error) throw error;

    if (type === 'add_stock') {
      const { error: tankError } = await supabase.from('tanks').insert(
        [
          {
            size: tank_size,
            quantity,
            date,
          },
        ],
      );

      if (tankError) throw tankError;
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
