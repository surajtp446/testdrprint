import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Sparkles } from 'lucide-react';

const FLEXI_TOYS = [
  { id: 'raccoon', name: 'Mini Raccoon', image: '/products/flexi/raccoons.webp' },
  { id: 'shark', name: 'Baby Shark', image: '/products/flexi/sharks.webp' },
  { id: 'fish', name: 'Flexi Fish', image: '/products/flexi/fish.webp' },
  { id: 'dragon-white', name: 'Light Fury Dragon', image: '/products/flexi/dragon-white.webp' },
  { id: 'caterpillar', name: 'Caterpillar', image: '/products/flexi/caterpillar.webp' },
  { id: 'crocodile', name: 'Crocodile', image: '/products/flexi/crocodile.webp' },
  { id: 'dragon-black', name: 'Toothless Dragon', image: '/products/flexi/dragon-black.webp' },
  { id: 'fox', name: 'Flexi Fox', image: '/products/flexi/fox.webp' },
  { id: 'cat', name: 'Flexi Cat', image: '/products/flexi/cat.webp' },
  { id: 'monkeys', name: 'Monkey Keychain', image: '/products/flexi/monkeys.webp' },
  { id: 'baby-shark', name: 'Mini Shark', image: '/products/flexi/baby-sharks.webp' },
  { id: 'whale-shark', name: 'Whale Shark Keychain', image: '/products/flexi/whale-shark.webp' },
];

const PRICE_EACH = 80;
const PACKS = [
  { qty: 10, price: 499, label: '10 Pack' },
  { qty: 20, price: 699, label: '20 Pack' },
];

