"use client";

import React from "react";
import { LayoutDashboard, Newspaper, NotebookPen, ScanSearch } from "lucide-react";
import { motion } from "framer-motion";

const productsData = [
  {
    title: "Smart Match",
    icon: <ScanSearch className="w-6 h-6 text-accent" />,
    description:
      "Ranks 3,200+ agents by how well they fit your book, so you find best-fit agents instantly.",
  },
  {
    title: "Query Dashboard",
    icon: <LayoutDashboard className="w-6 h-6 text-accent" />,
    description:
      "Save agent matches and track all of your queries from one modern dashboard.",
  },
  {
    title: "Dispatch",
    icon: <Newspaper className="w-6 h-6 text-accent" />,
    description:
      "Real time industry news feed. Keeping you updated on agent openings, query tips, industry news, and more.",
  },
  {
    title: "Slushwire/Blog",
    icon: <NotebookPen className="w-6 h-6 text-accent" />,
    description:
      "Get a weekly briefing of curated industry intel delivered straight to your inbox.",
  },
];

const ProductsBlock = () => {
  return (
    <div className="w-[90%] mx-auto">
      <h1 className="text-2xl md:text-[40px] leading-normal text-white mb-8">
        Features
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {productsData.map((product, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.6,
              delay: index * 0.15,
              ease: "easeOut",
            }}
          >
            <div className="flex flex-col gap-6 bg-white rounded-xl p-6 py-8 shadow-xl h-[250px] transform transition-transform duration-200 ease-out hover:-translate-y-2">
              <div className="flex items-center gap-2">
                {product.icon}
                <label className="text-lg font-semibold text-accent">
                  {product.title}
                </label>
              </div>
              <p className="text-lg font-normal">{product.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductsBlock;
