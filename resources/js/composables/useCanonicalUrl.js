import { computed } from 'vue';
import { usePage } from '@inertiajs/vue3';

export function useCanonicalUrl() {
  const page = usePage();
  return computed(() => {
    // Always use https://corelink.dev as the domain, preserve path and query
    const uri = page.url.startsWith('/') ? page.url : '/' + page.url;
    return 'https://corelink.dev' + uri;
  });
}
