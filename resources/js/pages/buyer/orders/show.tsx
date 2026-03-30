import BuyerLayout from '@/layouts/BuyerLayout';
import Echo from '@/lib/echo';
import { formatPeso } from '@/utils/currency';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Ban, CheckCircle, Clock, CreditCard, MapPin, MessageSquare, Package, Store, Truck, Upload, User, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import StartChatButton from '../../../components/StartChatButton';

interface OrderItem {
    id: number;
    product_name: string;
    product_image: string;
    product_image_url?: string;
    quantity: number;
    price: number;
    total: number;
}

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    payment_method: string;
    payment_status: string;
    payment_proof: string | null;
    payment_proof_url?: string | null;
    payment_verification_notes: string | null;
    delivery_address: string;
    delivery_phone: string;
    delivery_notes: string;
    delivery_method?: string;
    shipping_provider?: string | null;
    tracking_number?: string | null;
    waybill_number?: string | null;
    rejection_reason?: string;
    cancellation_reason?: string | null;
    cancelled_by?: string | null;
    cancelled_at?: string | null;
    created_at: string;
    updated_at: string;
    order_items: OrderItem[];
    seller?: {
        id: number;
        name: string;
        email: string;
        gcash_number?: string | null;
    } | null;
}

interface OrderShowProps {
    order: Order;
}

