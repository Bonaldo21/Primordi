'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Gem, Heart, Leaf, Award } from 'lucide-react';

export default function SobrePage() {
  const values = [
    { icon: Gem, title: 'Artesanato', desc: 'Cada produto é feito à mão por artesãos experientes.' },
    { icon: Heart, title: 'Paixão', desc: 'Amor e dedicação em cada peça criada.' },
    { icon: Leaf, title: 'Sustentabilidade', desc: 'Couro de origem responsável e processos ecológicos.' },
    { icon: Award, title: 'Durabilidade', desc: 'Feitos para durar gerações.' },
  ];

  return (
    <div className="py-16 sm:py-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="text-xs text-primary uppercase tracking-[0.3em] mb-3">Sobre nós</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight mb-4">Primordi</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">Tradição e modernidade em cada peça de couro artesanal</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-20">
          <div className="relative aspect-[3/2] rounded-lg overflow-hidden"><Image src="https://cdn.abacus.ai/images/7609f3a9-f315-45c1-83de-80de24a2b89e.png" alt="Artesão" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div>
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Nossa História</h2>
            <p className="text-muted-foreground leading-relaxed">A Primordi nasceu da paixão por criar produtos de couro que transcendem o tempo. Fundada por artesãos com décadas de experiência, nossa marca combina técnicas tradicionais com design contemporâneo e minimalista.</p>
            <p className="text-muted-foreground leading-relaxed">Cada peça que sai do nosso ateliê carrega consigo horas de trabalho manual dedicado, desde a seleção cuidadosa do couro até o último ponto de costura.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card rounded-lg p-6 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <v.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-medium mb-2">{v?.title}</h3>
              <p className="text-sm text-muted-foreground">{v?.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
