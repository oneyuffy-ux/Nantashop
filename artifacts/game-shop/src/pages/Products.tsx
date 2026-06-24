import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import { Product, Category } from "@/types";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/products"),
      api.get("/categories"),
    ]).then(([prods, cats]: [Product[], Category[]]) => {
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
    }).catch(() => {
      setProducts([]);
      setCategories([]);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => {
    const matchCat = selectedCat === "all" || p.category_id === selectedCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="shop-container page-bottom-pad pt-5">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          สินค้าทั้งหมด
        </h1>
        <p className="text-muted-foreground text-sm">เลือกสินค้าที่ต้องการซื้อได้เลย</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="ค้นหาสินค้า..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Category chips */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <button
              onClick={() => setSelectedCat("all")}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                selectedCat === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-muted-foreground hover:text-foreground border-border"
              }`}
            >
              ทั้งหมด
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  selectedCat === cat.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-muted-foreground mb-4">
          พบ {filtered.length} สินค้า {search && `· ค้นหา "${search}"`}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="product-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-secondary" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-secondary rounded w-3/4" />
                <div className="h-3 bg-secondary rounded w-1/2" />
                <div className="h-8 bg-secondary rounded-xl mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-base font-medium mb-1">ไม่พบสินค้า</p>
          <p className="text-muted-foreground text-sm">ลองปรับคำค้นหาหรือหมวดหมู่</p>
          {(search || selectedCat !== "all") && (
            <button
              onClick={() => { setSearch(""); setSelectedCat("all"); }}
              className="mt-4 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
