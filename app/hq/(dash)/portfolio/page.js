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
          <Button variant="secondary" size="sm" disabled title="Not available in v1">
            Add product
          </Button>
        }
      />
      <div className="hq-page-content hq-page-content--grid hq-grid-3">
        {products.map((p, i) => (
          <ProductCard key={i} {...p} />
        ))}
      </div>
    </div>
  );
}
