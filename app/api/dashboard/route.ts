import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Tanks
    const { data: tanksData, error: tanksError } = await supabase
      .from("tanks")
      .select("*");
    if (tanksError) throw tanksError;

    const { data: movementsData, error: movementsError } = await supabase
      .from("inventory_movements")
      .select("*");
    if (movementsError) throw movementsError;

    const { data: salesData, error: salesError } = await supabase
      .from("sales")
      .select("*");
    if (salesError) throw salesError;

    const summary = tanksData.map((tank) => {
      const deliveries = movementsData
        .filter((m) => m.type === "delivery" && m.tank_size === tank.size)
        .reduce((sum, m) => sum + (m.quantity || 0), 0);

      const sold = movementsData
        .filter((m) => m.type === "sale" && m.tank_size === tank.size)
        .reduce((sum, m) => sum + (m.quantity || 0), 0);

      const total = tank.quantity || 0;
      const empty = sold;
      const out_for_delivery = deliveries;
      const full = Math.max(total - empty - out_for_delivery, 0);

      return {
        size: tank.size,
        total_tanks: total,
        full_tanks: full,
        out_for_delivery,
        empty_tanks: empty,
        quantity: total,
      };
    });

    return NextResponse.json({
      inventory: summary,
      movements: movementsData.slice(0, 10).reverse(),
      sales: salesData.slice(0, 10).reverse(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
