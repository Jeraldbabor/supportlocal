<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Notifications\NewOrderReceived;
use Illuminate\Console\Command;

class TestNotification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:notification {seller-id} {buyer-id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test notification system by creating a mock order';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $sellerId = $this->argument('seller-id');
        $buyerId = $this->argument('buyer-id');

        $seller = User::find($sellerId);
        $buyer = User::find($buyerId);

        if (! $seller) {
            $this->error("Seller with ID {$sellerId} not found");

            return;
        }

        if (! $buyer) {
            $this->error("Buyer with ID {$buyerId} not found");

            return;
        }

        $this->info("Testing notification from buyer {$buyer->name} to seller {$seller->name}");

        // Get a product from the seller
        $product = Product::where('seller_id', $sellerId)->first();

        if (! $product) {
            $this->error("No products found for seller {$seller->name}");

            return;
        }

        // Create a test order
        $order = Order::create([
            'user_id' => $buyerId,  // This is the buyer_id according to the model
            'order_number' => 'ORD-'.strtoupper(uniqid()),
            'shipping_name' => $buyer->name,
            'shipping_email' => $buyer->email,
            'shipping_phone' => '123-456-7890',
            'payment_method' => 'cod',  // Cash on delivery
            'subtotal' => 100.00,
            'status' => 'pending',
            'total_amount' => 100.00,
            'shipping_address' => json_encode([
                'street' => '123 Test St',
                'city' => 'Test City',
                'state' => 'Test State',
                'zip' => '12345',
            ]),
        ]);

        // Create order item
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'seller_name' => $seller->name,
            'quantity' => 1,
            'price' => 100.00,
            'total' => 100.00,
        ]);

        // Load relationships
        $order->load('buyer');

        $this->info("Created test order #{$order->id}");

        try {
            // Send notification
            $seller->notify(new NewOrderReceived($order));
            $this->info("✓ Notification sent successfully to {$seller->name}");

            // Check if notification was stored in database
            $notificationCount = $seller->notifications()->count();
            $this->info("✓ Seller now has {$notificationCount} notifications");

            // Show the latest notification
            $latestNotification = $seller->notifications()->latest()->first();
            if ($latestNotification) {
                $data = is_array($latestNotification->data) ? $latestNotification->data : json_decode($latestNotification->data, true);
                $this->info('✓ Latest notification data:');
                $this->line('  - Order ID: '.$data['order_id']);
                $this->line('  - Customer: '.$data['customer_name']);
                $this->line('  - Total Amount: $'.$data['total_amount']);
                $this->line('  - Order Number: '.$data['order_number']);
            }

        } catch (\Exception $e) {
            $this->error('✗ Failed to send notification: '.$e->getMessage());
            $this->error('Stack trace: '.$e->getTraceAsString());
        }
    }
}
