import { TopBar } from "@/components/hq/TopBar";
import { Button } from "@/components/hq/Button";
import { ProductCard } from "@/components/hq/ProductCard";
import { products } from "@/lib/hq/mock-data";

export default function PortfolioPage() {
  return (
    <div>
      <TopBar
        title="Portfolio"
        subtitle="SookLabs product suite — live products and the development pipeline."
        actions={
          <Button variant="secondary" size="sm">
            Add product
          </Button>
        }
      />
      <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {products.map((p, i) => (
          <ProductCard key={i} {...p} />
        ))}
      </div>
    </div>
  );
}
