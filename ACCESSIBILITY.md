# Accessibility (ADA/WCAG 2.1) Compliance Guide

This document outlines the accessibility improvements made to the CoreLink application and guidelines for maintaining and enhancing accessibility going forward.

## Current Compliance Status

✅ **WCAG 2.1 Level AA** - Targeted Compliance

### Components Updated
- [x] PublicLayout (Navigation, Mobile Menu)
- [x] Index Page (Hero Section, Feature Cards)
- [x] Contact Form
- [x] Discovery Chat Interface
- [x] Global Styles (CSS)
- [x] HTML Meta Tags

---

## Accessibility Improvements Made

### 1. **Color Contrast** ⭐ High Impact
**Issue:** Low contrast text made content hard to read for users with visual impairments.

**Solution:**
- Upgraded text colors from `text-slate-300` / `text-slate-400` to `text-slate-200` / `text-slate-300`
- Error messages now use `text-red-300` instead of `text-red-400`
- Success messages use `text-green-300`
- Status text uses `text-slate-300` for better contrast
- Footer text improved from `text-slate-400` to `text-slate-200`

**WCAG Requirement:** 4.5:1 contrast ratio for normal text, 3:1 for large text (18pt+)

**Files Modified:**
- `resources/css/app.css` - Added high-contrast color classes
- All Vue components - Updated text color Tailwind classes

---

### 2. **Focus Indicators** ⭐ Critical for Keyboard Users
**Issue:** Removed default focus outlines (`focus:outline-none`) without providing visible alternatives.

**Solution:**
- Added `focus-visible:ring-2 focus-visible:ring-blue-400` to all interactive elements
- Created consistent focus indicator styling across buttons, links, and form fields
- Added CSS utility class `.focus-visible-ring` for reusability
- Focus rings have 2px blue outline with offset for visibility

**WCAG Requirement:** Visible focus indicator on all interactive elements

**Updated Elements:**
- Navigation links (desktop & mobile)
- Buttons (primary, secondary, submit)
- Form inputs (text, email, textarea)
- Links (all components)

---

### 3. **Form Accessibility** ⭐ High Priority
**Issue:** Forms lacked proper ARIA attributes and error connection.

**Solution:**

#### Form Labels & Required Fields
```vue
<label for="name" class="block text-sm font-semibold mb-2">
  Name <span class="text-red-400" aria-label="required">*</span>
</label>
```

#### Input Attributes
```vue
<input
  id="name"
  type="text"
  required
  aria-required="true"
  :aria-invalid="!!form.errors.name"
  :aria-describedby="form.errors.name ? 'name-error' : undefined"
/>
<p id="name-error" class="error-message">{{ form.errors.name }}</p>
```

**Key Improvements:**
- `aria-required="true"` - Announces field requirement
- `aria-invalid="true"` - When field has errors
- `aria-describedby="field-error"` - Links input to error message
- Unique IDs for all form elements
- Error messages have semantic IDs

---

### 4. **Keyboard Navigation**
**Issue:** Mobile menu could not be closed with Escape key.

**Solution:**
- Added keyboard event listener for Escape key
- Mobile menu closes when Escape is pressed
- Mobile menu button has `aria-expanded` attribute
- All navigation links are keyboard accessible

**Code:**
```javascript
const handleEscapeKey = (event) => {
    if (event.key === 'Escape' && mobileMenuOpen.value) {
        mobileMenuOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('keydown', handleEscapeKey);
});
```

---

### 5. **ARIA Labels & Roles**
**Issue:** Screen reader users couldn't understand purpose of interactive elements.

**Solution:**

#### Navigation
```vue
<nav aria-label="Main navigation">
  <button aria-label="Toggle navigation menu" :aria-expanded="mobileMenuOpen">
```

#### Decorative Icons
```vue
<svg aria-hidden="true"><!-- Icon --></svg>
<span aria-hidden="true">🚀</span>
```

#### Live Regions (Chat & Notifications)
```vue
<div role="log" aria-live="polite" aria-label="Chat messages">
  <!-- Chat messages -->
</div>

<div role="alert" aria-live="polite">
  Success message
</div>
```

#### Status Updates
```vue
<span aria-live="polite" aria-atomic="true">
  Turn {{ turnNumber }} of {{ maxTurns }}
</span>
```

---

### 6. **Semantic HTML & Skip Links**
**Issue:** Users couldn't quickly navigate to main content or understand page structure.

**Solution:**

#### Skip Link
```vue
<a href="#main-content" class="skip-to-main">Skip to main content</a>
```

CSS Implementation:
```css
.skip-to-main {
    clip-path: inset(100%);
    white-space: nowrap;
    overflow: hidden;
    position: fixed;
    
    &:focus {
        clip-path: unset;
    }
}
```

