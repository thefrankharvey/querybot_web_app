import React from "react";
import { Newspaper, NotebookPen, Save, ScanSearch } from "lucide-react";
import { motion } from "framer-motion";

const productsData = [
  {
    title: "Smart Match",
    icon: <ScanSearch className="w-6 h-6 text-accent" />,
    description:
      "Ranks 3,200+ agents by how well they fit your book, so you find best-fit agents instantly.",
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
  {
    title: "Save Agent Matches",
    icon: <Save className="w-6 h-6 text-accent" />,
    description:
      "Save your favorite agent matches for quick access during the query process.",
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

// {showSecondAnimation && (
//   <div
//     id="animation"
//     className="absolute top-[-400px] right-[-320px] w-full hidden justify-center pointer-events-none lg:flex"
//   >
//     <svg
//       width="1050"
//       height="900"
//       viewBox="0 0 1050 900"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <motion.path
//         initial={{ pathLength: 0 }}
//         animate={{ pathLength: 1 }}
//         transition={{
//           duration: 0.5,
//           ease: "easeInOut",
//         }}
//         d="M694 220
// C944 366, 944 641, 629 732
// C355 823, 144 641, 175 407
// C207 174, 551 133, 826 319"
//         fill="none"
//         stroke="#1c4a4e"
//         strokeWidth="5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </svg>
//   </div>
// )}
