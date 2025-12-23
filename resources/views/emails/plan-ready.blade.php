<x-mail::message>
# Your Project Summary is Ready! 🎉

Hi there,

Thank you for taking the time to share your project vision with us. We've put together a summary of what you're looking to build.

## {{ $projectName }}

{{ $overview }}

@if(count($keyFeatures) > 0)
## Key Features We Discussed

@foreach($keyFeatures as $feature)
- {{ $feature }}
@endforeach
@endif

## What Happens Next

{{ $nextSteps }}

Our team will review your requirements and reach out to discuss next steps. We're excited to help bring your vision to life!

<x-mail::button :url="config('app.url')">
Visit CoreLink
</x-mail::button>

Thanks,<br>
{{ config('app.name') }} Team
</x-mail::message>
