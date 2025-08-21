export interface Tank {
  id: string;
  size: string; 
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  date: string;
  type: 'replenishment' | 'out_for_delivery' | 'add_stock';
  tank_size: string;
  quantity: number;
  customer_name?: string;
  created_at: string;
}

export interface Sale {
  id: string;
  date: string;
  customer_name?: string;
  tank_size: string;
  quantity: number;
  amount: number;
  created_at: string;
}

export interface InventorySummary {
  size: string;
  full_tanks: number;
  empty_tanks: number;
  out_for_delivery: number;
  total_tanks: number;
}