export default function OrderShow({ order }: OrderShowProps) {
    const { auth } = usePage<{ auth: { user?: { id: number; role: string } } }>().props;
    const userId = auth?.user?.id;
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(order.payment_proof_url || null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        if (!userId || !Echo) return;

        const channel = Echo.private(`App.Models.User.${userId}`);
        let reloadTimeout: ReturnType<typeof setTimeout> | null = null;

        const refreshOrder = () => {
            if (document.hidden) return;
            if (uploading || isCancelling || showCancelModal) return;

            if (reloadTimeout) {
                clearTimeout(reloadTimeout);
            }
            reloadTimeout = setTimeout(() => {
                router.reload({
                    only: ['order'],
                    preserveState: true,
                    preserveScroll: true,
                });
            }, 250);
        };

        const handleEvent = (payload: { order_id?: number; data?: { order_id?: number } }) => {
            const changedOrderId = payload?.order_id ?? payload?.data?.order_id;
            if (changedOrderId && Number(changedOrderId) === Number(order.id)) {
                refreshOrder();
            }
        };

        channel.notification((notification: { order_id?: number }) => {
            handleEvent(notification);
        });

        channel.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (event: { order_id?: number; data?: { order_id?: number } }) => {
            handleEvent(event);
        });

        return () => {
            if (reloadTimeout) {
                clearTimeout(reloadTimeout);
            }
            channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
            Echo?.leave(`private-App.Models.User.${userId}`);
        };
    }, [userId, order.id, uploading, isCancelling, showCancelModal]);

    const handleCancelOrder = () => {
        if (!cancellationReason.trim()) {
            return;
        }
        setIsCancelling(true);
        router.post(
            `/buyer/orders/${order.id}/cancel`,
            { cancellation_reason: cancellationReason },
            {
                preserveState: true,
                onFinish: () => {
                    setIsCancelling(false);
                    setShowCancelModal(false);
                    setCancellationReason('');
                },
            },
        );
    };

    const canCancelOrder = order.status === 'pending';

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setUploadError('Please select an image file.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setUploadError('File size must be less than 5MB.');
                return;
            }
            setSelectedFile(file);
            setUploadError('');
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setUploadError('');
        setUploadSuccess(false);

        try {
            const formData = new FormData();
            formData.append('payment_proof', selectedFile);

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                throw new Error('Security token not found. Please refresh the page.');
            }

            const response = await fetch(`/buyer/orders/${order.id}/upload-payment-proof`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setUploadSuccess(true);
                setSelectedFile(null);
                router.reload();
            } else {
                setUploadError(data.message || 'Failed to upload payment proof.');
            }
        } catch {
            setUploadError('An error occurred while uploading the payment proof.');
        } finally {
            setUploading(false);
        }
    };

    const getStatusIcon = (status: string, size: string = 'h-5 w-5') => {
        switch (status) {
            case 'pending':
                return <Clock className={`${size} text-yellow-500`} />;
            case 'confirmed':
                return <CheckCircle className={`${size} text-amber-600`} />;
            case 'shipped':
                return <Truck className={`${size} text-purple-500`} />;
            case 'delivered':
                return <CheckCircle className={`${size} text-green-500`} />;
            case 'completed':
                return <CheckCircle className={`${size} text-green-500`} />;
            case 'cancelled':
                return <XCircle className={`${size} text-red-500`} />;
            default:
                return <Package className={`${size} text-gray-500`} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed':
                return 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 border-amber-300';
            case 'shipped':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusMessage = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Your order is waiting for seller confirmation.';
            case 'confirmed':
                return 'Your order has been confirmed and is being prepared.';
            case 'shipped':
                return 'Your order has been shipped and is on its way.';
            case 'delivered':
                return 'Your order has been delivered.';
            case 'completed':
                return 'Your order has been completed and delivered.';
            case 'cancelled':
                return 'Your order has been cancelled.';
            default:
                return 'Order status unknown.';
        }
    };

    return (
        <BuyerLayout title={`Order #${order.order_number}`}>
            <Head title={`Order #${order.order_number}`} />

            <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 md:px-6 lg:px-8">
                {/* Back Button */}
                <div className="mb-4">
                    <button
                        onClick={() => router.visit('/buyer/orders')}
                        className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-sm"
                    >
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                        Back to Orders
                    </button>
                </div>

                {/* Order Header */}
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:mb-8 sm:p-5">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg font-bold break-words text-gray-900 sm:text-xl md:text-2xl">Order #{order.order_number}</h1>
                                <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
                                    Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                                </p>
                                {order.updated_at !== order.created_at && (
                                    <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
                                        Last updated: {new Date(order.updated_at).toLocaleDateString()} at{' '}
                                        {new Date(order.updated_at).toLocaleTimeString()}
                                    </p>
                                )}
                            </div>
                            <div className={`flex-shrink-0 rounded-lg border px-2.5 py-1.5 sm:px-3 sm:py-2 ${getStatusColor(order.status)}`}>
                                <div className="flex items-center space-x-1.5 sm:space-x-2">
                                    {getStatusIcon(order.status, 'h-4 w-4 sm:h-5 sm:w-5')}
                                    <span className="text-sm font-semibold sm:text-base md:text-lg">
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-3 sm:flex-col sm:border-t-0 sm:pt-0 sm:text-right">
                            <div className="sm:hidden">
                                <p className="text-xs font-medium text-gray-700">Total Amount</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">{formatPeso(order.total_amount)}</p>
                                <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">{order.payment_method.toUpperCase()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Message */}
                    <div className="mt-3 rounded-lg bg-gray-50 p-2.5 sm:mt-4 sm:p-3">
                        <p className="text-xs text-gray-700 sm:text-sm md:text-base">{getStatusMessage(order.status)}</p>
                    </div>

                    {/* Rejection Reason (by seller) */}
                    {order.status === 'cancelled' && order.rejection_reason && !order.cancellation_reason && (
                        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 sm:mt-4 sm:p-3">
                            <h4 className="mb-1.5 text-xs font-medium text-red-800 sm:text-sm md:text-base">Rejection Reason (by Seller):</h4>
                            <p className="text-xs text-red-700 sm:text-sm md:text-base">{order.rejection_reason}</p>
                        </div>
                    )}

                    {/* Cancellation Reason (by buyer) */}
                    {order.status === 'cancelled' && order.cancellation_reason && (
                        <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-2.5 sm:mt-4 sm:p-3">
                            <h4 className="mb-1.5 text-xs font-medium text-orange-800 sm:text-sm md:text-base">
                                Cancellation Reason {order.cancelled_by === 'buyer' && '(by You)'}:
                            </h4>
                            <p className="text-xs text-orange-700 sm:text-sm md:text-base">{order.cancellation_reason}</p>
                            {order.cancelled_at && (
                                <p className="mt-1 text-xs text-orange-600">
                                    Cancelled on {new Date(order.cancelled_at).toLocaleDateString()} at{' '}
                                    {new Date(order.cancelled_at).toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                    {/* Seller Information */}
                    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
                        <h2 className="mb-3 flex items-center text-sm font-semibold text-gray-900 sm:text-base md:text-lg">
                            <User className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                            Seller Information
                        </h2>
                        <div className="space-y-2.5 sm:space-y-3">
                            <div>
                                <p className="text-xs font-medium text-gray-700 sm:text-sm">Seller Name</p>
                                <p className="text-sm text-gray-900 sm:text-base">{order.seller?.name || 'Unknown Seller'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-700 sm:text-sm">Contact Email</p>
                                <p className="text-sm text-gray-900 sm:text-base">{order.seller?.email || 'Not available'}</p>
                            </div>
                            {order.payment_method === 'gcash' && order.seller?.gcash_number && (
                                <div>
                                    <p className="flex items-center text-xs font-medium text-gray-700 sm:text-sm">
                                        <CreditCard className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        GCash Number
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 sm:text-base">{order.seller.gcash_number}</p>
                                </div>
                            )}
                            {auth?.user && order.seller && auth.user.id !== order.seller.id && (
                                <div className="pt-1.5 sm:pt-2">
                                    <StartChatButton userId={order.seller.id} variant="outline" className="w-full text-xs sm:text-sm">
                                        <MessageSquare className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                                        Contact Seller
                                    </StartChatButton>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
                        <h2 className="mb-3 flex items-center text-sm font-semibold text-gray-900 sm:text-base md:text-lg">
                            {order.delivery_method === 'pickup' ? (
                                <Store className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                            ) : (
                                <MapPin className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                            )}
                            {order.delivery_method === 'pickup' ? 'Pickup Information' : 'Delivery Information'}
                            <span
                                className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                    order.delivery_method === 'pickup' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                                }`}
                            >
                                {order.delivery_method === 'pickup' ? 'Pickup' : 'Delivery'}
                            </span>
                        </h2>
                        <div className="space-y-2.5 sm:space-y-3">
                            <div>
                                <p className="text-xs font-medium text-gray-700 sm:text-sm">Address</p>
                                <p className="text-sm text-gray-900 sm:text-base">{order.delivery_address}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-700 sm:text-sm">Contact Number</p>
                                <p className="text-sm text-gray-900 sm:text-base">{order.delivery_phone}</p>
                            </div>
                            {order.delivery_notes && (
                                <div>
                                    <p className="text-xs font-medium text-gray-700 sm:text-sm">Special Instructions</p>
                                    <p className="text-sm text-gray-900 sm:text-base">{order.delivery_notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Shipping Information */}
                {(order.status === 'shipped' || order.status === 'delivered' || order.status === 'completed') &&
                    order.shipping_provider &&
                    order.tracking_number && (
                        <div className="mb-6 rounded-lg border border-purple-200 bg-white p-3 shadow-sm sm:mb-8 sm:p-5">
                            <h2 className="mb-3 flex items-center text-sm font-semibold text-gray-900 sm:text-base md:text-lg">
                                <Truck className="mr-1.5 h-4 w-4 text-purple-600 sm:mr-2 sm:h-5 sm:w-5" />
                                Shipping Information
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
                                        <p className="mb-1 text-xs font-medium text-gray-700 sm:text-sm">Shipping Provider</p>
                                        <p className="text-base font-semibold text-gray-900 sm:text-lg">
                                            {order.shipping_provider === 'jt_express' ? 'J&T Express' : 'Other'}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
                                        <p className="mb-1 text-xs font-medium text-gray-700 sm:text-sm">Tracking Number</p>
                                        <p className="text-base font-semibold break-all text-purple-600 sm:text-lg">{order.tracking_number}</p>
                                    </div>
                                </div>
                                {order.waybill_number && (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
                                        <p className="mb-1 text-xs font-medium text-gray-700 sm:text-sm">Waybill Number</p>
                                        <p className="text-base font-semibold break-all text-gray-900 sm:text-lg">{order.waybill_number}</p>
                                    </div>
                                )}
                                {order.shipping_provider === 'jt_express' && order.tracking_number && (
                                    <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50 p-3 sm:mt-4 sm:p-4">
                                        <p className="mb-2 text-xs font-medium text-purple-800 sm:text-sm">Track Your Package</p>
                                        <a
                                            href={`https://www.jtexpress.ph/track?trackNo=${order.tracking_number}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 sm:px-4 sm:py-2 sm:text-sm"
                                        >
                                            <Truck className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                                            Track on J&T Express Website
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                {/* Order Items */}
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:mt-8 sm:p-5">
                    <h2 className="mb-4 flex items-center text-sm font-semibold text-gray-900 sm:mb-6 sm:text-base md:text-lg">
                        <Package className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                        Order Items ({order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'})
                    </h2>
                    <div className="space-y-3 sm:space-y-4">
                        {order.order_items.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col space-y-2 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 sm:pb-4"
                            >
                                {item.product_image ? (
                                    <img
                                        src={item.product_image_url || item.product_image}
                                        alt={item.product_name}
                                        className="h-16 w-16 flex-shrink-0 self-center rounded-lg object-cover sm:h-20 sm:w-20 sm:self-auto"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = '/placeholder.svg';
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center self-center rounded-lg bg-gray-100 sm:h-20 sm:w-20 sm:self-auto">
                                        <Package className="h-8 w-8 text-gray-400 sm:h-10 sm:w-10" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1 text-center sm:text-left">
                                    <h3 className="text-sm font-semibold break-words text-gray-900 sm:text-base">{item.product_name}</h3>
                                    <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">Quantity: {item.quantity}</p>
                                    <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">Unit Price: {formatPeso(item.price)}</p>
                                </div>
                                <div className="text-center sm:text-right">
                                    <p className="text-sm font-semibold text-gray-900 sm:text-base md:text-lg">{formatPeso(item.total)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Total */}
                    <div className="mt-4 border-t border-gray-200 pt-3 sm:mt-6 sm:pt-4">
                        <div className="flex justify-end">
                            <div className="text-right">
                                <p className="text-base font-semibold text-gray-900 sm:text-lg md:text-xl">Total: {formatPeso(order.total_amount)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Proof Upload Section */}
                {order.payment_method === 'gcash' && order.status === 'pending' && (
                    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:mt-8 sm:p-5">
                        <h2 className="mb-3 flex items-center text-sm font-semibold text-gray-900 sm:mb-4 sm:text-base md:text-lg">
                            <Upload className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
                            Payment Proof
                        </h2>
                        {order.payment_status === 'pending' && !order.payment_proof && (
                            <div className="space-y-3 sm:space-y-4">
                                <p className="text-xs text-gray-600 sm:text-sm">
                                    Please upload a screenshot or photo of your GCash payment confirmation.
                                </p>
                                {uploadError && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4">
                                        <p className="text-xs text-red-800 sm:text-sm">{uploadError}</p>
                                    </div>
                                )}
                                {uploadSuccess && (
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4">
                                        <p className="text-xs text-green-800 sm:text-sm">
                                            Payment proof uploaded successfully! The seller will review it shortly.
                                        </p>
                                    </div>
                                )}
                                <div className="space-y-2.5 sm:space-y-3">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm">
                                            Select Payment Proof Image
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="block w-full text-xs text-gray-700 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-amber-500 file:to-orange-500 file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-white file:shadow-sm hover:file:from-amber-600 hover:file:to-orange-600 sm:text-sm sm:file:mr-4 sm:file:px-5 sm:file:py-2.5 sm:file:text-sm"
                                            disabled={uploading}
                                        />
                                    </div>
                                    {preview && (
                                        <div className="relative flex justify-center">
                                            <div className="relative max-w-md">
                                                <img
                                                    src={preview}
                                                    alt="Payment proof preview"
                                                    className="h-auto max-h-64 w-full rounded-lg border border-gray-200 object-contain shadow-sm sm:max-h-96"
                                                />
                                                <button
                                                    onClick={() => {
                                                        setPreview(null);
                                                        setSelectedFile(null);
                                                    }}
                                                    className="absolute top-1.5 right-1.5 rounded-full bg-red-500 p-1 text-white shadow-lg transition-colors hover:bg-red-600 sm:top-2 sm:right-2 sm:p-1.5"
                                                >
                                                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {selectedFile && (
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="w-full rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
                                        >
                                            {uploading ? 'Uploading...' : 'Upload Payment Proof'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        {order.payment_proof && (
                            <div className="space-y-3 sm:space-y-4">
                                <div className="rounded-lg border border-gray-200 p-3 sm:p-4">
                                    <p className="mb-2 text-xs font-medium text-gray-700 sm:text-sm">Uploaded Payment Proof:</p>
                                    <div className="flex justify-center">
                                        <img
                                            src={order.payment_proof_url || order.payment_proof}
                                            alt="Payment proof"
                                            className="h-auto max-h-64 w-full max-w-md rounded-lg border border-gray-200 object-contain shadow-sm sm:max-h-96"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = '/placeholder.svg';
                                            }}
                                        />
                                    </div>
                                </div>
                                {order.payment_status === 'pending' && (
                                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 sm:p-4">
                                        <p className="text-xs text-yellow-800 sm:text-sm">
                                            Your payment proof is being reviewed by the seller. You will be notified once it's verified.
                                        </p>
                                    </div>
                                )}
                                {order.payment_status === 'paid' && (
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4">
                                        <p className="text-xs font-medium text-green-800 sm:text-sm">✓ Payment Verified</p>
                                        {order.payment_verification_notes && (
                                            <p className="mt-1 text-xs text-green-700 sm:text-sm">{order.payment_verification_notes}</p>
                                        )}
                                    </div>
                                )}
                                {order.payment_status === 'failed' && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4">
                                        <p className="text-xs font-medium text-red-800 sm:text-sm">Payment Proof Rejected</p>
                                        {order.payment_verification_notes && (
                                            <p className="mt-1 text-xs text-red-700 sm:text-sm">{order.payment_verification_notes}</p>
                                        )}
                                        <p className="mt-2 text-xs text-red-700 sm:text-sm">Please upload a new payment proof.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Order Actions */}
                {order.status === 'pending' && (
                    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:mt-8 sm:p-5">
                        <h2 className="mb-3 text-sm font-semibold text-gray-900 sm:mb-4 sm:text-base md:text-lg">Order Actions</h2>
                        <p className="mb-3 text-xs text-gray-600 sm:mb-4 sm:text-sm">
                            Made a mistake? You can cancel this order before the seller confirms it.
                        </p>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {canCancelOrder && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="inline-flex items-center rounded-lg border border-orange-300 bg-white px-3 py-1.5 text-xs font-medium text-orange-600 transition-colors hover:bg-orange-50 sm:px-4 sm:py-2 sm:text-sm"
                                >
                                    <Ban className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                                    Cancel Order
                                </button>
                            )}
                            {order.seller && auth?.user && auth.user.id !== order.seller.id && (
                                <StartChatButton
                                    userId={order.seller.id}
                                    className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 sm:px-4 sm:py-2 sm:text-sm"
                                >
                                    <MessageSquare className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                                    Contact Seller
                                </StartChatButton>
                            )}
                        </div>
                    </div>
                )}

                {/* Cancel Order Modal */}
                {showCancelModal && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
                            <div className="mb-4 flex items-center">
                                <div className="flex-shrink-0">
                                    <Ban className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900">Cancel Order</h3>
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="mb-3 text-sm text-gray-600">
                                    Are you sure you want to cancel order <span className="font-semibold">#{order.order_number}</span>? Please provide
                                    a reason for cancellation.
                                </p>
                                <label htmlFor="cancel_reason" className="mb-1 block text-sm font-medium text-gray-700">
                                    Reason for cancellation <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="cancel_reason"
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    placeholder="Please tell us why you want to cancel this order..."
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500 focus:outline-none"
                                    rows={3}
                                    maxLength={500}
                                />
                                <p className="mt-1 text-xs text-gray-500">{cancellationReason.length}/500 characters</p>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setCancellationReason('');
                                    }}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    disabled={isCancelling}
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleCancelOrder}
                                    className="rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                                    disabled={isCancelling || !cancellationReason.trim()}
                                >
                                    {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </BuyerLayout>
    );
}
