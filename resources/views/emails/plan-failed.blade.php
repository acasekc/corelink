<x-mail::message>
# Plan Generation Failed ⚠️

Unfortunately, we encountered an error while generating the discovery plan.

## Session Details

**Session ID:** {{ $sessionId }}  
**User Email:** {{ $userEmail }}  
**Conversation Turns:** {{ $turnCount }}

## Error Details

<x-mail::panel>
{{ $error }}
</x-mail::panel>

## Recommended Actions

1. Check the application logs for more details
2. Verify the OpenAI API key is valid and has sufficient credits
3. Review the conversation history for any issues
4. Consider manually triggering plan regeneration

<x-mail::button :url="url('/admin/discovery/sessions/' . $session->id)">
View Session
</x-mail::button>

Thanks,<br>
{{ config('app.name') }} System
</x-mail::message>
