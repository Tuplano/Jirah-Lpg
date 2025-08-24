import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server'; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, type, tank_size, quantity, customer_name } = body;

    const utcDate = new Date(date).toISOString();

    const { data, error } = await supabase.from('inventory_movements').insert([
      {
        date: utcDate,
        type,
        tank_size,
        quantity,
        customer_name: customer_name || null,
      },
    ]);

    if (error) throw error;

    if (type === 'add_stock') {
      const { data: existingTank, error: fetchError } = await supabase
        .from('tanks')
        .select('quantity')
        .eq('size', tank_size)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError; 
      }

      const newQuantity = existingTank ? existingTank.quantity + quantity : quantity;

      const { error: tankError } = await supabase
        .from('tanks')
        .upsert(
          {
            size: tank_size,
            quantity: newQuantity,
            date: utcDate,
          },
          { onConflict: 'size' }
        );

      if (tankError) throw tankError;
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
