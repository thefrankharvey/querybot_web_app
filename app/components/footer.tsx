import React from "react";

const Footer = () => {
  return (
    <div
      id="footer"
      className="bg-[#F9E0E2] w-full py-20 border-t border-text-dark-blue mt-[350px] md:mt-[500px]"
    >
      <div className="max-w-screen-xl mx-auto flex flex-col-reverse md:flex-row justify-between px-4">
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold flex mb-4">Quick Links</h3>
          <div className="flex flex-col justify-between">
            <div className="flex flex-col gap-1 mb-20">
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
            <p className="text-sm mt-4 text-center md:text-left">
              © 2025 Write Query Hook. <br />
              All Rights Reserved.
            </p>
          </div>
        </div>
        <div className="flex text-2xl w-full md:w-[50%] mb-8 md:mb-0 pt-8">
          <a href="https://writequeryhook.com/slushwire/" target="_blank">
            <p className="whitespace-normal hover:text-accent transition-all duration-300">
              Not ready for daily? Click Here to try the{" "}
              <span className="font-bold">Weekly Lite</span> version of Write
              Query Hook SlushWire <span className="font-bold">Free!</span>
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
