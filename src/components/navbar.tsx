import { Bars3Icon } from "@heroicons/react/24/outline";
import { Dispatch, FC, SetStateAction } from "react";

type Props = {
  setMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
};

const Navbar: FC<Props> = ({ setMobileMenuOpen }) => {
  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between bg-[#EA6D5C] py-2 px-4 sm:px-6 lg:px-8">
        <p className="text-xl font-semibold tracking-wide text-white">KISR</p>
        <div>
          <button
            type="button"
            className="-mr-3 inline-flex h-12 w-12 items-center justify-center rounded-md bg-[#e85643] text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Öppna sidmeny</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
