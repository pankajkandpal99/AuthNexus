import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NavbarItemType } from "../../types/navbarTypes";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

interface NavbarItemProps {
  item: NavbarItemType;
  isMobile?: boolean;
  onClick?: () => void;
}

export const NavbarItem: React.FC<NavbarItemProps> = ({
  item,
  isMobile = false,
  onClick,
}) => {
  const location = useLocation();
  const isActive = location.pathname === item.href;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn("relative", isMobile ? "w-full" : "inline-block")}
    >
      <Link
        to={item.href}
        onClick={onClick}
        className={cn(
          "relative block px-4 py-2.5 text-sm font-medium transition-all duration-300",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground",
          isMobile ? "text-base py-3 px-4" : ""
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <span className="relative flex items-center gap-2">{item.label}</span>

        {isActive && (
          <motion.div
            className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full"
            layoutId="underline"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </Link>
    </motion.div>
  );
};
