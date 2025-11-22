// app/routes/webhooks.jsx

import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  try {
    const { topic, shop, session, admin, payload } =
      await authenticate.webhook(request);

    if (!shop) {
      console.error("No shop in webhook payload");
      return new Response(null, { status: 400 });
    }

    console.log(`✅ Received ${topic} webhook for ${shop}`);

    switch (topic) {
      case "APP_UNINSTALLED":
        console.log(`🗑️ App uninstalled for shop: ${shop}`);

        const deletedSettings = await db.formSettings.deleteMany({
          where: { shop },
        });

        const deletedSessions = await db.session.deleteMany({
          where: { shop },
        });

        console.log(
          `✅ Deleted ${deletedSettings.count} settings and ${deletedSessions.count} sessions for ${shop}`,
        );
        break;

      case "CUSTOMERS_DATA_REQUEST":
        console.log(`📋 Customer data request for shop: ${shop}`);
        console.log(`ℹ️ No customer-specific data stored for ${shop}`);
        break;

      case "CUSTOMERS_REDACT":
        console.log(`🗑️ Customer data redaction for shop: ${shop}`);
        console.log(`ℹ️ No customer-specific data to redact for ${shop}`);
        break;

      case "SHOP_REDACT":
        console.log(`🗑️ Shop redaction request for shop: ${shop}`);

        await db.formSettings.deleteMany({ where: { shop } });
        await db.session.deleteMany({ where: { shop } });

        console.log(`✅ Redacted all data for ${shop}`);
        break;

      default:
        console.warn(`⚠️ Unhandled webhook topic: ${topic}`);
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response(null, { status: 500 });
  }
};