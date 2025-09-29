import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bike, Search, TimerReset, CheckCircle2, Navigation, Phone, Package, MapPin } from 'lucide-react';

type OrderStatus = 'pending_pickup' | 'in_transit' | 'delivered' | 'cancelled';

interface PartnerOrder {
  id: string;
  code: string;
  patientName: string;
  phone: string;
  address: string;
  pharmacy: string;
  itemsCount: number;
  amount: number;
  status: OrderStatus;
  eta: string;
}

const STATIC_ORDERS: PartnerOrder[] = [
  {
    id: '1',
    code: 'ORD-240921-001',
    patientName: 'Ada Obi',
    phone: '0803 111 2233',
    address: '12 Allen Avenue, Ikeja, Lagos',
    pharmacy: 'HealthPlus Ikeja',
    itemsCount: 3,
    amount: 18500,
    status: 'pending_pickup',
    eta: 'Today, 2:30 PM',
  },
  {
    id: '2',
    code: 'ORD-240921-002',
    patientName: 'John Yusuf',
    phone: '0802 555 7788',
    address: '7 Adeola Odeku, VI, Lagos',
    pharmacy: 'MedPlus VI',
    itemsCount: 1,
    amount: 5200,
    status: 'in_transit',
    eta: 'Today, 1:10 PM',
  },
  {
    id: '3',
    code: 'ORD-240921-003',
    patientName: 'Bisi Adebayo',
    phone: '0810 999 1122',
    address: '15 Herbert Macaulay, Yaba, Lagos',
    pharmacy: 'MedsPoint Yaba',
    itemsCount: 2,
    amount: 9800,
    status: 'delivered',
    eta: 'Today, 11:00 AM',
  },
  {
    id: '4',
    code: 'ORD-240921-004',
    patientName: 'Chinedu Okeke',
    phone: '0806 333 4455',
    address: '4 Opebi Road, Ikeja, Lagos',
    pharmacy: 'HealthPlus Opebi',
    itemsCount: 4,
    amount: 24500,
    status: 'pending_pickup',
    eta: 'Today, 3:15 PM',
  },
];

const statusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'pending_pickup':
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending Pickup</Badge>;
    case 'in_transit':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">In Transit</Badge>;
    case 'delivered':
      return <Badge className="bg-green-100 text-green-700 border-green-200">Delivered</Badge>;
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>;
  }
};

const PartnerOrders = () => {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'active' | 'completed'>('active');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = STATIC_ORDERS.filter(o =>
      o.patientName.toLowerCase().includes(q) ||
      o.code.toLowerCase().includes(q) ||
      o.address.toLowerCase().includes(q) ||
      o.pharmacy.toLowerCase().includes(q)
    );
    return list;
  }, [search]);

  const activeOrders = filtered.filter(o => o.status === 'pending_pickup' || o.status === 'in_transit');
  const completedOrders = filtered.filter(o => o.status === 'delivered' || o.status === 'cancelled');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Partner Orders</h1>
            <p className="text-muted-foreground">View and manage deliveries assigned to you</p>
          </div>
          <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 flex items-center gap-1">
            <Bike className="h-4 w-4" /> Online
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by order code, patient, address, or pharmacy" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'active' | 'completed')}>
          <TabsList>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <TimerReset className="h-4 w-4" /> Active
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Pickup</TableHead>
                      <TableHead>Drop-off</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeOrders.map((o) => (
                      <TableRow key={o.id} className="hover:bg-muted/40">
                        <TableCell className="font-medium">{o.code}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{o.patientName}</span>
                            <span className="text-xs text-muted-foreground">{o.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-48">
                          <div className="flex items-start gap-2">
                            <Package className="h-4 w-4 mt-0.5 text-cyan-600" />
                            <span className="text-sm line-clamp-2">{o.pharmacy}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-64">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-cyan-600" />
                            <span className="text-sm line-clamp-2">{o.address}</span>
                          </div>
                        </TableCell>
                        <TableCell>{o.itemsCount}</TableCell>
                        <TableCell>₦{o.amount.toLocaleString()}</TableCell>
                        <TableCell>{statusBadge(o.status)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="secondary" size="sm" className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> Contact</Button>
                          <Button size="sm" className="inline-flex items-center gap-1 bg-cyan-600 hover:bg-cyan-700"><Navigation className="h-3 w-3" /> Navigate</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">{o.code}</TableCell>
                        <TableCell>{o.patientName}</TableCell>
                        <TableCell>₦{o.amount.toLocaleString()}</TableCell>
                        <TableCell>{statusBadge(o.status)}</TableCell>
                        <TableCell>{o.eta}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PartnerOrders;

