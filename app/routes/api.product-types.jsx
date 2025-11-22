// File: app/routes/api.product-types.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  try {
    const response = await admin.graphql(
      `#graphql
        query getAllProductTypes {
          products(first: 250) {
            edges {
              node {
                productType
              }
            }
          }
        }`,
    );

    const data = await response.json();

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      return json(
        { error: "Failed to fetch product types", types: [] },
        { status: 500 },
      );
    }

    // Extract unique product types
    const typesSet = new Set();
    data.data?.products?.edges.forEach((edge) => {
      if (edge.node.productType) {
        typesSet.add(edge.node.productType);
      }
    });

    const types = Array.from(typesSet).sort();

    return json({ types });
  } catch (error) {
    console.error("Error fetching product types:", error);
    return json({ error: error.message, types: [] }, { status: 500 });
  }
}
