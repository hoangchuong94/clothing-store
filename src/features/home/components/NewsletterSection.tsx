'use client';

import { motion } from 'framer-motion';
import { Mail, ArrowRight } from '@/components/ui/icon';
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
    <section className="relative bg-white py-20 sm:py-32 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="relative overflow-hidden rounded-2xl shadow-xl"
        >
          {/* Background */}
          <div className="absolute inset-0 -z-10">
            {/* Light / Dark gradient */}
            <div className="absolute inset-0 bg-linear-to-r from-cyan-100 via-purple-100 to-pink-100 dark:from-purple-900 dark:via-slate-900 dark:to-cyan-900" />

            {/* Light overlay */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm dark:hidden" />

            {/* Animated glow */}
            <motion.div
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{ duration: 15, repeat: Infinity }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.25)_0%,transparent_50%)]"
            />
          </div>

          {/* Floating blobs */}
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-pink-400/20 blur-3xl dark:bg-pink-500/10"
          />

          {/* Content */}
          <div className="relative px-6 py-12 sm:px-12 sm:py-16">
            {/* Icon */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mx-auto w-fit rounded-full bg-purple-100 p-4 dark:bg-cyan-500/20"
            >
              <Mail size={32} className="text-purple-600 dark:text-cyan-400" />
            </motion.div>

            {/* Title */}
            <h2 className="mt-6 text-center text-3xl font-black sm:text-4xl md:text-5xl">
              <span className="bg-linear-to-r from-slate-900 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-white dark:via-cyan-300 dark:to-blue-300">
                {t('title')}
              </span>
            </h2>

            {/* Description */}
            <p className="mt-4 text-center text-base text-slate-600 sm:text-lg dark:text-slate-300">
              {t('description')}
            </p>

            {/* Form */}
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
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-900 placeholder-slate-400 transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none sm:rounded-r-none dark:border-slate-600 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500"
                />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitted}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-purple-600 to-pink-600 px-6 py-3 font-bold text-white transition-all duration-300 hover:shadow-lg disabled:opacity-50 sm:rounded-l-none dark:from-cyan-500 dark:to-blue-500"
                >
                  {isSubmitted ? (
                    <span>✓ {t('button')}</span>
                  ) : (
                    <>
                      {t('button')}
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </div>

              {/* Checkbox */}
              <div className="mt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="agree"
                  defaultChecked
                  className="h-4 w-4 rounded border-slate-300 accent-purple-600 dark:border-slate-600 dark:accent-cyan-500"
                />
                <label htmlFor="agree" className="text-sm text-slate-600 dark:text-slate-400">
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
