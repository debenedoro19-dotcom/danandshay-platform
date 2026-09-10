import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const GIFT_CARD_PROVIDERS = [
  {
    id: 'apple',
    name: 'Apple Gift Card',
    shortName: 'Apple',
    tag: 'App Store, Apple Music, iTunes',
    color: 'from-gray-800 to-black border-gray-400',
    accent: '#A2AAAD',
    icon: (
      <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 170 170">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.95-10.45-12.16-22.38-15.63-35.79-3.48-13.4-5.21-25.79-5.21-37.16 0-14.58 3.73-26.68 11.19-36.29 7.46-9.61 16.92-14.48 28.38-14.61 4.58 0 9.77 1.25 15.57 3.74 5.8 2.5 9.78 3.79 11.96 3.87 1.96 0 6.05-1.35 12.27-4.06 6.22-2.7 11.39-3.95 15.5-3.74 12.84.65 23.08 5.48 30.73 14.5-11.33 6.86-16.89 16.27-16.67 28.25.22 9.36 3.86 17.18 10.93 23.47 7.07 6.29 15.44 9.87 25.1 10.74-2.18 6.97-4.89 14.38-8.15 22.24zm-30.82-108.9c0-6.75 2.5-13.17 7.51-19.25 5.01-6.08 11.22-9.99 18.63-11.73 1.09 6.97-.65 13.51-5.22 19.62-4.57 6.11-10.99 10.03-19.26 11.75-.43-.13-1.09-.26-1.66-.39z" />
      </svg>
    ),
    placeholder: 'APPL-9942-8812-4411'
  },
  {
    id: 'razergold',
    name: 'Razer Gold',
    shortName: 'Razer Gold',
    tag: 'Razer Gold PIN & Gaming Wallet',
    color: 'from-black via-zinc-900 to-black border-lime-400',
    accent: '#00FF00',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#00FF00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    placeholder: 'RZRG-8841-2290-7714'
  },
  {
    id: 'googleplay',
    name: 'Google Play Gift Card',
    shortName: 'Google Play',
    tag: 'Play Store Credits',
    color: 'from-teal-600 to-emerald-700 border-teal-300',
    accent: '#00875A',
    icon: (
      <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
        <path d="M3.609 1.814L13.792 12 3.61 22.186c-.352-.375-.567-.89-.567-1.464V3.278c0-.574.215-1.089.566-1.464zm11.604 11.607l2.585 2.585-11.246 6.49 8.661-9.075zm2.585-2.842l2.368 1.368c.732.423.732 1.111 0 1.534l-2.368 1.368-2.367-2.367 2.367-1.903zM6.552 3.509l11.246 6.49-2.585 2.585-8.661-9.075z" />
      </svg>
    ),
    placeholder: 'GPLY-2294-8841-0021'
  },
  {
    id: 'steam',
    name: 'Steam Card',
    shortName: 'Steam Card',
    tag: 'Steam Wallet & PC Games',
    color: 'from-[#171a21] via-[#1b2838] to-[#2a475e] border-sky-400',
    accent: '#66c0f4',
    icon: (
      <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
        <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 14.819C1.948 20.07 6.786 24 12 24c6.627 0 12-5.373 12-12S18.627 0 11.979 0zm-3.612 16.924l-1.92-.794c.334.619.98 1.042 1.733 1.042.317 0 .614-.078.879-.213-.195-.011-.47-.014-.692-.035zm6.157-8.014c0-1.666 1.353-3.02 3.02-3.02 1.666 0 3.02 1.354 3.02 3.02 0 1.666-1.354 3.02-3.02 3.02-1.667 0-3.02-1.354-3.02-3.02z" />
      </svg>
    ),
    placeholder: 'STM-7721-8843-1190'
  }
];