#### Semantic Landmarks
```vue
<main id="main-content">
<nav aria-label="Main navigation">
<footer>
<section aria-label="Hero section">
```

---

### 7. **Reduced Motion Support**
**Issue:** Animations can trigger motion sickness in users with vestibular disorders.

**Solution:**
```css
@media (prefers-reduced-motion: reduce) {
    * {
        @apply !animate-none !transition-none;
    }
}
```

---

### 8. **Decorative Elements**
**Issue:** Screen readers announced decorative emoji and icons.

**Solution:**
- Wrap decorative content with `aria-hidden="true"`
- Use `aria-label` for icons that convey meaning

**Examples:**
```vue
<!-- Decorative emoji -->
<span aria-hidden="true">🚀</span>

<!-- Meaningful icon would be -->
<svg aria-label="Loading"><path .../></svg>
```

---

### 9. **Meta Tags & SEO**
**Issue:** Missing meta description for search engines and social sharing.

**Solution:**
```blade
<meta name="description" content="CoreLink Development specializes in crafting intelligent, scalable web and mobile applications using cutting-edge AI technology.">
```

---

## Testing Recommendations

### Automated Testing
```bash
# Install accessibility testing tools
npm install --save-dev @testing-library/jest-dom axe-core
```

### Manual Testing Checklist
- [ ] Tab through entire site - all elements reachable
- [ ] Keyboard-only navigation works
- [ ] Focus indicators visible
- [ ] Mobile menu can be closed with Escape
- [ ] Forms announce errors properly
- [ ] Color contrast passes WCAG AA (4.5:1)
- [ ] Skip link appears on Tab press
- [ ] Screen reader announces page landmarks
- [ ] Images have alt text
- [ ] Videos have captions

### Screen Reader Testing
- **NVDA** (Windows - Free)
- **JAWS** (Windows - Paid)
- **VoiceOver** (macOS/iOS - Built-in)
- **TalkBack** (Android - Built-in)

### Color Contrast Tools
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Axe DevTools](https://www.deque.com/axe/devtools/)
- [Contrast Checker](https://www.tpgi.com/color-contrast-checker/)

---

## Future Improvements

### High Priority (WCAG AA)
- [ ] Add alt text to all images (including /images/logo_100_h.png)
- [ ] Create accessible PDF guides
- [ ] Add captions to any videos
- [ ] Test with real screen reader users
- [ ] Implement focus trap in modals/overlays

### Medium Priority (Nice to Have)
- [ ] Add skip links for each major section
- [ ] Implement high contrast mode toggle
- [ ] Add language attribute to HTML (`lang="en"`)
- [ ] Create accessible dark/light mode toggle
- [ ] Add breadcrumb navigation

### Low Priority (Enhancements)
- [ ] Implement ARIA landmarks on all sections
- [ ] Add visually hidden text for screen readers
- [ ] Create accessible tables for data
- [ ] Add heading hierarchy documentation

---

## Maintenance Guidelines

### When Adding New Components
1. ✅ Include `aria-label` on buttons/icons
2. ✅ Add `focus-visible` rings to all interactive elements
3. ✅ Use semantic HTML (`<button>` instead of `<div>`)
4. ✅ Connect form inputs to labels and error messages
5. ✅ Hide decorative elements with `aria-hidden="true"`
6. ✅ Test with keyboard navigation
7. ✅ Test color contrast (use WAVE or Axe)

### When Modifying Forms
```vue
<!-- ✅ Good -->
<label for="email">Email <span aria-label="required">*</span></label>
<input
  id="email"
  aria-required="true"
  :aria-invalid="!!errors.email"
  :aria-describedby="errors.email ? 'email-error' : undefined"
/>
<p id="email-error" class="error-message">{{ errors.email }}</p>

<!-- ❌ Bad -->
<input type="text" placeholder="Email" />
```

### When Adding Icons/Images
```vue
<!-- ✅ Decorative icons -->
<svg aria-hidden="true"><path .../></svg>

<!-- ✅ Meaningful icons -->
<button aria-label="Delete item">
  <svg><path .../></svg>
</button>

<!-- ✅ Images with meaning -->
<img src="logo.png" alt="CoreLink Development Home" />

<!-- ❌ Avoid -->
<img src="logo.png" alt="logo" />
<svg></svg>
```

---

## Resources

### WCAG Guidelines
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (in Chrome DevTools)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

### Vue/Inertia Specific
- [Vue Accessibility Guide](https://vuejs.org/guide/best-practices/accessibility.html)
- [Inertia Link Component](https://inertiajs.com/links)

---

## Contact

For accessibility questions or to report issues:
- Email: accessibility@corelink.dev
- Create an issue with the `accessibility` label

---

**Last Updated:** January 2, 2026
**Branch:** `accessibility`
**Status:** In Development (Not yet merged to production)
