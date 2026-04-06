'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Share } from 'lucide-react'

export function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const hasDismissed = localStorage.getItem('pwa_prompt_dismissed')
    // Check if the app is already installed/running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone

    if (hasDismissed === 'true' || isStandalone) {
      return
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // If it's iOS and not standalone, show prompt after a short delay
    if (isIosDevice) {
      setTimeout(() => setShowPrompt(true), 3000)
    }

    // Capture the beforeinstallprompt event for Android/Chrome Desktop
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Show out custom install UI
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the native install prompt
    deferredPrompt.prompt()
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa_prompt_dismissed', 'true')
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pb-20 md:pb-6 pointer-events-none flex justify-center"
        >
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gold-primary/20 p-4 w-full max-w-sm pointer-events-auto relative overflow-hidden flex flex-col gap-3">
            <button 
              onClick={handleDismiss}
              className="absolute top-2 left-2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="w-14 h-14 bg-navy-primary rounded-xl flex items-center justify-center text-gold-primary font-bold text-xl shadow-lg shrink-0">
                G.Z.
              </div>
              <div>
                <h3 className="font-bold text-slate-800">تثبيت عيادة الدكتور</h3>
                <p className="text-sm text-slate-500 leading-tight">حمّل التطبيق لتجربة أسرع وأفضل في حجز المواعيد والتواصل.</p>
              </div>
            </div>

            {isIOS ? (
              <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600 flex flex-col gap-2 mt-2">
                <p className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">1</span>
                  اضغط على زر المشاركة <Share className="w-4 h-4 text-blue-500 inline" /> في الأسفل
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">2</span>
                  اختر <strong>إضافة إلى الشاشة الرئيسية</strong> 
                </p>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="w-full bg-navy-primary hover:bg-navy-light text-white font-medium rounded-xl py-3 mt-2 flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-5 h-5" />
                تثبيت التطبيق الآن
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
