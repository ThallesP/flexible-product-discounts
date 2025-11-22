// File: app/routes/api.products.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);

  const filterType = url.searchParams.get("filterType");
  const value = url.searchParams.get("value");

  if (!filterType || !value) {
    return json(
      { error: "filterType and value are required" },
      { status: 400 },
    );
  }

  try {
    let query;

    switch (filterType) {
      case "collection": {
        // Extract numeric ID from GID if needed
        const numericId = value.includes("/") ? value.split("/").pop() : value;

        const response = await admin.graphql(
          `#graphql
            query getCollectionProducts($id: ID!) {
              collection(id: $id) {
                products(first: 250) {
                  edges {
                    node {
                      id
                      title
                      handle
                    }
                  }
                }
              }
            }`,
          {
            variables: {
              id: `gid://shopify/Collection/${numericId}`,
            },
          },
        );

        const data = await response.json();

        if (data.errors) {
          console.error("GraphQL errors:", data.errors);
          return json(
            { error: "Failed to fetch products", products: [] },
            { status: 500 },
          );
        }

        const products =
          data.data?.collection?.products?.edges.map((edge) => ({
            id: edge.node.id,
            title: edge.node.title,
            handle: edge.node.handle,
          })) || [];

        return json({ products });
      }

      case "type": {
        query = `product_type:'${value}'`;
        break;
      }

      case "tag": {
        query = `tag:'${value}'`;
        break;
      }

      default:
        return json({ error: "Invalid filterType" }, { status: 400 });
    }

    // For type and tag queries
    if (query) {
      const response = await admin.graphql(
        `#graphql
          query getProducts($query: String!) {
            products(first: 250, query: $query) {
              edges {
                node {
                  id
                  title
                  handle
                }
              }
            }
          }`,
        {
          variables: { query },
        },
      );

      const data = await response.json();

      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
        return json(
          { error: "Failed to fetch products", products: [] },
          { status: 500 },
        );
      }

      const products =
        data.data?.products?.edges.map((edge) => ({
          id: edge.node.id,
          title: edge.node.title,
          handle: edge.node.handle,
        })) || [];

      return json({ products });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return json({ error: error.message, products: [] }, { status: 500 });
  }
}
