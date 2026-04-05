'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface FAQ {
  id: string
  question: string
  answer: string
  sort_order?: number
}

interface FAQSectionProps {
  faqs: FAQ[]
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleOpen = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 w-full">
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx
          
          return (
            <div 
              key={idx} 
              className={`border border-surface2 rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-surface shadow-glow-sm' : 'bg-surface-light/50 hover:bg-surface-light border-transparent'}`}
            >
              <button
                onClick={() => toggleOpen(idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-right"
              >
                <h3 className={`font-bold py-1 ${isOpen ? 'text-gold' : 'text-text'}`}>
                  {faq.question}
                </h3>
                <div className={`shrink-0 ml-4 p-2 rounded-full transition-colors ${isOpen ? 'bg-gold/10' : 'bg-surface2'}`}>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-gold' : 'text-muted'}`} />
                </div>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-6 text-muted text-sm md:text-base leading-relaxed border-t border-surface2/50 pt-4 mt-2">
                  {faq.answer}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
