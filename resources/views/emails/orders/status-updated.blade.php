@component('mail::message')
{{-- Header with Status Badge --}}
@php
    $statusColors = [
        'pending' => '#f59e0b',
        'confirmed' => '#3b82f6', 
        'completed' => '#10b981',
        'cancelled' => '#ef4444',
    ];
    $statusColor = $statusColors[$order->status] ?? '#6b7280';
    $statusIcons = [
        'pending' => '⏳',
        'confirmed' => '✅',
        'completed' => '🎉',
        'cancelled' => '❌',
    ];
    $statusIcon = $statusIcons[$order->status] ?? '📦';
@endphp

# {{ $statusIcon }} Order Update

Hello **{{ $notifiable->name }}**,

{{ $message }}

---

@component('mail::panel')
## 📦 Order Details

**Order ID:** #{{ $order->id }}  
**Order Date:** {{ $order->created_at->format('F j, Y \a\t g:i A') }}  
**Status:** <span style="color: {{ $statusColor }}; font-weight: bold;">{{ ucfirst(str_replace('_', ' ', $order->status)) }}</span>
@endcomponent

---

## 🛒 Items Ordered

@component('mail::table')
| Product | Qty | Price |
|:--------|:---:|------:|
@foreach($order->orderItems as $item)
| {{ $item->product->name ?? 'Product' }} | {{ $item->quantity }} | ₱{{ number_format($item->price * $item->quantity, 2) }} |
@endforeach
@endcomponent

@component('mail::panel')
**Subtotal:** ₱{{ number_format($order->subtotal, 2) }}  
@if($order->shipping_fee > 0)
**Shipping Fee:** ₱{{ number_format($order->shipping_fee, 2) }}  
@endif
**Total Amount:** **₱{{ number_format($order->total_amount, 2) }}**
@endcomponent

---

@if($order->status === 'confirmed')
## 🚚 What's Next?

Your order has been confirmed by the seller and is being prepared. You'll receive another notification once it's ready for delivery or pickup.

@elseif($order->status === 'completed')
## 🎉 Order Delivered!

We hope you love your purchase! If you have a moment, please consider leaving a review for the seller.

@if($order->seller)
**Seller:** {{ $order->seller->business_name ?? $order->seller->name }}
@endif

@elseif($order->status === 'cancelled')
## ℹ️ Order Cancelled

@if($order->rejection_reason)
**Reason:** {{ $order->rejection_reason }}
@endif

If you have any questions, please contact the seller or our support team.
@endif

---

@component('mail::button', ['url' => $actionUrl, 'color' => 'primary'])
View Order Details
@endcomponent

@if($order->seller)
---

## 🏪 Seller Information

**{{ $order->seller->business_name ?? $order->seller->name }}**  
@if($order->seller->phone_number)
📞 {{ $order->seller->phone_number }}
@endif
@endif

---

<p style="text-align: center; color: #6b7280; font-size: 14px;">
Thank you for supporting local businesses! 🧡
</p>

Thanks,<br>
**{{ config('app.name') }}**

@slot('subcopy')
If you're having trouble clicking the "View Order Details" button, copy and paste the URL below into your web browser: [{{ $actionUrl }}]({{ $actionUrl }})
@endslot
@endcomponent
