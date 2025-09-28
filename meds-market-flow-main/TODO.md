# Delivery System Extension Task

## Steps to Complete

- [x] Create AdminDeliveries.tsx page with deliveries list, filters, and actions
- [x] Add /admin/deliveries route to App.tsx
- [x] Update AdminDashboard.tsx to include deliveries stats and quick action link
- [x] Update AdminPharmacies.tsx to add deliveries section/link for each pharmacy
- [x] Update AdminOrders.tsx to add delivery status/info for each order
- [x] Update AdminUsers.tsx to add deliveries assigned to each user (delivery agents)
- [x] Add 'delivery_agent' to app_role enum in types.ts
- [x] Update useAuth.tsx to handle role in signUp
- [x] Update Auth.tsx to include role selection in sign up
- [x] Update pharmacy Orders.tsx to show delivery info and confirm handover
- [x] Update customer Orders.tsx to show delivery info
- [x] Create DeliveryDashboard.tsx for delivery agents to manage their assigned deliveries
- [x] Add /delivery/dashboard route to App.tsx
- [x] Update DashboardLayout to support delivery_agent role
- [x] Update AppSidebar to include delivery agent navigation
- [x] Update useUserRole to handle delivery_agent role
