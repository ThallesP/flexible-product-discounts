import { useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  Card,
  Button,
  ResourceList,
  ResourceItem,
  Thumbnail,
  Text,
} from "@shopify/polaris";

export default function ProductSelector({ onProductsSelected }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const shopify = useAppBridge();

  const handleSelectProducts = async () => {
    const selected = await shopify.resourcePicker({
      type: "product",
      multiple: true,
    });

    if (selected) {
      setSelectedProducts(selected);
      if (onProductsSelected) {
        onProductsSelected(selected);
      }
    }
  };

  return (
    <Card>
      <Button onClick={handleSelectProducts}>Select Products</Button>

      {selectedProducts.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <ResourceList
            resourceName={{ singular: "product", plural: "products" }}
            items={selectedProducts}
            renderItem={(product) => {
              const { id, title, images } = product;
              const media = images?.[0] ? (
                <Thumbnail source={images[0].originalSrc} alt={title} />
              ) : null;

              return (
                <ResourceItem id={id} media={media}>
                  <Text variant="bodyMd" fontWeight="bold" as="h3">
                    {title}
                  </Text>
                </ResourceItem>
              );
            }}
          />
        </div>
      )}
    </Card>
  );
}
