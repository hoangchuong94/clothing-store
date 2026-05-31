'use client';

import { motion } from 'framer-motion';
import { Mail, ArrowRight, Check } from '@/components/ui/icon';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function NewsletterSection() {
  const t = useTranslations('home.newsletter');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setEmail('');
      setIsSubmitted(false);
    }, 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="border-border bg-background relative border-t py-20 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="border-border bg-card relative overflow-hidden rounded-2xl border shadow-lg shadow-rose-500/10"
        >
          <div className="bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.14),transparent_34%),linear-gradient(to_bottom,theme(colors.card),theme(colors.muted/0.3))] absolute inset-0 -z-10" />

          <div className="relative px-6 py-12 sm:px-12 sm:py-16">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mx-auto w-fit rounded-full bg-rose-50 p-4 shadow-sm dark:bg-rose-400/10"
            >
              <Mail size={32} className="text-rose-500" />
            </motion.div>

            <h2 className="text-foreground mt-6 text-center text-3xl font-black sm:text-4xl md:text-5xl">
              {t('title')}
            </h2>

            <p className="text-muted-foreground mt-4 text-center text-base sm:text-lg">
              {t('description')}
            </p>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mx-auto mt-8 max-w-md"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('placeholder')}
                  required
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground flex-1 rounded-lg border px-4 py-3 font-medium transition-all focus:border-rose-400 focus:ring-1 focus:ring-rose-400 focus:outline-none sm:rounded-r-none"
                />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitted}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-rose-500 to-amber-500 px-6 py-3 font-bold text-white transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/20 disabled:opacity-50 sm:rounded-l-none"
                >
                  {isSubmitted ? (
                    <>
                      <Check size={18} />
                      {t('button')}
                    </>
                  ) : (
                    <>
                      {t('button')}
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="agree"
                  defaultChecked
                  className="border-input h-4 w-4 rounded accent-rose-500"
                />
                <label htmlFor="agree" className="text-muted-foreground text-sm">
                  I agree to receive marketing emails (we hate spam too)
                </label>
              </div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
