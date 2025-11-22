import { json } from "@remix-run/node";
import db from "../db.server.js";

export async function action({ request }) {
  const { authenticate } = await import("../shopify.server");
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    // Create the automatic discount using GraphQL
    const createDiscountMutation = `
      mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
        discountAutomaticAppCreate(automaticAppDiscount: $discount) {
          automaticAppDiscount {
            discountId
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await admin.graphql(createDiscountMutation, {
      variables: {
        discount: {
          title: "Product Discount",
          functionId:
            "gid://shopify/Function/019a5f73-9441-76fe-8945-bb304ce09408",
          startsAt: new Date().toISOString(),
        },
      },
    });

    const result = await response.json();

    console.log("Discount creation result:", JSON.stringify(result, null, 2));

    if (result.data?.discountAutomaticAppCreate?.userErrors?.length > 0) {
      const errors = result.data.discountAutomaticAppCreate.userErrors;
      console.error("Discount creation errors:", errors);
      return json(
        {
          success: false,
          error: `Failed to create discount: ${errors.map((e) => e.message).join(", ")}`,
        },
        { status: 400 },
      );
    }

    const discountId =
      result.data?.discountAutomaticAppCreate?.automaticAppDiscount?.discountId;

    if (!discountId) {
      return json(
        {
          success: false,
          error: "Failed to create discount - no ID returned",
        },
        { status: 500 },
      );
    }

    console.log("Discount created successfully:", discountId);

    // Save the discount ID to database
    await db.formSettings.upsert({
      where: { shop },
      update: { shopifyDiscountId: discountId },
      create: {
        shop,
        shopifyDiscountId: discountId,
        fieldOne: "",
        fieldTwo: "",
      },
    });

    console.log("Discount ID saved to database");

    return json({
      success: true,
      discountId,
      message: "Discount created and configured successfully!",
    });
  } catch (error) {
    console.error("Setup error:", error);
    return json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export default function SetupDiscount() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>This route is action-only</h1>
      <p>Use a POST request to trigger the discount setup.</p>
    </div>
  );
}
