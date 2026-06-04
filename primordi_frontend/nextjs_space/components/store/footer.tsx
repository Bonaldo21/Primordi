'use client';

import Link from 'next/link';

export function StoreFooter() {
  return (
    <footer className="bg-secondary/50 border-t border-border/50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight mb-3">Primor</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Produtos de couro artesanais feitos à mão com dedicação e qualidade excepcional.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-3">Navegação</h4>
            <div className="flex flex-col gap-2">
              <Link href="/catalogo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Catálogo</Link>
              <Link href="/sobre" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sobre</Link>
              <Link href="/carrinho" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Carrinho</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-3">Contato</h4>
            <p className="text-sm text-muted-foreground">contato@primor.com.br</p>
          </div>
        </div>
        <div className="border-t border-border/50 mt-10 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Primor. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
