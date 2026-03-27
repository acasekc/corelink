import { Head } from '@inertiajs/react';

export default function SeoHead({ meta }) {
  return (
    <Head title={meta?.title}>
      {meta?.canonical && <link rel="canonical" href={meta.canonical} key="canonical" />}
      {meta?.description && <meta name="description" content={meta.description} />}
      {meta?.title && <meta property="og:title" content={`${meta.title} | CoreLink Development`} />}
      {meta?.description && <meta property="og:description" content={meta.description} />}
      {meta?.canonical && <meta property="og:url" content={meta.canonical} />}
      <meta property="og:type" content={meta?.type ?? 'website'} />
      <meta property="og:site_name" content="CoreLink Development" />
      {meta?.image && <meta property="og:image" content={meta.image} />}
    </Head>
  );
}
