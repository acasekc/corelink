import { Head } from '@inertiajs/react';

export default function SeoHead({ meta }) {
  return (
    <Head title={meta?.title}>
      {meta?.description && <meta name="description" content={meta.description} />}
      {meta?.title && <meta property="og:title" content={`${meta.title} | CoreLink Development`} />}
      {meta?.description && <meta property="og:description" content={meta.description} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="CoreLink Development" />
    </Head>
  );
}
