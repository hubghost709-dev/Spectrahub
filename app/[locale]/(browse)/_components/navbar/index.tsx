import LocaleSwitcher from "@/app/[locale]/components/LocaleSwitcher";
import Actions from "./actions";
import Logo from "./logo";
import Search from "./search";

function Navbar() {
  return (
    <nav className="fixed top-0 w-full h-20 z-[49] bg-[#e60026] px-2 lg:px-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center">
        <Logo />
      </div>
      
      {/* Campo de búsqueda visible solo en pantallas medianas/grandes */}
      <div className=" flex-grow max-w-[500px] mx-4">
        <Search />
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <Actions />
        <LocaleSwitcher />
      </div>
    </nav>
  );
}
export default Navbar;
