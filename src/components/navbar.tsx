"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { menuLinks } from "@/lib/constants";
import { ModeToggle } from "./theme-mode-toggler";
import { CommandMenu } from "./command-menu";

const Navbar = () => {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsScrolled(window.scrollY > 10);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Check auth status
    fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const allLinks: { name: string; href: string; shortName?: string }[] = [
    ...menuLinks,
    { name: "Verify Certificate", href: "/verify", shortName: "Verify" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-out">
        <div
          className={cn(
            "mx-auto transition-all duration-500 ease-out",
            isScrolled ? "pt-3 px-4 max-w-7xl" : "pt-0 px-0 max-w-full"
          )}
        >
          <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn(
              "flex items-center justify-between transition-all duration-500 ease-out",
              isScrolled
                ? "bg-background/80 dark:bg-zinc-950/75 backdrop-blur-xl px-4 sm:px-6 py-2 rounded-full border border-border/80 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.37)]"
                : "bg-background/70 backdrop-blur-md border-b border-border/60 px-6 py-4 lg:px-12"
            )}
          >
            {/* Logo */}
            <Link
              href="/"
              aria-label="home"
              className="flex items-center space-x-2 z-50 group flex-shrink-0"
              onClick={() => setMenuState(false)}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Logo />
              </motion.div>
            </Link>

            {/* Desktop Navigation with Aceternity sliding pill */}
            <div className="hidden lg:flex items-center flex-shrink-0">
              <ul
                className="flex items-center gap-0.5 xl:gap-1 p-1 bg-muted/40 dark:bg-white/5 rounded-full border border-border/40 dark:border-white/5 backdrop-blur-sm"
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {allLinks.map((item, idx) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href} className="relative">
                      <Link
                        href={item.href}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        className={cn(
                          "relative px-2.5 xl:px-4 py-1.5 text-xs font-medium rounded-full transition-colors duration-200 block z-10 whitespace-nowrap",
                          isActive
                            ? "text-primary dark:text-white font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {/* Aceternity style sliding hover pill */}
                        {hoveredIdx === idx && (
                          <motion.span
                            layoutId="navHoverPill"
                            className="absolute inset-0 bg-primary/10 dark:bg-white/15 rounded-full -z-10 shadow-sm"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.35,
                            }}
                          />
                        )}

                        {/* Active Indicator Dot */}
                        {isActive && !hoveredIdx && (
                          <motion.span
                            layoutId="navActivePill"
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary dark:bg-emerald-400 rounded-full"
                            transition={{
                              type: "spring",
                              bounce: 0.25,
                              duration: 0.4,
                            }}
                          />
                        )}

                        <span className="hidden xl:inline">{item.name}</span>
                        <span className="inline xl:hidden">{item.shortName || item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 flex-shrink-0">
              <CommandMenu />
              <ModeToggle />

              {user ? (
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button asChild variant="ghost" size="sm" className="hover:bg-primary/10 rounded-full text-xs font-medium px-2.5 xl:px-3">
                    <Link href="/student">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />
                      Dashboard
                    </Link>
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Button asChild variant="ghost" size="sm" className="hover:bg-primary/10 rounded-full text-xs font-medium px-2.5 xl:px-3">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </motion.div>
              )}

              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full text-xs font-semibold px-3.5 xl:px-4 bg-gradient-to-r from-primary via-indigo-500 to-violet-600 hover:opacity-95 text-white shadow-md shadow-primary/20 border-0 whitespace-nowrap"
                >
                  <Link href="/auth/signup">Join Club</Link>
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuState(!menuState)}
              aria-label={menuState ? "Close Menu" : "Open Menu"}
              className="relative z-50 block p-2 text-foreground lg:hidden rounded-lg hover:bg-muted/50"
            >
              {menuState ? <X className="size-6" /> : <Menu className="size-6" />}
            </motion.button>
          </motion.nav>
        </div>
      </header>

      {/* Mobile Menu Overlay with Framer Motion AnimatePresence */}
      <AnimatePresence>
        {menuState && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-background/95 dark:bg-zinc-950/95 backdrop-blur-2xl lg:hidden flex flex-col justify-between pt-28 pb-8 px-8"
          >
            <ul className="flex flex-col gap-4 text-lg font-medium">
              {allLinks.map((item, i) => {
                const isActive = pathname === item.href;
                return (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuState(false)}
                      className={cn(
                        "flex items-center justify-between py-2 px-3 rounded-xl transition-all",
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      )}
                    >
                      <span>{item.name}</span>
                      {isActive && <span className="size-2 rounded-full bg-primary" />}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>

            <div className="flex flex-col gap-3 pt-6 border-t border-border/50">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm font-medium text-muted-foreground">Theme</span>
                <ModeToggle />
              </div>

              {user ? (
                <Button asChild variant="outline" className="w-full rounded-xl justify-center">
                  <Link href="/student" onClick={() => setMenuState(false)}>
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full rounded-xl justify-center">
                  <Link href="/auth/login" onClick={() => setMenuState(false)}>
                    Sign In
                  </Link>
                </Button>
              )}

              <Button
                asChild
                className="w-full rounded-xl justify-center bg-gradient-to-r from-primary to-violet-600 text-white border-0 shadow-lg shadow-primary/20"
              >
                <Link href="/auth/signup" onClick={() => setMenuState(false)}>
                  Join Club
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
