'use client';

import { motion, useViewportScroll, useTransform } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function AnimatedSection({
  children,
  delay = 0,
  duration = 0.8,
  className = '',
}: AnimatedSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

interface ParallaxProps {
  children: ReactNode;
  className?: string;
}

export function Parallax({ children, className = '' }: ParallaxProps) {
  const { scrollY } = useViewportScroll();
  const y = useTransform(scrollY, (value) => value * 0.5);

  return (
    <motion.div style={{ y }} className={`relative ${className}`}>
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.2,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface FadeInItemProps {
  children: ReactNode;
  className?: string;
}

export function FadeInItem({ children, className = '' }: FadeInItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export function HoverScale({ children, scale = 1.05, className = '' }: HoverScaleProps) {
  return (
    <motion.div whileHover={{ scale }} className={className}>
      {children}
    </motion.div>
  );
}
