import React from "react";
import { NavbarItem } from "./NavbarItem";
import { NavbarItemType } from "../../types/navbarTypes";
import AuthButtons from "../auth/AuthButtons";
import { motion } from "framer-motion";
import { X, User, Menu, ShieldCheck } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerPortal,
  DrawerTrigger,
} from "../ui/drawer";
import { Link } from "react-router-dom";

interface MobileMenuProps {
  items: NavbarItemType[];
}

const MobileMenu: React.FC<MobileMenuProps> = ({ items }) => {
  const { authenticated } = useSelector((state: RootState) => state.auth);
  const { currentUser } = useSelector((state: RootState) => state.user);

  const displayName =
    currentUser?.username || currentUser?.phoneNumber || "Guest";
  const displayEmail = currentUser?.email;
  const isGuest = !authenticated;

  const containerVariants = {
    open: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    closed: {
      opacity: 0,
    },
  };

  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    closed: {
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="lg:hidden">
      <Drawer>
        <DrawerTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 rounded-xl bg-card hover:bg-muted transition-all duration-300 shadow-soft hover:shadow-orange group"
            aria-label="Toggle mobile menu"
          >
            <div className="absolute inset-0 bg-primary-gradient rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <Menu
              size={24}
              strokeWidth={2}
              className="relative z-10 text-primary"
            />
          </motion.button>
        </DrawerTrigger>
        <DrawerPortal>
          <DrawerContent className="fixed inset-y-0 right-0 h-full w-80 max-h-screen bg-background border-l border-border shadow-2xl z-50">
            <motion.div
              initial="closed"
              animate="open"
              variants={containerVariants}
              className="h-full flex flex-col max-h-screen"
            >
              {/* Header */}
              <motion.div
                variants={itemVariants}
                className="p-6 flex items-center justify-between border-b border-border bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-primary-gradient rounded-lg blur opacity-30"></div>
                    <span className="relative text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
                      AuthNexus
                    </span>
                  </div>
                </div>
                <DrawerClose asChild>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-primary hover:text-amber-600 rounded-xl hover:bg-muted transition-all duration-300"
                  >
                    <X size={20} />
                  </motion.button>
                </DrawerClose>
              </motion.div>

              {/* User Profile Section */}
              <div className="flex-1 overflow-y-auto p-6">
                <motion.div
                  variants={itemVariants}
                  className={`mb-6 bg-card p-4 rounded-xl border border-border shadow-soft hover-lift ${
                    isGuest ? "opacity-75" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <div
                        className={`absolute -inset-1 ${
                          isGuest ? "bg-muted" : "bg-primary-gradient"
                        } rounded-full blur-sm opacity-30`}
                      ></div>
                      <div
                        className={`relative flex items-center justify-center w-12 h-12 ${
                          isGuest ? "bg-muted" : "bg-primary/10"
                        } rounded-full`}
                      >
                        <User
                          size={20}
                          className={
                            isGuest ? "text-muted-foreground" : "text-primary"
                          }
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-foreground">
                        {displayName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {isGuest ? "Not logged in" : "Logged in"}
                      </span>
                    </div>
                  </div>

                  {/* Admin Badge */}
                  {currentUser && currentUser.role === "ADMIN" && (
                    <div className="mb-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-gradient text-white text-xs font-medium rounded-full">
                        <ShieldCheck size={14} />
                        <span>Admin</span>
                      </div>
                    </div>
                  )}

                  {/* Email Section */}
                  {displayEmail && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <span className="text-xs text-muted-foreground block mb-1">
                        Email
                      </span>
                      <div className="text-sm font-medium text-foreground truncate">
                        {displayEmail}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Admin Dashboard Link */}
                {currentUser?.role === "ADMIN" && (
                  <motion.div variants={itemVariants}>
                    <Link to="/admin-dashboard" className="block mb-6">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-gradient text-white hover:shadow-orange transition-all duration-300 hover-lift">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <ShieldCheck size={18} />
                        </div>
                        <span className="font-medium">Admin Dashboard</span>
                      </div>
                    </Link>
                  </motion.div>
                )}

                {/* Divider */}
                <motion.div
                  variants={itemVariants}
                  className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent my-6"
                />

                {/* Navigation Items */}
                <motion.nav
                  variants={containerVariants}
                  className="space-y-2 pb-6"
                >
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      custom={index}
                    >
                      <DrawerClose asChild>
                        <div className="rounded-lg hover:bg-muted/50 transition-colors">
                          <NavbarItem item={item} isMobile />
                        </div>
                      </DrawerClose>
                    </motion.div>
                  ))}
                </motion.nav>
              </div>

              {/* Footer with Auth Buttons */}
              <motion.div
                variants={itemVariants}
                className="border-t border-border bg-card p-6"
              >
                <AuthButtons isMobile />
              </motion.div>
            </motion.div>
          </DrawerContent>
        </DrawerPortal>
      </Drawer>
    </div>
  );
};

export default MobileMenu;
