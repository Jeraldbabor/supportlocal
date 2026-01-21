import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Mail, Save, Send, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    admin_notes: string | null;
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    message: ContactMessage;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administrator Dashboard', href: '/admin/dashboard' },
    { title: 'Contact Messages', href: '/admin/contact-messages' },
    { title: 'View Message', href: '#' },
];

export default function ContactMessageShow() {
    const { message } = usePage<SharedData & Props>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState(message.status);
    const [adminNotes, setAdminNotes] = useState(message.admin_notes || '');
    const [showReplyModal, setShowReplyModal] = useState(false);

    const replyForm = useForm({
        reply_message: '',
    });

    const handleStatusUpdate = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(
            `/admin/contact-messages/${message.id}/update-status`,
            {
                status,
                admin_notes: adminNotes,
            },
            {
                preserveScroll: true,
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const handleReply = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        replyForm.post(`/admin/contact-messages/${message.id}/reply`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowReplyModal(false);
                replyForm.reset();
                setStatus('replied');
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new':
                return (
                    <Badge className="bg-blue-500 text-white">
                        New
                    </Badge>
                );
            case 'read':
                return <Badge className="bg-gray-100 text-gray-800">Read</Badge>;
            case 'replied':
                return (
                    <Badge className="bg-green-500 text-white">
                        Replied
                    </Badge>
                );
            case 'archived':
                return <Badge variant="outline" className="border-gray-300 text-gray-700">Archived</Badge>;
            default:
                return <Badge variant="outline" className="border-gray-300 text-gray-700">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Contact Message from ${message.name}`} />
            <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-4" style={{ colorScheme: 'light' }}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">Contact Message</h1>
                        <p className="text-sm text-gray-500">View and manage contact form submission</p>
                    </div>
                    <Button variant="outline" onClick={() => router.visit('/admin/contact-messages')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Messages
                    </Button>
                </div>

                <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
                    {/* Message Details */}
                    <div className="space-y-4 sm:space-y-6 md:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <CardTitle className="text-gray-900">Message Details</CardTitle>
                                    {getStatusBadge(message.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">From</label>
                                    <p className="text-lg font-semibold text-gray-900">{message.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" style={{ color: '#6b7280' }} />
                                        <a href={`mailto:${message.email}`} className="text-orange-600 hover:underline">
                                            {message.email}
                                        </a>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Subject</label>
                                    <p className="text-lg text-gray-900">{message.subject}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Message</label>
                                    <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                        <p className="whitespace-pre-wrap text-gray-700">{message.message}</p>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                                        <div>
                                            <label className="text-gray-500">Received</label>
                                            <p className="text-gray-900">{new Date(message.created_at).toLocaleString()}</p>
                                        </div>
                                        {message.read_at && (
                                            <div>
                                                <label className="text-gray-500">Read At</label>
                                                <p className="text-gray-900">{new Date(message.read_at).toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Status Management */}
                    <div className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-gray-900">Manage Status</CardTitle>
                                <CardDescription className="text-gray-500">Update the message status and add notes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleStatusUpdate} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Status</label>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new">New</SelectItem>
                                                <SelectItem value="read">Read</SelectItem>
                                                <SelectItem value="replied">Replied</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Admin Notes</label>
                                        <Textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Add internal notes about this message..."
                                            rows={6}
                                        />
                                        <p className="text-xs text-gray-500">These notes are only visible to administrators.</p>
                                    </div>

                                    <Button type="submit" disabled={isSubmitting} className="w-full">
                                        <Save className="mr-2 h-4 w-4" />
                                        {isSubmitting ? 'Updating...' : 'Update Status'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="default" className="w-full justify-start" onClick={() => setShowReplyModal(true)}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Reply via Email
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Reply Modal */}
            <Dialog open={showReplyModal} onOpenChange={setShowReplyModal}>
                <DialogContent className="max-w-2xl" style={{ colorScheme: 'light' }}>
                    <DialogHeader>
                        <DialogTitle className="text-gray-900">Reply to {message.name}</DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Send an email reply to {message.email}. The message will be sent from your admin account.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReply} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="to" className="text-gray-700">To</Label>
                            <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">
                                {message.name} &lt;{message.email}&gt;
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-gray-700">Subject</Label>
                            <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900">Re: {message.subject}</div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="original-message" className="text-gray-700">Original Message</Label>
                            <div className="max-h-32 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">{message.message}</div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reply_message" className="text-gray-700">Your Reply *</Label>
                            <Textarea
                                id="reply_message"
                                value={replyForm.data.reply_message}
                                onChange={(e) => replyForm.setData('reply_message', e.target.value)}
                                placeholder="Type your reply message here..."
                                rows={8}
                                required
                            />
                            <InputError message={replyForm.errors.reply_message} />
                            <p className="text-xs text-gray-500">
                                Minimum 10 characters. The original message will be included in the email.
                            </p>
                        </div>
                        <DialogFooter className="flex-col gap-2 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowReplyModal(false);
                                    replyForm.reset();
                                }}
                                disabled={replyForm.processing}
                                className="w-full sm:w-auto"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button type="submit" disabled={replyForm.processing} className="w-full sm:w-auto">
                                <Send className="mr-2 h-4 w-4" />
                                {replyForm.processing ? 'Sending...' : 'Send Reply'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
