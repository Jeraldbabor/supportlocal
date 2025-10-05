import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BuyerLayout from '@/layouts/BuyerLayout';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, ArrowRight, Info, ShoppingBag, Store } from 'lucide-react';

interface SellerApplicationConfirmationProps {
    user: {
        name: string;
        email: string;
    };
}

export default function SellerApplicationConfirmation({ user }: SellerApplicationConfirmationProps) {
    return (
        <BuyerLayout>
            <Head title="Become a Seller - Confirmation" />

            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-8 text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="rounded-full bg-blue-100 p-3">
                            <Store className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Ready to Become a Seller?</h1>
                    <p className="text-lg text-gray-600">Hello {user.name}, you're about to take the next step in your journey!</p>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-600" />
                            Important Information
                        </CardTitle>
                        <CardDescription>Please read this carefully before proceeding with your seller application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Application Review Process:</strong> Your seller application will be reviewed by our team. This process
                                typically takes 2-3 business days. You'll receive an email notification once your application has been reviewed.
                            </AlertDescription>
                        </Alert>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                <h3 className="mb-2 font-semibold text-green-800">What you'll need:</h3>
                                <ul className="space-y-1 text-sm text-green-700">
                                    <li>• Valid government-issued ID</li>
                                    <li>• Business description</li>
                                    <li>• Business type information</li>
                                    <li>• Complete profile information</li>
                                </ul>
                            </div>

                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <h3 className="mb-2 font-semibold text-blue-800">What happens next:</h3>
                                <ul className="space-y-1 text-sm text-blue-700">
                                    <li>• Submit your application</li>
                                    <li>• Admin team reviews your details</li>
                                    <li>• You'll receive email notification</li>
                                    <li>• Start selling upon approval!</li>
                                </ul>
                            </div>
                        </div>

                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <h3 className="mb-2 font-semibold text-yellow-800">
                                <AlertCircle className="mr-1 inline h-4 w-4" />
                                Before you proceed:
                            </h3>
                            <p className="text-sm text-yellow-700">
                                Make sure your profile is complete and all information is accurate. Incomplete or incorrect information may delay the
                                approval process.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Link href="/dashboard">
                        <Button variant="outline" className="w-full sm:w-auto">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Continue Shopping
                        </Button>
                    </Link>

                    <Link href="/seller/apply/form">
                        <Button className="w-full sm:w-auto">
                            Proceed to Application
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </BuyerLayout>
    );
}
