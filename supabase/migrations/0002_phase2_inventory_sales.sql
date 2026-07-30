-- 1. Create Enums for Statuses
CREATE TYPE sale_status AS ENUM ('draft', 'completed', 'refunded', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'mobile_money', 'card', 'bank_transfer', 'split');
CREATE TYPE delivery_status AS ENUM ('placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'returned');

-- 2. Customers Table
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    photo_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Product Variants Table
CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT,
    color TEXT,
    sku TEXT UNIQUE,
    stock_qty INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    reorder_threshold INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Sales Table
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    total DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    payment_method payment_method NOT NULL,
    status sale_status NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Sale Items Table
CREATE TABLE public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Stock Adjustments Table
CREATE TABLE public.stock_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
    quantity_delta INTEGER NOT NULL,
    reason TEXT NOT NULL,
    staff_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Delivery Orders Table
CREATE TABLE public.delivery_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    courier_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status delivery_status NOT NULL DEFAULT 'placed',
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    proof_of_delivery_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Enable Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_orders ENABLE ROW LEVEL SECURITY;

-- 10. Customers RLS
CREATE POLICY "Authenticated users can read customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update customers" ON public.customers FOR UPDATE TO authenticated USING (true);

-- 11. Products & Variants RLS
CREATE POLICY "Authenticated users can read products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners and managers can modify products" ON public.products FOR ALL TO authenticated 
  USING ( (SELECT role FROM public.users WHERE id = auth.uid()) IN ('owner', 'manager') );

CREATE POLICY "Authenticated users can read product_variants" ON public.product_variants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners and managers can modify product_variants" ON public.product_variants FOR ALL TO authenticated 
  USING ( (SELECT role FROM public.users WHERE id = auth.uid()) IN ('owner', 'manager') );
CREATE POLICY "Sales staff can update variant stock" ON public.product_variants FOR UPDATE TO authenticated 
  USING ( (SELECT role FROM public.users WHERE id = auth.uid()) IN ('sales', 'owner', 'manager') );

-- 12. Sales & Items RLS
CREATE POLICY "Authenticated users can read sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (auth.uid() = staff_id);
CREATE POLICY "Owners can update sales" ON public.sales FOR UPDATE TO authenticated 
  USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'owner' );

CREATE POLICY "Authenticated users can read sale_items" ON public.sale_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sale_items" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (true);

-- 13. Stock Adjustments RLS
CREATE POLICY "Authenticated users can read stock_adjustments" ON public.stock_adjustments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners and managers can insert stock_adjustments" ON public.stock_adjustments FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = staff_id AND (SELECT role FROM public.users WHERE id = auth.uid()) IN ('owner', 'manager'));

-- 14. Delivery Orders RLS
CREATE POLICY "Authenticated users can read delivery_orders" ON public.delivery_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert delivery_orders" ON public.delivery_orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Delivery, managers, owners can update delivery_orders" ON public.delivery_orders FOR UPDATE TO authenticated 
  USING ( (SELECT role FROM public.users WHERE id = auth.uid()) IN ('owner', 'manager', 'delivery') );

-- 15. Stored Procedure for Atomic Checkout
-- This ensures stock deduction and sale creation happen in a single, safe transaction.
CREATE OR REPLACE FUNCTION public.process_sale(
  p_staff_id UUID,
  p_customer_id UUID,
  p_total DECIMAL,
  p_discount DECIMAL,
  p_payment_method payment_method,
  p_items JSONB -- Array of { variant_id: UUID, quantity: INT, unit_price: DECIMAL }
) RETURNS UUID AS $$
DECLARE
  v_sale_id UUID;
  v_item JSONB;
  v_variant_id UUID;
  v_qty INT;
  v_price DECIMAL;
BEGIN
  -- Create Sale
  INSERT INTO public.sales (staff_id, customer_id, total, discount, payment_method, status)
  VALUES (p_staff_id, p_customer_id, p_total, p_discount, p_payment_method, 'completed')
  RETURNING id INTO v_sale_id;

  -- Process Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := (v_item->>'variant_id')::UUID;
    v_qty := (v_item->>'quantity')::INT;
    v_price := (v_item->>'unit_price')::DECIMAL;

    -- Create Sale Item
    INSERT INTO public.sale_items (sale_id, variant_id, quantity, unit_price)
    VALUES (v_sale_id, v_variant_id, v_qty, v_price);

    -- Deduct Stock (Throws error if negative constraint fails)
    UPDATE public.product_variants
    SET stock_qty = stock_qty - v_qty
    WHERE id = v_variant_id;
  END LOOP;

  RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
