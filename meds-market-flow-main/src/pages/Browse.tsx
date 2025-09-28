
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, ShoppingCart, Package, Star, Heart, Eye, Info, AlertTriangle, Thermometer, Factory } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  dosage: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  pharmacy: {
    id: string;
    name: string;
    verification_status: string;
  };
}

const Browse = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          pharmacy:pharmacies(id, name, verification_status)
        `)
        .eq('is_active', true)
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
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'otc', 'supplements', 'cosmetics', 'medical_devices'];

  if (loading) {
    return (
      <DashboardLayout>
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
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Browse Medications</h1>
          <p className="text-muted-foreground">Find the medications you need from verified pharmacies</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medications, brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : 
                   category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No products are currently available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Featured Products Carousel */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Featured Products</h2>
              </div>
              
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full relative"
              >
                <CarouselContent className="-ml-2 md:-ml-3">
                  {filteredProducts.slice(0, 6).map((product) => (
                    <CarouselItem key={product.id} className="pl-2 md:pl-3 basis-1/2 sm:basis-1/3 lg:basis-1/4">
                      <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
                        {/* Product Image Section */}
                        <div className="relative h-32 bg-gradient-to-br from-cyan-100 to-blue-100 overflow-hidden">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-10 w-10 text-cyan-400" />
                            </div>
                          )}
                          
                          {/* Overlay Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            <Badge className="bg-cyan-600 text-white text-xs shadow-lg">
                              {product.category?.toUpperCase() || 'OTC'}
                            </Badge>
                            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                              <Badge variant="destructive" className="text-xs px-1 py-0">
                                Low Stock
                              </Badge>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button size="sm" variant="secondary" className="h-6 w-6 p-0 rounded-full shadow-lg">
                              <Heart className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="secondary" className="h-6 w-6 p-0 rounded-full shadow-lg">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <CardContent className="p-3 space-y-2">
                          {/* Product Info */}
                          <div className="space-y-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-cyan-600 transition-colors">
                                  {product.name}
                                </CardTitle>
                                <p className="text-xs text-cyan-600 font-medium truncate">{product.brand}</p>
                              </div>
                              <div className="flex items-center gap-1 ml-1 flex-shrink-0">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium">4.8</span>
                              </div>
                            </div>
                            
                            {product.dosage && (
                              <p className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full inline-block">
                                {product.dosage}
                              </p>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>

                          {/* Product Details Accordion */}
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value={`details-${product.id}`} className="border-0">
                              <AccordionTrigger className="py-1 px-2 hover:bg-gray-50 rounded text-xs text-cyan-600 hover:text-cyan-700">
                                <div className="flex items-center gap-1">
                                  <Info className="h-3 w-3" />
                                  More Info
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-2 pb-2">
                                <div className="space-y-2 text-xs">
                                  {product.dosage && (
                                    <div className="flex items-start gap-2">
                                      <Package className="h-3 w-3 text-cyan-500 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="font-medium text-gray-700">Dosage:</p>
                                        <p className="text-gray-600">{product.dosage}</p>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="font-medium text-gray-700">Important:</p>
                                      <p className="text-gray-600">Consult your healthcare provider before use. Keep out of reach of children.</p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-2">
                                    <Thermometer className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="font-medium text-gray-700">Storage:</p>
                                      <p className="text-gray-600">Store in a cool, dry place away from direct sunlight.</p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-2">
                                    <Factory className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="font-medium text-gray-700">Manufacturer:</p>
                                      <p className="text-gray-600">{product.brand || 'Not specified'}</p>
                                    </div>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>

                          {/* Price and Stock */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-bold text-cyan-600">₦{product.price.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">
                                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium text-gray-700 truncate max-w-20">{product.pharmacy.name}</p>
                              <Badge 
                                variant={product.pharmacy.verification_status === 'approved' ? "default" : "outline"}
                                className={`text-xs px-1 py-0 ${
                                  product.pharmacy.verification_status === 'approved' 
                                    ? 'bg-green-100 text-green-700 border-green-200' 
                                    : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                }`}
                              >
                                {product.pharmacy.verification_status}
                              </Badge>
                            </div>
                          </div>

                          {/* Add to Cart Button */}
                          <Button 
                            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium py-2 text-xs rounded-lg shadow-md hover:shadow-lg transition-all duration-300" 
                            disabled={product.stock_quantity <= 0}
                            onClick={() => {
                              addToCart({
                                product_id: product.id,
                                name: product.name,
                                price: product.price,
                                pharmacy_name: product.pharmacy.name,
                                pharmacy_id: product.pharmacy.id
                              });
                              toast({ 
                                title: "Added to cart!", 
                                description: `${product.name} has been added to your cart.`
                              });
                            }}
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            {product.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                          </Button>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute -left-8 top-1/2 -translate-y-1/2 h-8 w-8" />
                <CarouselNext className="absolute -right-8 top-1/2 -translate-y-1/2 h-8 w-8" />
              </Carousel>
            </div>

            {/* All Products Grid */}
            {filteredProducts.length > 6 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">All Products</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {filteredProducts.slice(6).map((product) => (
                    <Card key={product.id} className="group relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
                      {/* Product Image Section */}
                      <div className="relative h-28 bg-gradient-to-br from-cyan-100 to-blue-100 overflow-hidden">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-cyan-400" />
                          </div>
                        )}
                        
                        {/* Overlay Badge */}
                        <div className="absolute top-1 left-1">
                          <Badge className="bg-cyan-600 text-white text-xs px-1 py-0 shadow-lg">
                            {product.category?.toUpperCase() || 'OTC'}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-2 space-y-2">
                        {/* Product Info */}
                        <div>
                          <CardTitle className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-cyan-600 transition-colors leading-tight">
                            {product.name}
                          </CardTitle>
                          <p className="text-xs text-cyan-600 font-medium truncate">{product.brand}</p>
                        </div>

                        {/* Product Details Accordion */}
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value={`grid-details-${product.id}`} className="border-0">
                            <AccordionTrigger className="py-0.5 px-1 hover:bg-gray-50 rounded text-xs text-cyan-600 hover:text-cyan-700">
                              <div className="flex items-center gap-1">
                                <Info className="h-2.5 w-2.5" />
                                More Info
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-1 pb-1">
                              <div className="space-y-1.5 text-xs">
                                {product.dosage && (
                                  <div className="flex items-start gap-1.5">
                                    <Package className="h-2.5 w-2.5 text-cyan-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="font-medium text-gray-700">Dosage:</p>
                                      <p className="text-gray-600">{product.dosage}</p>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-start gap-1.5">
                                  <AlertTriangle className="h-2.5 w-2.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="font-medium text-gray-700">Important:</p>
                                    <p className="text-gray-600">Consult healthcare provider before use.</p>
                                  </div>
                                </div>

                                <div className="flex items-start gap-1.5">
                                  <Thermometer className="h-2.5 w-2.5 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="font-medium text-gray-700">Storage:</p>
                                    <p className="text-gray-600">Cool, dry place away from sunlight.</p>
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        {/* Price and Stock */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-cyan-600">₦{product.price.toLocaleString()}</p>
                            <Badge 
                              variant={product.pharmacy.verification_status === 'approved' ? "default" : "outline"}
                              className={`text-xs px-1 py-0 ${
                                product.pharmacy.verification_status === 'approved' 
                                  ? 'bg-green-100 text-green-700 border-green-200' 
                                  : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              }`}
                            >
                              {product.pharmacy.verification_status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                          </p>
                        </div>

                        {/* Add to Cart Button */}
                        <Button 
                          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium py-1.5 text-xs rounded-md shadow-sm hover:shadow-md transition-all duration-300" 
                          disabled={product.stock_quantity <= 0}
                          onClick={() => {
                            addToCart({
                              product_id: product.id,
                              name: product.name,
                              price: product.price,
                              pharmacy_name: product.pharmacy.name,
                              pharmacy_id: product.pharmacy.id
                            });
                            toast({ 
                              title: "Added to cart!", 
                              description: `${product.name} has been added to your cart.`
                            });
                          }}
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          {product.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Browse;
