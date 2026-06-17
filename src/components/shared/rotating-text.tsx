"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RotatingTextProps {
  texts: string[];
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center";
  mainClassName?: string;
}

/**
 * Texto que troca sozinho, com as letras subindo/saindo (estilo React Bits),
 * porém usando framer-motion (já no projeto) e classes locais — sem CSS extra.
 */
export function RotatingText({
  texts,
  rotationInterval = 2400,
  staggerDuration = 0.022,
  staggerFrom = "last",
  mainClassName,
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  const letras = useMemo(() => Array.from(texts[index] ?? ""), [texts, index]);

  const delay = useCallback(
    (i: number, total: number) => {
      if (staggerFrom === "last") return (total - 1 - i) * staggerDuration;
      if (staggerFrom === "center") {
        const c = Math.floor(total / 2);
        return Math.abs(c - i) * staggerDuration;
      }
      return i * staggerDuration;
    },
    [staggerFrom, staggerDuration],
  );

  useEffect(() => {
    if (texts.length <= 1) return;
    const id = setInterval(
      () => setIndex((v) => (v + 1) % texts.length),
      rotationInterval,
    );
    return () => clearInterval(id);
  }, [texts.length, rotationInterval]);

  return (
    <motion.span
      layout
      transition={{ type: "spring", damping: 30, stiffness: 400 }}
      className={cn("relative inline-flex overflow-hidden align-bottom", mainClassName)}
    >
      {/* acessibilidade/SEO: texto legível para leitores de tela e busca */}
      <span className="sr-only">{texts[index]}</span>

      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={index} aria-hidden className="inline-flex" layout>
          {letras.map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 400,
                delay: delay(i, letras.length),
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
