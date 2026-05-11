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
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-5"
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="col-span-2 sm:col-span-1">
            <h3 className="text-2xl font-black">
              <span className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-cyan-400 dark:to-blue-400">
                CYBER
              </span>
            </h3>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <motion.div
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 text-sm text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-cyan-400"
              >
                <Mail size={16} />
                <a href="mailto:hello@cyberbrand.com">hello@cyberbrand.com</a>
              </motion.div>

              <motion.div
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 text-sm text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-cyan-400"
              >
                <Phone size={16} />
                <a href="tel:+1234567890">+1 (234) 567-890</a>
              </motion.div>

              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                <MapPin size={16} />
                <span>New York, USA</span>
              </div>
            </div>
          </motion.div>

          {/* Links */}
          {[
            { title: t('shop.title'), links: footerLinks.shop },
            { title: t('company.title'), links: footerLinks.company },
            { title: t('support.title'), links: footerLinks.support },
            { title: t('legal.title'), links: footerLinks.legal },
          ].map((section, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <h4 className="font-bold text-slate-900 dark:text-white">{section.title}</h4>

              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <motion.div whileHover={{ x: 4 }}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-cyan-400"
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

        {/* Divider */}
        <div className="my-8 h-px bg-linear-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700" />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-between gap-6 sm:flex-row"
        >
          {/* Copyright */}
          <p className="text-center text-sm text-slate-500 sm:text-left">{t('copyright')}</p>

          {/* Social */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:border-purple-500 hover:bg-purple-500/10 hover:text-purple-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-cyan-500 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-400"
                >
                  <Icon size={18} />
                </motion.a>
              );
            })}
          </div>

          {/* Payment */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Accept:</span>
            {['💳', '🏦', '📱'].map((icon, i) => (
              <span key={i} className="text-base">
                {icon}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Back to top */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed right-8 bottom-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-2xl dark:from-cyan-500 dark:to-blue-500"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth={2} d="M19 14l-7-7-7 7m7-7v12" />
        </svg>
      </motion.button>
    </footer>
  );
}
