import { Flame, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { useLocation } from "wouter";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const [, setLocation] = useLocation();

  const discount = product.show_fake_price && product.fake_price
    ? Math.round((1 - product.real_price / product.fake_price) * 100)
    : null;

  const imgSrc = product.image_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80";
  const outOfStock = (product.stock ?? 0) === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div
        className="relative overflow-hidden bg-secondary cursor-pointer aspect-[4/3]"
        onClick={() => setLocation(`/products/${product.id}`)}
      >
        <img
          src={imgSrc}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${outOfStock ? "opacity-50 grayscale" : ""}`}
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.hot_badge && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-500/90 text-white text-[10px] font-bold shadow">
              <Flame className="w-2.5 h-2.5" /> ขายดี
            </span>
          )}
          {discount && !outOfStock && (
            <span className="px-1.5 py-0.5 rounded-full bg-green-500/90 text-white text-[10px] font-bold shadow">
              -{discount}%
            </span>
          )}
        </div>

        {/* Out of stock */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="px-3 py-1.5 rounded-lg border-2 border-red-500/70 bg-black/60">
              <p className="text-red-400 font-bold text-xs">สินค้าหมด</p>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <h3
          className="font-semibold text-foreground text-sm leading-snug line-clamp-2 cursor-pointer hover:text-primary transition-colors flex-1"
          onClick={() => setLocation(`/products/${product.id}`)}
        >
          {product.name}
        </h3>

        <div className="flex items-end justify-between">
          <div>
            {product.show_fake_price && product.fake_price && (
              <p className="text-[11px] text-muted-foreground line-through leading-none mb-0.5">
                ฿{product.fake_price.toLocaleString()}
              </p>
            )}
            <p className="text-base font-extrabold text-primary leading-none">
              ฿{product.real_price.toLocaleString()}
            </p>
          </div>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${outOfStock ? "bg-red-500/15 text-red-400" : "bg-green-500/15 text-green-400"}`}>
            {outOfStock ? "หมด" : `${product.stock ?? 0} ชิ้น`}
          </span>
        </div>

        {outOfStock ? (
          <button
            disabled
            className="w-full py-2 rounded-xl text-xs font-semibold bg-secondary text-muted-foreground border border-border cursor-not-allowed opacity-70"
          >
            สินค้าหมด
          </button>
        ) : (
          <button
            onClick={() => setLocation(`/products/${product.id}`)}
            className="w-full py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow shadow-primary/20"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            ซื้อสินค้า
          </button>
        )}
      </div>
    </motion.div>
  );
}
