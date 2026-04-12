export const CATALOG_CATEGORIES = [
  { name: "Dijelovi motora", slug: "dijelovi-motora" },
  { name: "Filteri", slug: "filteri" },
  { name: "Ostalo", slug: "ostalo" },
] as const;

const LEGACY_OSTALO_SLUGS = new Set(["default", "hidraulika", "hydraulics"]);
const LEGACY_OSTALO_NAMES = new Set(["default", "hidraulika", "hydraulics"]);

export function isLegacyOstaloCategory(category: {
  slug?: string | null;
  name?: string | null;
}) {
  const normalizedSlug =
    typeof category.slug === "string" ? category.slug.trim().toLowerCase() : "";
  const normalizedName =
    typeof category.name === "string" ? category.name.trim().toLowerCase() : "";

  return (
    LEGACY_OSTALO_SLUGS.has(normalizedSlug) ||
    LEGACY_OSTALO_NAMES.has(normalizedName)
  );
}

export function resolveCanonicalCatalogCategory(
  slug?: string | null,
  name?: string | null
) {
  const normalizedSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";
  const directMatch = CATALOG_CATEGORIES.find((category) => category.slug === normalizedSlug);
  if (directMatch) {
    return directMatch;
  }

  if (isLegacyOstaloCategory({ slug, name })) {
    return CATALOG_CATEGORIES[2];
  }

  return null;
}

export function getCatalogCategorySortIndex(slug?: string | null) {
  const normalizedSlug = typeof slug === "string" ? slug.trim().toLowerCase() : "";
  const index = CATALOG_CATEGORIES.findIndex((category) => category.slug === normalizedSlug);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}
