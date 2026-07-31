-- Add EFRIS (Electronic Fiscal Receipting and Invoicing Solution) fields to sales
ALTER TABLE public.sales
ADD COLUMN efris_fdn TEXT,
ADD COLUMN efris_receipt_url TEXT,
ADD COLUMN efris_sync_status TEXT DEFAULT 'pending' CHECK (efris_sync_status IN ('pending', 'synced', 'failed'));

-- Add index for quick lookups by FDN
CREATE INDEX idx_sales_efris_fdn ON public.sales(efris_fdn);
