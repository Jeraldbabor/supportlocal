import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Package, Save, ShoppingBag, Truck, User } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    product_sku: string;
    quantity: number;
    price: number | null;
    subtotal: number | null;
    product: {
        id: number;
        name: string;
        primary_image: string | null;
    } | null;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    status_label: string;
    status_color: string;
    shipping_name: string;
    shipping_email: string;
    shipping_phone: string;
    shipping_address: string;
    delivery_address: string;
    delivery_phone: string;
    delivery_notes: string | null;
    payment_method: string;
    gcash_number: string | null;
    gcash_reference: string | null;
    special_instructions: string | null;
    subtotal: number | null;
    shipping_fee: number | null;
    total_amount: number | null;
    rejection_reason: string | null;
    buyer: {
        id: number;
        name: string;
        email: string;
        phone_number: string | null;
        avatar_url: string;
    } | null;
    seller: {
        id: number;
        name: string;
        email: string;
        phone_number: string | null;
    } | null;
    items: OrderItem[];
    created_at: string;
    seller_confirmed_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    completed_at: string | null;
}

interface Props {
    order: Order;
    statuses: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Orders', href: '/admin/orders' },
    { title: 'Order Details', href: '#' },
];

export default function OrderShow() {
    const { order, statuses } = usePage<SharedData & Props>().props;
    const [selectedStatus, setSelectedStatus] = useState(order.status);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStatusUpdate = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post(
            `/admin/orders/${order.id}/update-status`,
            { status: selectedStatus },
            {
                preserveScroll: true,
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
            case 'delivered':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'shipped':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'confirmed':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order: ${order.order_number}`} />

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/admin/orders">
                        <Button variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Orders
                        </Button>
                    </Link>
                    <Badge className={getStatusColor(order.status)}>{order.status_label}</Badge>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Order Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Items</CardTitle>
                                <CardDescription>Order #{order.order_number}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                                            {item.product?.primary_image ? (
                                                <img
                                                    src={item.product.primary_image}
                                                    alt={item.product_name}
                                                    className="h-16 w-16 rounded-lg object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = '/placeholder.jpg';
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                                    <Package className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="font-medium">{item.product_name}</div>
                                                <div className="text-sm text-muted-foreground">SKU: {item.product_sku}</div>
                                                <div className="text-sm text-muted-foreground">Quantity: {item.quantity}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">₱{(item.price || 0).toLocaleString()}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Subtotal: ₱{(item.subtotal || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Shipping Name</div>
                                        <div className="mt-1">{order.shipping_name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Shipping Email</div>
                                        <div className="mt-1">{order.shipping_email}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Shipping Phone</div>
                                        <div className="mt-1">{order.shipping_phone}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Delivery Phone</div>
                                        <div className="mt-1">{order.delivery_phone || 'N/A'}</div>
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Shipping Address</div>
                                    <div className="mt-1">{order.shipping_address}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Delivery Address</div>
                                    <div className="mt-1">{order.delivery_address}</div>
                                </div>
                                {order.delivery_notes && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Delivery Notes</div>
                                        <div className="mt-1">{order.delivery_notes}</div>
                                    </div>
                                )}
                                {order.special_instructions && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Special Instructions</div>
                                        <div className="mt-1">{order.special_instructions}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Payment Method</div>
                                    <div className="mt-1 capitalize">{order.payment_method}</div>
                                </div>
                                {order.payment_method === 'gcash' && (
                                    <>
                                        {order.gcash_number && (
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">GCash Number</div>
                                                <div className="mt-1">{order.gcash_number}</div>
                                            </div>
                                        )}
                                        {order.gcash_reference && (
                                            <div>
                                                <div className="text-sm font-medium text-muted-foreground">GCash Reference</div>
                                                <div className="mt-1">{order.gcash_reference}</div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">₱{(order.subtotal || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Shipping Fee</span>
                                        <span className="font-medium">₱{(order.shipping_fee || 0).toLocaleString()}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>₱{(order.total_amount || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Update Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Update Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleStatusUpdate} className="space-y-4">
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(statuses).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button type="submit" disabled={isSubmitting} className="w-full">
                                        <Save className="mr-2 h-4 w-4" />
                                        {isSubmitting ? 'Updating...' : 'Update Status'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Buyer Information */}
                        {order.buyer && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Buyer Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={order.buyer.avatar_url}
                                                alt={order.buyer.name}
                                                className="h-10 w-10 rounded-full"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(order.buyer.name)}&color=7F9CF5&background=EBF4FF`;
                                                }}
                                            />
                                            <div>
                                                <div className="font-medium">{order.buyer.name}</div>
                                                <div className="text-sm text-muted-foreground">{order.buyer.email}</div>
                                            </div>
                                        </div>
                                        <Link href={`/admin/users/${order.buyer.id}`}>
                                            <Button variant="outline" size="sm" className="w-full">
                                                <User className="mr-2 h-4 w-4" />
                                                View Buyer Profile
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Seller Information */}
                        {order.seller && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Seller Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="font-medium">{order.seller.name}</div>
                                            <div className="text-sm text-muted-foreground">{order.seller.email}</div>
                                        </div>
                                        <Link href={`/admin/users/${order.seller.id}`}>
                                            <Button variant="outline" size="sm" className="w-full">
                                                <User className="mr-2 h-4 w-4" />
                                                View Seller Profile
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Created:</span>
                                    <span>{new Date(order.created_at).toLocaleString()}</span>
                                </div>
                                {order.seller_confirmed_at && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Truck className="h-4 w-4 text-green-600" />
                                        <span className="text-muted-foreground">Confirmed:</span>
                                        <span>{new Date(order.seller_confirmed_at).toLocaleString()}</span>
                                    </div>
                                )}
                                {order.shipped_at && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Truck className="h-4 w-4 text-blue-600" />
                                        <span className="text-muted-foreground">Shipped:</span>
                                        <span>{new Date(order.shipped_at).toLocaleString()}</span>
                                    </div>
                                )}
                                {order.delivered_at && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Truck className="h-4 w-4 text-green-600" />
                                        <span className="text-muted-foreground">Delivered:</span>
                                        <span>{new Date(order.delivered_at).toLocaleString()}</span>
                                    </div>
                                )}
                                {order.completed_at && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <ShoppingBag className="h-4 w-4 text-green-600" />
                                        <span className="text-muted-foreground">Completed:</span>
                                        <span>{new Date(order.completed_at).toLocaleString()}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
