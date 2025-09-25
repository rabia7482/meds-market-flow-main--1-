# Remove Prescription Functionality

## Database Schema Changes
- [x] Update migration file: remove 'prescription' from product_category enum
- [x] Remove requires_prescription from products table
- [x] Remove prescription_required and prescription_verified from orders table
- [x] Remove entire prescriptions table and related triggers/policies

## Type Definitions
- [x] Update types.ts: remove prescriptions table
- [x] Remove prescription fields from orders and products types
- [x] Remove 'prescription' from product_category enum

## Frontend Code Updates
- [x] Update useCart.tsx: remove requires_prescription from cart item interface
- [x] Update Cart.tsx: remove prescription checks, badges, warnings
- [x] Update Browse.tsx: remove 'prescription' from categories, remove Rx badges
- [x] Update Orders.tsx: remove prescription status displays
- [x] Update pharmacy/Orders.tsx: remove prescription verification logic
- [x] Update pharmacy/Dashboard.tsx: remove prescription orders count
- [x] Update pharmacy/Products.tsx: remove requires_prescription field and switch
- [x] Update admin/Orders.tsx: remove prescription badges
- [x] Update admin/Products.tsx: remove prescription required badges
- [x] Update Index.tsx: remove prescription upload mention

## Testing
- [x] Verify app builds without errors
- [ ] Test cart and checkout flow
- [ ] Test product browsing and filtering
