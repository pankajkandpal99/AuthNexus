import React from "react";
import { NavbarItem } from "./NavbarItem";
import { Link } from "react-router-dom";
import { NavbarItemType } from "../../types/navbarTypes";
import AuthButtons from "../auth/AuthButtons";
import MobileMenu from "./MobileMenu";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { motion } from "framer-motion";

interface iAppNavbarProps {
  items: NavbarItemType[];
  absolute?: boolean;
}

export const Navbar: React.FC<iAppNavbarProps> = ({ items }) => {
  const { isAdmin } = useAdminAuth();
  const filteredItems = items.filter(
    (item) => item.href !== "/admin-dashboard" || isAdmin
  );

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-soft"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8 flex justify-between items-center py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-primary-gradient rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <span className="relative text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
              AuthNexus
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <NavbarItem item={item} />
            </motion.div>
          ))}
        </div>

        {/* Auth Buttons and Mobile Menu */}
        <div className="flex items-center gap-3 lg:gap-6">
          {/* Desktop Auth Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="hidden lg:flex"
          >
            <AuthButtons />
          </motion.div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <MobileMenu items={filteredItems} />
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
