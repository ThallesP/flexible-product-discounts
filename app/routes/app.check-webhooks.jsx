// app/routes/app.check-webhooks.jsx

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }) {
  const { authenticate } = await import("../shopify.server");

  try {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(
      `#graphql
      query {
        webhookSubscriptions(first: 20) {
          edges {
            node {
              id
              topic
              endpoint {
                __typename
                ... on WebhookHttpEndpoint {
                  callbackUrl
                }
              }
            }
          }
        }
      }`,
    );

    const data = await response.json();

    if (!data.data || !data.data.webhookSubscriptions) {
      return json({ error: "No webhook data returned", webhooks: [] });
    }

    return json({ webhooks: data.data.webhookSubscriptions.edges });
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    return json({ error: error.message, webhooks: [] }, { status: 500 });
  }
}

export default function CheckWebhooks() {
  const data = useLoaderData();

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: "20px" }}>Registered Webhooks</h1>

      {data.error ? (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#fee",
            border: "1px solid #c00",
            borderRadius: "6px",
            marginBottom: "20px",
          }}
        >
          <strong>Error:</strong> {data.error}
        </div>
      ) : null}

      <div
        style={{
          padding: "15px",
          backgroundColor: "#f0f0f0",
          borderRadius: "6px",
          marginBottom: "20px",
        }}
      >
        <strong>Total webhooks registered:</strong> {data.webhooks?.length || 0}
      </div>

      {data.webhooks && data.webhooks.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {data.webhooks.map((webhook, index) => (
            <li
              key={index}
              style={{
                padding: "15px",
                marginBottom: "10px",
                backgroundColor: "white",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            >
              <div style={{ marginBottom: "8px" }}>
                <strong style={{ fontSize: "16px", color: "#008060" }}>
                  {webhook.node.topic}
                </strong>
              </div>
              <div
                style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}
              >
                <strong>URL:</strong>{" "}
                {webhook.node.endpoint?.callbackUrl || "N/A"}
              </div>
              <div style={{ fontSize: "12px", color: "#999" }}>
                <strong>ID:</strong> {webhook.node.id}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#f9f9f9",
            border: "1px solid #ddd",
            borderRadius: "6px",
          }}
        >
          No webhooks found. Make sure your shopify.app.toml has webhooks
          configured.
        </div>
      )}
    </div>
  );
}

