export default (input) => {
  // Parse configuration from metafield
  const configuration = JSON.parse(input?.discount?.metafield?.value ?? "{}");

  // Extract discount settings from configuration
  const {
    products = [], // Array of {shopifyProductId, discountPercentage}
    types = [], // Array of {typeName, discountPercentage}
  } = configuration;

  // Build a map of cart line IDs to discount percentages
  const lineDiscounts = new Map();

  // Process each cart line to determine applicable discounts
  input.cart.lines.forEach((line) => {
    if (line.merchandise.__typename !== "ProductVariant") {
      return;
    }

    const product = line.merchandise.product;
    const productId = product.id;
    let applicableDiscount = null;

    // Priority 1: Check individual products (HIGHEST PRIORITY)
    // This includes products directly selected AND products from collections/tags
    const individualProduct = products.find(
      (p) => p.shopifyProductId === productId,
    );
    if (individualProduct?.discountPercentage) {
      applicableDiscount = individualProduct.discountPercentage;
    }

    // Priority 2: Check product type (only if no product discount found)
    if (!applicableDiscount && types.length > 0 && product.productType) {
      const typeMatch = types.find(
        (t) => t.typeName === product.productType && t.discountPercentage,
      );
      if (typeMatch) {
        applicableDiscount = typeMatch.discountPercentage;
      }
    }

    // Store the discount for this line if one was found
    if (applicableDiscount) {
      lineDiscounts.set(line.id, applicableDiscount);
    }
  });

  // If no discounts to apply, return empty operations
  if (lineDiscounts.size === 0) {
    return {
      operations: [],
    };
  }

  // Group cart lines by discount percentage
  const discountGroups = new Map();
  lineDiscounts.forEach((discount, lineId) => {
    if (!discountGroups.has(discount)) {
      discountGroups.set(discount, []);
    }
    discountGroups.get(discount).push({
      cartLine: { id: lineId },
    });
  });

  // Create ONE operation with multiple candidates (one per discount percentage)
  const candidates = Array.from(discountGroups.entries()).map(
    ([percentage, targets]) => ({
      targets,
      value: {
        percentage: {
          value: percentage.toString(),
        },
      },
    }),
  );

  return {
    operations: [
      {
        productDiscountsAdd: {
          selectionStrategy: "ALL",
          candidates,
        },
      },
    ],
  };
};