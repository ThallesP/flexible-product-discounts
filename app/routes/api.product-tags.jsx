// File: app/routes/api.product-tags.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  try {
    const response = await admin.graphql(
      `#graphql
        query getAllProductTags {
          products(first: 250) {
            edges {
              node {
                tags
              }
            }
          }
        }`,
    );

    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      return json(
        { error: "Failed to fetch product tags", tags: [] },
        { status: 500 },
      );
    }

    // Extract unique tags from all products
    const tagsSet = new Set();
    data.data?.products?.edges.forEach((edge) => {
      if (edge.node.tags && Array.isArray(edge.node.tags)) {
        edge.node.tags.forEach((tag) => tagsSet.add(tag));
      }
    });

    const tags = Array.from(tagsSet).sort();

    return json({ tags });
  } catch (error) {
    console.error("Error fetching product tags:", error);
    return json({ error: error.message, tags: [] }, { status: 500 });
  }
}