const CheckoutForm = ({ items = [], total = 0, onSubmit, onCancel, type = 'ticket' }) => {
  const [cards, setCards] = useState([
    {
      id: 1,
      provider: GIFT_CARD_PROVIDERS[0],
      code: '',
      image: null,
      fileName: '',
      amount: ''
    }
  ]);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddCard = () => {
    const nextId = cards.length > 0 ? Math.max(...cards.map(c => c.id)) + 1 : 1;
    // Default next provider to next in list
    const nextProvider = GIFT_CARD_PROVIDERS[cards.length % GIFT_CARD_PROVIDERS.length];
    setCards([
      ...cards,
      {
        id: nextId,
        provider: nextProvider,
        code: '',
        image: null,
        fileName: '',
        amount: ''
      }
    ]);
    setFormError('');
  };

  const handleRemoveCard = (index) => {
    if (cards.length <= 1) return;
    setCards(cards.filter((_, i) => i !== index));
    setFormError('');
  };

  const handleProviderSelect = (index, provider) => {
    const updated = [...cards];
    updated[index].provider = provider;
    setCards(updated);
    setFormError('');
  };

  const handleCodeChange = (index, val) => {
    const updated = [...cards];
    updated[index].code = val.toUpperCase();
    setCards(updated);
    setFormError('');
  };

  const handleAmountChange = (index, val) => {
    const updated = [...cards];
    updated[index].amount = val;
    setCards(updated);
  };

  const handleImageFile = (index, file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError(`Card #${index + 1}: Please upload a valid image file (.jpg, .png, .webp)`);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setFormError(`Card #${index + 1}: Image file is too large (maximum 15MB)`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        if (img.width < 100 || img.height < 60) {
          setFormError(`Card #${index + 1}: Image resolution is too low. Please upload a clear photo of the gift card.`);
          return;
        }

        try {
          // Client-side canvas compression: limit max dimension to 1600px, 85% quality JPEG
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const MAX_DIM = 1600;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

          const updated = [...cards];
          updated[index].image = optimizedDataUrl;
          updated[index].fileName = file.name;
          setCards(updated);
          setFormError('');
        } catch (canvasErr) {
          // Fallback to original dataUrl if canvas fails
          const updated = [...cards];
          updated[index].image = dataUrl;
          updated[index].fileName = file.name;
          setCards(updated);
          setFormError('');
        }
      };
      img.onerror = () => {
        setFormError(`Card #${index + 1}: Unable to read image file. Please choose another photo.`);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index) => {
    const updated = [...cards];
    updated[index].image = null;
    updated[index].fileName = '';
    setCards(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all cards
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      const cleanCode = c.code.replace(/[^A-Z0-9]/g, '');
      if (!cleanCode || cleanCode.length < 6) {
        setFormError(`Card #${i + 1} (${c.provider.name}): Please enter a valid card number as depicted on your card.`);
        return;
      }
      if (!c.image) {
        setFormError(`Card #${i + 1} (${c.provider.name}): Please upload a clear photo depicting the gift card number.`);
        return;
      }
    }

    setFormError('');
    setLoading(true);

    try {
      const payload = {
        giftCards: cards.map(c => ({
          provider: c.provider.name,
          code: c.code.trim(),
          image: c.image,
          amount: c.amount || null
        })),
        giftCardProvider: [...new Set(cards.map(c => c.provider.name))].join(', '),
        giftCardCode: cards.map((c, i) => `Card ${i + 1} [${c.provider.name}${c.amount ? ' ($' + c.amount + ')' : ''}]: ${c.code.trim()}`).join('\n'),
        giftCardImage: cards[0].image,
        giftCardImages: cards.map(c => c.image).filter(Boolean)
      };

      await onSubmit(payload);
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('Checkout submission error:', err);
      const serverMsg = err.response?.data?.message;
      const networkMsg = err.message;
      setFormError(serverMsg || (networkMsg === 'Network Error' ? 'Network error: could not connect to server.' : (networkMsg || 'Error submitting gift card(s). Please try again.')));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-midnight/85 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden relative border border-gold/30 my-auto max-h-[94vh] flex flex-col"
      >
        <button 
          onClick={onCancel}
          disabled={loading}
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-charcoal transition-colors z-20 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {!success ? (
          <div className="overflow-y-auto p-5 sm:p-7 custom-scrollbar space-y-4 flex-1">
            
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-gold/20 text-gold-dark flex items-center justify-center font-bold text-xl flex-shrink-0">
                🎁
              </div>
              <div className="pr-8">
                <h2 className="text-xl sm:text-2xl font-display font-bold text-charcoal leading-tight">
                  Gift Card Payment & Verification
                </h2>
                <p className="text-xs text-charcoal/60">
                  Accepting Apple, Razer Gold, Google Play & Steam Card • Split Across Multiple Cards
                </p>
              </div>
            </div>
            
            {/* Order Items & Total Summary */}
            <div className="bg-cream/70 border border-gold/20 p-3.5 rounded-xl">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal/70 mb-2">
                <span>Selected Items</span>
                <span>Amount</span>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-1 mb-2.5">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-charcoal font-medium truncate pr-4">{item.name}</span>
                    <span className="text-charcoal font-bold font-mono">
                      ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gold/30 pt-2 flex justify-between items-center">
                <div>
                  <span className="font-bold text-charcoal text-xs uppercase tracking-wider">Total Due:</span>
                  <span className="text-[10px] text-gray-500 ml-2 font-mono">
                    ({cards.length} Card{cards.length > 1 ? 's' : ''} Attached)
                  </span>
                </div>
                <span className="text-xl font-display font-extrabold text-midnight">
                  ${typeof total === 'number' ? total.toFixed(2) : total}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Dynamic Gift Cards List */}
              <div className="space-y-4">
                {cards.map((card, idx) => (
                  <div 
                    key={card.id} 
                    className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50/70 relative transition-all hover:border-gold/50"
                  >
                    {/* Card Item Header */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gold text-midnight text-[11px] font-extrabold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                          Gift Card #{idx + 1} {idx === 0 ? '(Primary)' : '(Additional Card)'}
                        </span>
                      </div>

                      {cards.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCard(idx)}
                          className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          ✕ Remove Card
                        </button>
                      )}
                    </div>

                    {/* Provider Pills for this card */}
                    <div className="mb-3">
                      <label className="block text-[10px] font-mono font-bold text-charcoal/70 uppercase tracking-wider mb-1.5">
                        Select Provider:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {GIFT_CARD_PROVIDERS.map((provider) => {
                          const isSelected = card.provider.id === provider.id;
                          return (
                            <button
                              key={provider.id}
                              type="button"
                              onClick={() => handleProviderSelect(idx, provider)}
                              className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 cursor-pointer ${
                                isSelected 
                                  ? 'border-gold bg-gold/15 ring-2 ring-gold/40 shadow-sm' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded flex items-center justify-center text-white bg-gradient-to-br ${provider.color} flex-shrink-0 text-xs`}>
                                {provider.icon}
                              </div>
                              <div className="text-[11px] font-bold text-charcoal truncate">{provider.shortName || provider.name.replace(' Gift Card', '')}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Inputs: Card Code & Amount */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-mono font-bold text-charcoal/70 uppercase tracking-wider mb-1">
                          Card Code / Number:
                        </label>
                        <input 
                          type="text" 
                          value={card.code}
                          onChange={(e) => handleCodeChange(idx, e.target.value)}
                          required
                          placeholder={card.provider.placeholder}
                          className="w-full px-3 py-2 font-mono text-xs uppercase tracking-wider border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold text-charcoal/70 uppercase tracking-wider mb-1">
                          Card Value ($):
                        </label>
                        <input 
                          type="number" 
                          value={card.amount}
                          onChange={(e) => handleAmountChange(idx, e.target.value)}
                          placeholder="e.g. 200"
                          className="w-full px-3 py-2 font-mono text-xs border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                      </div>
                    </div>

                    {/* Photo Uploader for this card */}
                    <div>
                      <input 
                        type="file" 
                        accept="image/*"
                        id={`gift-card-file-${card.id}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFile(idx, file);
                        }}
                        className="hidden"
                      />

                      {!card.image ? (
                        <div 
                          onClick={() => document.getElementById(`gift-card-file-${card.id}`)?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleImageFile(idx, file);
                          }}
                          className="border-2 border-dashed border-gray-300 hover:border-gold hover:bg-gold/5 bg-white rounded-lg p-3 text-center cursor-pointer transition-all"
                        >
                          <div className="flex items-center justify-center gap-2 text-xs font-bold text-charcoal">
                            <span>📸</span>
                            <span>Upload Photo of Card #{idx + 1}</span>
                            <span className="text-rose text-[10px] font-bold">*Required</span>
                          </div>
                          <p className="text-[10px] text-charcoal/60 mt-0.5">
                            Depicting the card number for manual admin authentication
                          </p>
                        </div>
                      ) : (
                        <div className="border border-gold/40 bg-gold/5 rounded-lg p-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-12 h-9 rounded overflow-hidden border border-gold/50 flex-shrink-0 bg-black">
                              <img 
                                src={card.image} 
                                alt={`Card #${idx + 1} Proof`} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-charcoal truncate">{card.fileName || `card-${idx + 1}.jpg`}</div>
                              <div className="text-[9px] font-mono text-green-700 font-bold">Photo Attached ✓ Card Number Depicted</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => document.getElementById(`gift-card-file-${card.id}`)?.click()}
                              className="text-xs text-gold-dark hover:underline font-bold px-1.5 py-0.5 cursor-pointer"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="text-xs text-red-600 hover:text-red-800 font-bold px-1.5 py-0.5 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Another Card Button */}
              <button
                type="button"
                onClick={handleAddCard}
                className="w-full py-2.5 px-4 border-2 border-dashed border-gold hover:border-gold-dark bg-gold/5 hover:bg-gold/10 text-gold-dark font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>➕ Add Another Gift Card (Split Payment across 2+ cards)</span>
              </button>

              {/* Form Error Banner */}
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 shadow-sm">
                  <span className="text-sm flex-shrink-0">⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* Admin Workflow Notice */}
              <div className="bg-midnight text-white p-3 rounded-xl text-xs space-y-1">
                <div className="font-bold text-gold flex items-center gap-1.5">
                  <span>🛡️ Automated Admin Authentication Workflow</span>
                </div>
                <p className="text-cream/80 text-[11px] leading-relaxed">
                  Every payment card is reviewed by an administrator. Upon photo verification of your gift card number(s), your reservation is confirmed and official admission passes are activated in your account.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-gold text-midnight font-extrabold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-gold/30 transition-all flex justify-center items-center gap-2 text-xs sm:text-sm uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-midnight" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading & Submitting {cards.length} Card{cards.length > 1 ? 's' : ''}...
                  </span>
                ) : (
                  <>
                    <span>Submit {cards.length} Gift Card{cards.length > 1 ? 's' : ''} for Approval (${typeof total === 'number' ? total.toFixed(2) : total})</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center flex-1 my-auto">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 border-2 border-amber-400 shadow-md text-amber-800 text-2xl">
              ⏳
            </div>
            
            <h2 className="text-2xl font-display font-bold text-charcoal mb-1">
              Payment Submitted for Approval!
            </h2>
            <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-mono text-xs font-bold mb-3 uppercase tracking-wider">
              Status: Pending Verification ({cards.length} Card{cards.length > 1 ? 's' : ''})
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-5 max-w-sm leading-relaxed">
              Your <strong>{cards.length} gift card{cards.length > 1 ? 's' : ''}</strong> and uploaded photo proof have been received. An instant notification has been dispatched to the executive administration team (<code className="text-gold-dark font-bold font-mono">hannanbrice1@gmail.com</code>) for rapid authentication.
            </p>
            
            <div className="bg-cream border border-gold/30 rounded-xl p-3 mb-6 w-full max-w-sm text-xs text-charcoal/80 space-y-2 text-left">
              {cards.map((c, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gold/20 pb-1.5 last:border-b-0 last:pb-0">
                  <div>
                    <span className="font-bold text-midnight">Card #{i + 1}: {c.provider.name}</span>
                    {c.amount && <span className="text-[10px] text-gray-500 ml-1">(${c.amount})</span>}
                  </div>
                  <span className="font-mono text-[11px] font-bold text-gold-dark">{c.code}</span>
                </div>
              ))}
              <div className="pt-1 text-center font-bold text-green-700 text-[11px]">
                ✓ All {cards.length} Card Photo Proofs Attached
              </div>
            </div>

            <button 
              onClick={onCancel}
              className="px-8 py-3 bg-midnight hover:bg-black text-gold font-bold rounded-xl transition-colors shadow-md text-xs uppercase tracking-wider cursor-pointer"
            >
              Done & View Order
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CheckoutForm;
