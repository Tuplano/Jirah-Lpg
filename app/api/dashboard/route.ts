import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const dateQuery = url.searchParams.get("date");
    const selectedDate = dateQuery || new Date().toISOString().split("T")[0];

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
      const deliveriesOnDate = movementsData
        .filter(
          (m) =>
            m.type === "delivery" &&
            m.tank_size === tank.size &&
            m.date?.slice(0, 10) === selectedDate
        )
        .reduce((sum, m) => sum + (m.quantity || 0), 0);

      const cumulativeSold = movementsData
        .filter(
          (m) =>
            m.type === "sale" &&
            m.tank_size === tank.size &&
            m.date && new Date(m.date) <= new Date(selectedDate + "T23:59:59")
        )
        .reduce((sum, m) => sum + (m.quantity || 0), 0);

      const replenished = movementsData
        .filter(
          (m) =>
            m.type === "replenishment" &&
            m.tank_size === tank.size &&
            m.date && new Date(m.date) <= new Date(selectedDate + "T23:59:59")
        )
        .reduce((sum, m) => sum + (m.quantity || 0), 0);

      const empty = Math.max(cumulativeSold - replenished, 0);
      const total = tank.quantity || 0;
      const full = Math.max(total - empty - deliveriesOnDate, 0);

      return {
        size: tank.size,
        total_tanks: total,
        full_tanks: full,
        out_for_delivery: deliveriesOnDate,
        empty_tanks: empty,
        quantity: total,
      };
    });

    const filteredMovements = movementsData
      .filter((m) => m.date && new Date(m.date) <= new Date(selectedDate + "T23:59:59"))
      .slice(0, 10)
      .reverse();

    const filteredSales = salesData
      .filter((s) => s.date?.slice(0, 10) === selectedDate)
      .slice(0, 10)
      .reverse();

    return NextResponse.json({
      inventory: summary,
      movements: filteredMovements,
      sales: filteredSales,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
