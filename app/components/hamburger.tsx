import AppHamburger from "./app-hamburger";
import PublicHamburger from "./public-hamburger";

// This is a server component that wraps the client component
export const Hamburger = ({ isApp = false }: { isApp?: boolean }) => {
  return isApp ? <AppHamburger /> : <PublicHamburger />;
};

export default Hamburger;
