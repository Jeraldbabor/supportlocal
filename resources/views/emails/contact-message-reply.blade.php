@component('mail::message')
# Re: {{ $contactMessage->subject }}

Hello **{{ $contactMessage->name }}**,

Thank you for contacting us. We have received your message and here is our response:

---

@component('mail::panel')
{{ $replyMessage }}
@endcomponent

---

## Your Original Message

**Subject:** {{ $contactMessage->subject }}

**Your Message:**
> {{ $contactMessage->message }}

---

If you have any further questions or concerns, please don't hesitate to reach out to us.

Best regards,  
**{{ $adminName }}**  
{{ config('app.name') }}

@endcomponent
