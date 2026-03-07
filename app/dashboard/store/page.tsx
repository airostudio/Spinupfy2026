'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package, ShoppingCart, DollarSign, TrendingUp, Plus, Edit, Trash2,
  Eye, Search, Filter, MoreVertical, Check, X, Truck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Store {
  id: string;
  storeName: string;
  stripeAccountId?: string;
  stripeChargesEnabled: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  inventoryQuantity: number;
  status: string;
  featured: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
}

interface Stats {
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  pendingOrders: number;
}

export default function StoreDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStoreData();
  }, []);

  async function loadStoreData() {
    try {
      // Load store
      const storeRes = await fetch('/api/store/setup');
      const storeData = await storeRes.json();

      if (storeData.success && storeData.data) {
        setStore(storeData.data);
        await Promise.all([
          loadProducts(storeData.data.id),
          loadOrders(storeData.data.id),
          loadStats(storeData.data.id),
        ]);
      }
    } catch (error) {
      console.error('Error loading store data:', error);
      toast.error('Failed to load store data');
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts(storeId: string) {
    try {
      const response = await fetch(`/api/store/products?storeId=${storeId}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          inventoryQuantity: p.inventory_quantity,
          status: p.status,
          featured: p.featured,
        })));
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  async function loadOrders(storeId: string) {
    try {
      const response = await fetch(`/api/store/orders?storeId=${storeId}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data.map((o: any) => ({
          id: o.id,
          orderNumber: o.order_number,
          customerName: o.customer_name,
          total: o.total,
          paymentStatus: o.payment_status,
          fulfillmentStatus: o.fulfillment_status,
          createdAt: o.created_at,
        })));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }

  async function loadStats(storeId: string) {
    try {
      const response = await fetch(`/api/store/stats?storeId=${storeId}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async function deleteProduct(productId: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/store/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Product deleted');
        loadProducts(store!.id);
      } else {
        toast.error(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  }

  async function updateOrderStatus(orderId: string, fulfillmentStatus: string) {
    try {
      const response = await fetch(`/api/store/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillmentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Order updated');
        loadOrders(store!.id);
      } else {
        toast.error(data.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    o.orderNumber.includes(searchQuery) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Store Found</h1>
          <p className="text-gray-600 mb-6">
            You need to set up a store before you can manage products and orders.
          </p>
          <button
            onClick={() => router.push('/dashboard/store/setup')}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold"
          >
            Set Up Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{store.storeName}</h1>
              <p className="text-gray-600 mt-1">Manage your online store</p>
            </div>

            {activeTab === 'products' && (
              <button
                onClick={() => router.push('/dashboard/store/products/new')}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
              <p className="text-sm opacity-90">Total Products</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <ShoppingCart className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
              <p className="text-sm opacity-90">Total Orders</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-2xl font-bold">${stats.revenue.toFixed(0)}</p>
              <p className="text-sm opacity-90">Total Revenue</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <Truck className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
              <p className="text-sm opacity-90">Pending Orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'products'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'orders'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      {product.featured && (
                        <span className="text-xs text-yellow-600">★ Featured</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`${
                        product.inventoryQuantity > 10 ? 'text-green-600' :
                        product.inventoryQuantity > 0 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {product.inventoryQuantity} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/store/products/${product.id}`)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="p-2 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No products found
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fulfillment</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">#{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{order.customerName}</td>
                    <td className="px-6 py-4 font-medium">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.fulfillmentStatus}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="unfulfilled">Unfulfilled</option>
                        <option value="partial">Partial</option>
                        <option value="fulfilled">Fulfilled</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => router.push(`/dashboard/store/orders/${order.id}`)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No orders found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
