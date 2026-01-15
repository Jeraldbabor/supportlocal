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
                return <Badge variant="default" className="bg-blue-500">New</Badge>;
            case 'read':
                return <Badge variant="secondary">Read</Badge>;
            case 'replied':
                return <Badge variant="default" className="bg-green-500">Replied</Badge>;
            case 'archived':
                return <Badge variant="outline">Archived</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Contact Message from ${message.name}`} />
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Contact Message</h1>
                        <p className="text-muted-foreground">View and manage contact form submission</p>
                    </div>
                    <Button variant="outline" onClick={() => router.visit('/admin/contact-messages')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Messages
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Message Details */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Message Details</CardTitle>
                                    {getStatusBadge(message.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">From</label>
                                    <p className="text-lg font-semibold">{message.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        <a href={`mailto:${message.email}`} className="text-primary hover:underline">
                                            {message.email}
                                        </a>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Subject</label>
                                    <p className="text-lg">{message.subject}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Message</label>
                                    <div className="mt-2 rounded-lg border bg-muted/50 p-4">
                                        <p className="whitespace-pre-wrap">{message.message}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <label className="text-muted-foreground">Received</label>
                                            <p>{new Date(message.created_at).toLocaleString()}</p>
                                        </div>
                                        {message.read_at && (
                                            <div>
                                                <label className="text-muted-foreground">Read At</label>
                                                <p>{new Date(message.read_at).toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Status Management */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Manage Status</CardTitle>
                                <CardDescription>Update the message status and add notes</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleStatusUpdate} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Status</label>
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
                                        <label className="text-sm font-medium">Admin Notes</label>
                                        <Textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Add internal notes about this message..."
                                            rows={6}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            These notes are only visible to administrators.
                                        </p>
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
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    variant="default"
                                    className="w-full justify-start"
                                    onClick={() => setShowReplyModal(true)}
                                >
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Reply to {message.name}</DialogTitle>
                        <DialogDescription>
                            Send an email reply to {message.email}. The message will be sent from your admin account.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReply} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="to">To</Label>
                            <div className="rounded-md border bg-muted px-3 py-2 text-sm">
                                {message.name} &lt;{message.email}&gt;
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <div className="rounded-md border bg-muted px-3 py-2 text-sm">
                                Re: {message.subject}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="original-message">Original Message</Label>
                            <div className="max-h-32 overflow-y-auto rounded-md border bg-muted p-3 text-sm">
                                {message.message}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reply_message">Your Reply *</Label>
                            <Textarea
                                id="reply_message"
                                value={replyForm.data.reply_message}
                                onChange={(e) => replyForm.setData('reply_message', e.target.value)}
                                placeholder="Type your reply message here..."
                                rows={8}
                                required
                            />
                            <InputError message={replyForm.errors.reply_message} />
                            <p className="text-xs text-muted-foreground">
                                Minimum 10 characters. The original message will be included in the email.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowReplyModal(false);
                                    replyForm.reset();
                                }}
                                disabled={replyForm.processing}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button type="submit" disabled={replyForm.processing}>
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
