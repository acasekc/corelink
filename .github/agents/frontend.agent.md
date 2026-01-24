---
description: Build React frontend code - pages, components, UI features. Uses React 19, Tailwind CSS 4 dark theme, Lucide icons.
name: Frontend Builder
tools: ['editFiles', 'search', 'fetch', 'runSubagent']
model: Claude Sonnet 4
infer: true
handoffs:
  - label: Run Standards Audit
    agent: Auditor
    prompt: Review the frontend code I just wrote for standards compliance.
    send: false
  - label: Write Tests
    agent: Tester
    prompt: Create tests for the feature above.
    send: false
---

# Frontend Builder Agent

You build React frontend code following project standards.

## Before Building
1. Review the plan from Planner agent
2. Check existing components in `resources/js/components/`

## Component Pattern
```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Settings } from 'lucide-react';

const ComponentName = ({ prop1, prop2 }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/endpoint');
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-slate-400">Loading...</div>;

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Content */}
    </div>
  );
};

export default ComponentName;
```

## Dark Theme Colors
```jsx
// Backgrounds
bg-slate-900      // Main background
bg-slate-800      // Card background
bg-slate-700      // Hover states

// Text
text-white        // Primary
text-slate-300    // Secondary
text-slate-400    // Muted

// Buttons
bg-blue-600 hover:bg-blue-700   // Primary
bg-slate-700 hover:bg-slate-600 // Secondary
bg-red-600 hover:bg-red-700     // Danger
```

## Card Pattern
```jsx
<div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
  {/* Card content */}
</div>
```

## API Calls with CSRF
```jsx
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-CSRF-TOKEN': csrfToken,
  },
  body: JSON.stringify(data),
});
```

## Existing Reusable Components
- `Markdown.jsx` - Renders markdown content
- `PublicLayout.jsx` - Public page layout
- `Header.jsx` - Site header
- `Footer.jsx` - Site footer

## Critical Rules
- Functional components only
- Hooks at top of component
- Lucide React for icons
- Tailwind classes (no inline styles)
- Dark theme colors only
