"use client";

import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import React, { useRef, useState } from "react";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
  isScrolled?: boolean;
}

export interface NavItemsProps {
  items: {
    name: string;
    link: string;
    active?: boolean;
  }[];
  activeItem?: string;
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
  isScrolled?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState<boolean>(true);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (current) => {
    if (typeof current === "number") {
      const prev = scrollY.getPrevious() ?? 0;
      const direction = current - prev;

      if (current < 50) {
        // At top: visible and expanded
        setVisible(true);
        setIsScrolled(false);
      } else {
        setIsScrolled(true);
        // Scrolling up -> reveal; scrolling down -> hide
        if (direction < -2) {
          setVisible(true);
        } else if (direction > 2) {
          setVisible(false);
        }
      }
    }
  });

  return (
    <motion.header
      ref={ref}
      className={cn("fixed inset-x-0 top-0 z-50 w-full px-4 pt-4 sm:px-6 pointer-events-none", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean; isScrolled?: boolean }>,
              { visible, isScrolled },
            )
          : child,
      )}
    </motion.header>
  );
};

export const NavBody = ({ children, className, visible = true, isScrolled = false }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        y: visible ? (isScrolled ? 8 : 0) : -120,
        opacity: visible ? 1 : 0,
        width: isScrolled ? "55%" : "100%",
        backgroundColor: isScrolled ? "rgba(7, 8, 10, 0.90)" : "rgba(7, 8, 10, 0.82)",
        backdropFilter: "blur(18px)",
        boxShadow: isScrolled
          ? "0 0 30px rgba(255, 38, 61, 0.10), 0 20px 50px rgba(0, 0, 0, 0.5)"
          : "0 0 30px rgba(255, 30, 55, 0.06), 0 10px 30px rgba(0, 0, 0, 0.3)",
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 25,
      }}
      style={{
        minWidth: "600px",
        pointerEvents: visible ? "auto" : "none",
        background: "rgba(7, 8, 10, 0.82)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(255, 255, 255, 0.10)",
        boxShadow: "0 0 30px rgba(255, 30, 55, 0.06)",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between rounded-full px-6 py-2.5 lg:flex",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, activeItem, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "relative hidden flex-1 flex-row items-center justify-center space-x-1 lg:flex",
        className,
      )}
    >
      {items.map((item, idx) => {
        const isActive = item.active || activeItem === item.name;
        return (
          <a
            key={`link-${idx}`}
            href={item.link}
            onMouseEnter={() => setHovered(idx)}
            onClick={onItemClick}
            className={cn(
              "relative px-4 py-2 text-sm font-semibold tracking-wide transition-colors duration-200",
              isActive ? "text-[#F5F5F5]" : "text-[#8F9298] hover:text-[#F5F5F5]"
            )}
          >
            {isActive && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-[#FF263D] shadow-[0_0_10px_#FF263D]" />
            )}
            {hovered === idx && !isActive && (
              <motion.div
                layoutId="nav-hovered"
                className="absolute inset-0 h-full w-full rounded-full bg-[rgba(255,38,61,0.10)] border border-[rgba(255,38,61,0.25)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-20">{item.name}</span>
          </a>
        );
      })}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible = true, isScrolled = false }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        y: visible ? (isScrolled ? 8 : 0) : -120,
        opacity: visible ? 1 : 0,
        width: isScrolled ? "92%" : "100%",
        backgroundColor: isScrolled ? "rgba(7, 8, 10, 0.90)" : "rgba(7, 8, 10, 0.82)",
        backdropFilter: "blur(18px)",
        boxShadow: isScrolled
          ? "0 0 30px rgba(255, 38, 61, 0.10)"
          : "0 0 30px rgba(255, 30, 55, 0.06)",
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 25,
      }}
      style={{
        pointerEvents: visible ? "auto" : "none",
        background: "rgba(7, 8, 10, 0.82)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(255, 255, 255, 0.10)",
        boxShadow: "0 0 30px rgba(255, 30, 55, 0.06)",
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between rounded-2xl px-4 py-2.5 lg:hidden",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "absolute inset-x-0 top-full mt-2 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-2xl border border-white/10 bg-[#07080A]/95 p-6 shadow-2xl backdrop-blur-2xl",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#07080A]/80 text-[#8F9298] transition hover:border-[#FF263D]/40 hover:text-[#F5F5F5]"
      aria-label="Toggle navigation"
    >
      {isOpen ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
    </button>
  );
};

export const NavbarLogo = ({
  href = "/",
  children,
}: {
  href?: string;
  children?: React.ReactNode;
}) => {
  if (children) {
    return (
      <a href={href} className="relative z-20 flex items-center">
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      className="relative z-20 flex items-center gap-3 transition hover:opacity-95"
    >
      <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#07080A] shadow-[0_0_16px_rgba(255,38,61,0.10)]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="navLogoKGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF4054" />
              <stop offset="100%" stopColor="#FF263D" />
            </linearGradient>
            <linearGradient id="navLogoKCore" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FF4054" />
            </linearGradient>
          </defs>
          <path d="M4 4H8V20H4V4Z" fill="url(#navLogoKGrad)" />
          <path d="M9.5 12.2L16.2 4H20.5L13.2 12.2L20.8 20H16.5L9.5 12.2Z" fill="url(#navLogoKGrad)" />
          <path d="M5.2 5.5H6.8V18.5H5.2V5.5Z" fill="url(#navLogoKCore)" opacity="0.9" />
          <path d="M11 12.2L16 6H18L13 12.2L18.2 18.5H16.2L11 12.2Z" fill="url(#navLogoKCore)" opacity="0.9" />
        </svg>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold tracking-[0.2em] text-[#F5F5F5] antialiased">
          KURONEX
        </span>
        <span className="rounded border border-[rgba(255,38,61,0.25)] bg-[rgba(255,38,61,0.10)] px-1.5 py-0.5 text-[9px] font-extrabold tracking-[0.16em] text-[#FF263D] shadow-[0_0_12px_rgba(255,38,61,0.10)]">
          GAMES
        </span>
      </div>
    </a>
  );
};

export interface NavbarButtonProps {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
  onClick?: () => void;
  [key: string]: unknown;
}

export const NavbarButton = ({
  href,
  as,
  children,
  className,
  variant = "primary",
  ...props
}: NavbarButtonProps) => {
  const baseStyles =
    "relative inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 text-center";

  const variantStyles = {
    primary:
      "bg-[#FF263D] hover:bg-[#FF4054] text-[#F5F5F5] border border-[rgba(255,255,255,0.15)] shadow-[0_0_20px_rgba(255,38,61,0.25)] hover:shadow-[0_0_28px_rgba(255,38,61,0.45)]",
    secondary:
      "bg-transparent text-[#8F9298] hover:text-[#F5F5F5] border border-[rgba(255,255,255,0.10)] hover:border-[rgba(255,38,61,0.35)] hover:bg-[rgba(255,38,61,0.08)] shadow-none",
    dark:
      "bg-[#07080A] text-[#8F9298] hover:text-[#F5F5F5] border border-[rgba(255,255,255,0.10)]",
    gradient:
      "bg-gradient-to-r from-[#FF263D] to-[#FF4054] text-[#F5F5F5] shadow-[0_0_20px_rgba(255,38,61,0.30)]",
  };

  if (as) {
    return React.createElement(
      as,
      {
        href: href || undefined,
        className: cn(baseStyles, variantStyles[variant], className),
        ...props,
      },
      children,
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={cn(baseStyles, variantStyles[variant], className)}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], className)}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
};
