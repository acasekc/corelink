<x-mail::message>
# New Discovery Plan Ready 📋

A new project discovery session has been completed.

## Project: {{ $projectName }}

**User Email:** {{ $userEmail }}  
**Conversation Turns:** {{ $turnCount }}  
**Session ID:** {{ $session->id }}

---

@if($costEstimate)
## Cost Estimate
<x-mail::panel>
{{ is_array($costEstimate) ? json_encode($costEstimate, JSON_PRETTY_PRINT) : $costEstimate }}
</x-mail::panel>
@endif

@if($timeline)
## Timeline Estimate
<x-mail::panel>
{{ is_array($timeline) ? json_encode($timeline, JSON_PRETTY_PRINT) : $timeline }}
</x-mail::panel>
@endif

@if(count($techStack) > 0)
## Recommended Tech Stack
@foreach($techStack as $category => $tech)
- **{{ ucfirst($category) }}:** {{ is_array($tech) ? implode(', ', $tech) : $tech }}
@endforeach
@endif

---

<x-mail::button :url="$planUrl">
View Full Plan
</x-mail::button>

This plan contains the full technical specifications, cost breakdown, and timeline estimates extracted from the discovery conversation.

Thanks,<br>
{{ config('app.name') }} System
</x-mail::message>
