import React from "react";

const Footer = () => {
  return (
    <div
      id="footer"
      className="bg-[#F9E0E2] w-full py-20 border-t border-text-dark-blue mt-[300px]"
    >
      <div className="max-w-screen-xl mx-auto flex justify-center items-center px-4">
        <div className="flex flex-col">
          <div className="flex flex-col justify-between">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <a
                className="font-bold text-lg hover:text-accent transition-all duration-300"
                href="https://writequeryhook.com/privacy-policy/"
              >
                Privacy Policy
              </a>
              <a
                className="font-bold text-lg hover:text-accent transition-all duration-300"
                href="https://writequeryhook.com/refund-policy/"
              >
                Refund Policy
              </a>
              <a
                className="font-bold text-lg hover:text-accent transition-all duration-300"
                href="https://writequeryhook.com/terms-of-service/"
              >
                Terms of Service
              </a>
            </div>
            <p className="text-sm mt-4 text-center">
              © 2025 Write Query Hook. <br />
              All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
