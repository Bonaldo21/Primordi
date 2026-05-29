'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Produto } from '@/lib/types';
import { formatCurrency, getProdutoImagem } from '@/lib/format';
import { motion } from 'framer-motion';

interface ProductCardProps {
  produto: Produto;
  index?: number;
}

export function ProductCard({ produto, index = 0 }: ProductCardProps) {
  const imgUrl = getProdutoImagem(produto);
  const hasPromo = (produto?.precoPromocional ?? 0) > 0 && (produto?.precoPromocional ?? 0) < (produto?.preco ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/produto/${produto?.slug ?? ''}`} className="group block">
        <div className="relative aspect-square bg-secondary/30 rounded-lg overflow-hidden mb-3">
          <Image
            src={imgUrl}
            alt={produto?.nome ?? 'Produto'}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {hasPromo && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
              Promoção
            </span>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{produto?.categoria?.nome ?? ''}</p>
          <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{produto?.nome ?? ''}</h3>
          <div className="flex items-center gap-2">
            {hasPromo ? (
              <>
                <span className="text-sm font-semibold text-primary">{formatCurrency(produto?.precoPromocional)}</span>
                <span className="text-xs text-muted-foreground line-through">{formatCurrency(produto?.preco)}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-foreground">{formatCurrency(produto?.preco)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
