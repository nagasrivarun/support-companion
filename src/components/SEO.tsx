import { Helmet } from "react-helmet-async";

export const SITE_URL = "https://fastship.vercel.app";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "product";
  image?: string;
  jsonLd?: object | object[];
  noIndex?: boolean;
}

/**
 * Per-route SEO head tags. Renders unique title, description, canonical,
 * and Open Graph tags. Pair with optional structured data via jsonLd.
 */
export const SEO = ({ title, description, path, type = "website", image, jsonLd, noIndex }: SEOProps) => {
  const url = path.startsWith("http") ? path : `${SITE_URL}${path}`;
  const ogImage = image
    ? (image.startsWith("http") ? image : `${SITE_URL}${image}`)
    : `${SITE_URL}/favicon.png`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <link rel="canonical" href={url} />
      )}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {!noIndex && schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
      ))}
    </Helmet>
  );
};
