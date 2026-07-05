import { z } from 'zod';

export const campaignFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  starts_at: z.string().optional().refine((val) => {
    if (!val) return true;
    return new Date(val) >= new Date(new Date().toDateString());
  }, { message: 'Start date must be today or later' }),
  ends_at: z.string().optional().refine((val) => {
    if (!val) return true;
    return new Date(val) >= new Date(new Date().toDateString());
  }, { message: 'End date must be today or later' }),
});

export const offerSchema = z.object({
  type: z.enum(['product_percent_discount', 'cart_fixed_discount', 'sticker_earn']),
  parameters: z.record(z.any()),
});

export const productPercentOfferParams = z.object({
  percent: z.coerce.number().int().min(1).max(100, 'Percent must be between 1 and 100'),
  applies_to: z.string().optional(),
});

export const cartFixedOfferParams = z.object({
  amount_off: z.coerce.number().positive('Amount must be positive'),
  min_basket: z.coerce.number().positive('Min basket is required').optional(),
});

export const stickerOfferParams = z.object({
  stickers: z.coerce.number().int().positive('Stickers must be a positive number'),
  per_amount: z.coerce.number().positive().optional(),
});