export default function FlexiToyModal({ onClose, onAddToCart }) {
  const [quantities, setQuantities] = useState({});
  const [previewIdx, setPreviewIdx] = useState(0);
  const [tab, setTab] = useState('pick');
  const [selectedPack, setSelectedPack] = useState(1); // index into PACKS, default 20-pack

  const setQty = (id, val) => {
    setQuantities(prev => {
      const next = { ...prev };
      if (val <= 0) delete next[id];
      else next[id] = val;
      return next;
    });
  };

  const totalItems = Object.values(quantities).reduce((s, q) => s + q, 0);
  const totalPrice = totalItems * PRICE_EACH;

  const handleOrder = () => {
    if (tab === 'surprise') {
      const pack = PACKS[selectedPack];
      const msg = `Hi Dr.PrinT! I'd like to order:\n\n🎁 Flexi Toy Surprise Mix — ${pack.qty} random pieces\nTotal: ₹${pack.price}\n\nPlease confirm availability!`;
      window.open('https://wa.me/919449214905?text=' + encodeURIComponent(msg), '_blank');
      onClose();
      return;
    }

    const selected = FLEXI_TOYS.filter(t => quantities[t.id] > 0);
    if (selected.length === 0) return;

    const lines = selected.map(t => `• ${t.name} × ${quantities[t.id]}`).join('\n');
    const msg = `Hi Dr.PrinT! I'd like to order Flexi Toys:\n\n${lines}\n\nTotal: ${totalItems} pieces — ₹${totalPrice}\n\nPlease confirm!`;
    window.open('https://wa.me/919449214905?text=' + encodeURIComponent(msg), '_blank');
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }} transition={{ type: 'tween', duration: 0.25 }}
        data-lenis-prevent
        className="relative w-full max-w-3xl max-h-[92vh] bg-[#0a0a0a] border border-white/10 overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0a0a0a] border-b border-white/12">
          <div>
            <p className="text-[12px] tracking-[0.4em] uppercase text-white/55">Dr.PrinT Store</p>
            <h2 className="font-black text-lg">Flexi Toys</h2>
          </div>
          <button onClick={onClose} className="text-white/55 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Image carousel */}
        <div className="relative bg-[#111] overflow-hidden" style={{ height: 280 }}>
          <img
            src={FLEXI_TOYS[previewIdx].image}
            alt={FLEXI_TOYS[previewIdx].name}
            className="w-full h-full object-contain"
          />
          <button onClick={() => setPreviewIdx((previewIdx - 1 + FLEXI_TOYS.length) % FLEXI_TOYS.length)}
            aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 transition-all">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setPreviewIdx((previewIdx + 1) % FLEXI_TOYS.length)}
            aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white p-2 transition-all">
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white/80 text-[12px] font-mono px-2.5 py-1">
            {previewIdx + 1} / {FLEXI_TOYS.length}
          </div>
          <div className="absolute top-3 left-3 bg-white text-black text-[12px] font-black uppercase tracking-widest px-2.5 py-1">
            ₹{PRICE_EACH} each
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="flex gap-1 px-4 py-3 overflow-x-auto bg-[#0d0d0d] border-b border-white/10"
          style={{ scrollbarWidth: 'none' }}>
          {FLEXI_TOYS.map((toy, i) => (
            <button key={toy.id} onClick={() => setPreviewIdx(i)}
              className={`shrink-0 w-14 h-14 border overflow-hidden transition-all ${i === previewIdx ? 'border-white' : 'border-white/10 opacity-60 hover:opacity-90'}`}>
              <img src={toy.image} alt={toy.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button onClick={() => setTab('pick')}
            className={`flex-1 py-3 text-[12px] font-black uppercase tracking-widest transition-all ${tab === 'pick' ? 'text-white border-b-2 border-white' : 'text-white/45 hover:text-white/65'}`}>
            Pick Your Own
          </button>
          <button onClick={() => setTab('surprise')}
            className={`flex-1 py-3 text-[12px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${tab === 'surprise' ? 'text-white border-b-2 border-white' : 'text-white/45 hover:text-white/65'}`}>
            Surprise Mix Packs
          </button>
        </div>

        <div className="p-5">
          {tab === 'pick' ? (
            <>
              <p className="text-white/55 text-[12px] mb-4">Select which toys you want and how many of each. ₹{PRICE_EACH} per piece.</p>

              {/* Toy grid with quantity selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FLEXI_TOYS.map((toy) => {
                  const qty = quantities[toy.id] || 0;
                  return (
                    <div key={toy.id}
                      className={`flex items-center gap-3 p-3 border transition-all ${qty > 0 ? 'border-white/25 bg-white/[0.03]' : 'border-white/8 hover:border-white/15'}`}>
                      <img src={toy.image} alt={toy.name}
                        className="w-12 h-12 object-cover shrink-0 border border-white/10 cursor-pointer"
                        onClick={() => setPreviewIdx(FLEXI_TOYS.indexOf(toy))} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{toy.name}</p>
                        <p className="text-[12px] text-white/50">₹{PRICE_EACH}</p>
                      </div>
                      <div className="flex items-center gap-0 shrink-0">
                        {qty > 0 ? (
                          <>
                            <button onClick={() => setQty(toy.id, qty - 1)}
                              className="w-8 h-8 border border-white/12 text-white/70 hover:border-white/30 transition-all text-sm flex items-center justify-center">
                              <Minus size={12} />
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center text-sm font-bold border-t border-b border-white/12">{qty}</span>
                            <button onClick={() => setQty(toy.id, qty + 1)}
                              className="w-8 h-8 border border-white/12 text-white/70 hover:border-white/30 transition-all text-sm flex items-center justify-center">
                              <Plus size={12} />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setQty(toy.id, 1)}
                            className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border border-white/12 text-white/60 hover:border-white/30 hover:text-white transition-all">
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary + Order */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/60 text-sm">{totalItems} item{totalItems !== 1 ? 's' : ''} selected</span>
                  <span className="text-2xl font-black">₹{totalPrice.toLocaleString()}</span>
                </div>
                <button onClick={handleOrder} disabled={totalItems === 0}
                  className="w-full py-3.5 bg-[#25D366] text-white text-[13px] font-black uppercase tracking-[0.15em] hover:bg-[#20bd5a] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <ShoppingBag size={15} />
                  Order {totalItems} Toy{totalItems !== 1 ? 's' : ''} via WhatsApp
                </button>
              </div>
            </>
          ) : (
            /* Surprise Mix tab */
            <div className="py-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-5 border border-white/15 flex items-center justify-center">
                  <Sparkles size={28} className="text-white/50" />
                </div>
                <h3 className="text-xl font-black mb-2">Surprise Mix Packs</h3>
                <p className="text-white/60 text-sm font-light max-w-sm mx-auto leading-relaxed">
                  We hand-pick a variety of different designs for you. Perfect as gifts, party favours, or collectibles.
                </p>
              </div>

              {/* Pack selector */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {PACKS.map((pack, i) => (
                  <button key={i} onClick={() => setSelectedPack(i)}
                    className={`p-5 border text-left transition-all ${selectedPack === i ? 'border-white bg-white/[0.06]' : 'border-white/12 hover:border-white/25'}`}>
                    <p className="text-[11px] tracking-[0.3em] uppercase text-white/50 mb-1">{pack.label}</p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-black">₹{pack.price}</span>
                      <span className="text-white/35 text-sm line-through">₹{pack.qty * PRICE_EACH}</span>
                    </div>
                    <p className="text-[12px] text-green-400/80">
                      ₹{(pack.price / pack.qty).toFixed(0)}/piece · Save ₹{(pack.qty * PRICE_EACH) - pack.price}
                    </p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 mb-6">
                {FLEXI_TOYS.map((toy, i) => (
                  <div key={i} className="aspect-square border border-white/8 overflow-hidden opacity-60">
                    <img src={toy.image} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              <button onClick={handleOrder}
                className="w-full py-3.5 bg-[#25D366] text-white text-[13px] font-black uppercase tracking-[0.15em] hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2">
                <Sparkles size={15} />
                Order {PACKS[selectedPack].qty} Pieces for ₹{PACKS[selectedPack].price} via WhatsApp
              </button>
              <p className="text-white/40 text-[11px] mt-3 text-center">Mix contents vary based on stock. We guarantee at least {selectedPack === 0 ? '5' : '8'} different designs.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
