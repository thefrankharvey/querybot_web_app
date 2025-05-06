import SlushwireProCard from "../components/slushwire-pro-card";
import ProductCards from "../components/product-cards";
import SlushwireActionBlock from "../components/slushwire-action-block";
const Home = () => {
  return (
    <div className="w-full mb-[500px]">
      <div className="py-30 sm:w-[90%] md:w-[60%] lg:w-[70%] mx-auto text-center">
        <h1 className="text-[40px] font-extrabold leading-tight">
          Smart, Author Focused Tools. <br />
          Query Smart. Get Signed. Keep Writing.
        </h1>
        <p className="text-xl mt-4">Built by Authors. Powered by Rejection.</p>
      </div>
      <SlushwireProCard />
      <div className="py-40 w-fullmx-auto text-center">
        <h1 className="text-[40px] font-extrabold leading-tight">
          The Submission Process Is Not Just Broken.
        </h1>
        <p className="text-xl mt-4">It is a Mountainous Hellscape from Hell.</p>
      </div>
      <div>
        <div className="text-[60px] md:text-[80px] lg:text-[100px] font-extrabold leading-tight">
          The <br />
          Solution: <br />
          Write Query <br />
          Hook Tools
        </div>
        <ProductCards />
      </div>
      <SlushwireActionBlock />
    </div>
  );
};

export default Home;
