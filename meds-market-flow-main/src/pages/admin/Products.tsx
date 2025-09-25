import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, Search, Store, Calendar, AlertTriangle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  expiry_date?: string;
  created_at: string;
  pharmacy: {
    name: string;
  };
}

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          pharmacy:pharmacies(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];

  const getCategoryBadge = (category: string) => {
    const colors = {
      'pain-relief': 'bg-red-100 text-red-800',
      'antibiotics': 'bg-blue-100 text-blue-800',
      'vitamins': 'bg-green-100 text-green-800',
      'cold-flu': 'bg-purple-100 text-purple-800',
      'skin-care': 'bg-pink-100 text-pink-800',
      'digestive': 'bg-yellow-100 text-yellow-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge 
        variant="secondary" 
        className={colors[category as keyof typeof colors] || colors.other}
      >
        {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysDiff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30;
  };

  if (loading) {
    return (
      <DashboardLayout requiredRole="admin">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Product Overview</h1>
          <p className="text-muted-foreground">Monitor platform product catalog</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Products
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Input
              placeholder="Search by name, brand, or pharmacy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 max-w-md"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      {!product.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>

                    {product.brand && (
                      <p className="text-sm text-muted-foreground">Brand: {product.brand}</p>
                    )}

                    <div className="flex items-center gap-4">
                      {getCategoryBadge(product.category)}
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Store className="h-4 w-4" />
                        {product.pharmacy.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-medium">₦{product.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stock</p>
                        <p className={`font-medium ${product.stock_quantity === 0 ? 'text-red-600' : ''}`}>
                          {product.stock_quantity} units
                        </p>
                      </div>
                      {product.expiry_date && (
                        <div>
                          <p className="text-muted-foreground">Expiry Date</p>
                          <div className="flex items-center gap-1">
                            {isExpiringSoon(product.expiry_date) && (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                            <p className={`font-medium ${isExpiringSoon(product.expiry_date) ? 'text-orange-600' : ''}`}>
                              {new Date(product.expiry_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Added</p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(product.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredProducts.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Products Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'No products match your search criteria.' 
                    : 'No products in the catalog yet.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminProducts;