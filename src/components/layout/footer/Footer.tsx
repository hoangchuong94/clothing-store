'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Heart,
  TwitterIcon,
  FacebookIcon,
  YoutubeIcon,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from '@/components/ui/icon';

export function Footer() {
  const t = useTranslations('footer');

  const footerLinks = {
    shop: [
      { label: t('shop.newArrivals'), href: '#' },
      { label: t('shop.bestSellers'), href: '#' },
      { label: t('shop.allCollections'), href: '#' },
      { label: t('shop.limitedEdition'), href: '#' },
    ],
    company: [
      { label: t('company.about'), href: '#' },
      { label: t('company.careers'), href: '#' },
      { label: t('company.blog'), href: '#' },
      { label: t('company.press'), href: '#' },
    ],
    support: [
      { label: t('support.contact'), href: '#' },
      { label: t('support.faq'), href: '#' },
      { label: t('support.shipping'), href: '#' },
      { label: t('support.returns'), href: '#' },
    ],
    legal: [
      { label: t('legal.privacy'), href: '#' },
      { label: t('legal.terms'), href: '#' },
      { label: t('legal.cookies'), href: '#' },
      { label: t('legal.accessibility'), href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Heart, href: '#', label: t('social.instagram') },
    { icon: TwitterIcon, href: '#', label: t('social.twitter') },
    { icon: FacebookIcon, href: '#', label: t('social.facebook') },
    { icon: YoutubeIcon, href: '#', label: t('social.youtube') },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="border-border bg-background relative overflow-hidden border-t">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-teal-400/70 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(20,184,166,0.1),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(244,63,94,0.08),transparent_24%)]" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-5"
        >
          <motion.div variants={itemVariants} className="col-span-2 sm:col-span-1">
            <h3 className="text-2xl font-black">
              <span className="bg-linear-to-r from-teal-500 via-amber-400 to-rose-500 bg-clip-text text-transparent">
                CYBER
              </span>
            </h3>

            <div className="mt-6 space-y-3">
              {[
                { icon: Mail, label: 'hello@cyberbrand.com', href: 'mailto:hello@cyberbrand.com' },
                { icon: Phone, label: '+1 (234) 567-890', href: 'tel:+1234567890' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    whileHover={{ x: 4 }}
                    className="text-muted-foreground flex items-center gap-3 text-sm transition-colors hover:text-teal-600 dark:hover:text-teal-300"
                  >
                    <Icon size={16} />
                    <a href={item.href}>{item.label}</a>
                  </motion.div>
                );
              })}

              <div className="text-muted-foreground flex items-center gap-3 text-sm">
                <MapPin size={16} />
                <span>New York, USA</span>
              </div>
            </div>
          </motion.div>

          {[
            { title: t('shop.title'), links: footerLinks.shop },
            { title: t('company.title'), links: footerLinks.company },
            { title: t('support.title'), links: footerLinks.support },
            { title: t('legal.title'), links: footerLinks.legal },
          ].map((section, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <h4 className="text-foreground font-bold">{section.title}</h4>

              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <motion.div whileHover={{ x: 4 }}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground text-sm transition-colors hover:text-teal-600 dark:hover:text-teal-300"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <div className="via-border my-8 h-px bg-linear-to-r from-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-between gap-6 sm:flex-row"
        >
          <p className="text-muted-foreground text-center text-sm sm:text-left">{t('copyright')}</p>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="border-border text-muted-foreground flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:border-teal-400/60 hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-300"
                >
                  <Icon size={18} />
                </motion.a>
              );
            })}
          </div>

          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <span>Accept:</span>
            {['Visa', 'Bank', 'Wallet'].map((label) => (
              <span
                key={label}
                className="border-border bg-card text-card-foreground rounded-full border px-2 py-1 text-[11px] font-medium"
              >
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed right-8 bottom-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-teal-500 to-rose-500 text-white shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/25"
      >
        <ArrowRight className="h-5 w-5 -rotate-90" />
      </motion.button>
    </footer>
  );
}
