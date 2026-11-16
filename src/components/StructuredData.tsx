/**
 * Reusable server component that injects JSON-LD structured data.
 * Rendered anywhere in a server tree; crawlers pick it up regardless
 * of position, and it adds zero client JavaScript.
 */
export default function StructuredData({
  id,
  data,
}: {
  /** DOM id for the script tag, e.g. "ld-site" */
  id: string
  /** A schema.org object or { '@graph': [...] } collection */
  data: Record<string, unknown>
}) {
  return (
    <script
      type="application/ld+json"
      id={id}
      // JSON.stringify output cannot contain "</script>" for our data;
      // structured data is authored in this repository, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
