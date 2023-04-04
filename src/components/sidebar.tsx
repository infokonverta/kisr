import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowLeftOnRectangleIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  CalendarIcon,
  FolderOpenIcon,
  HomeIcon,
  RectangleStackIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useMe } from "@src/hooks";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Dispatch, FC, Fragment, SetStateAction } from "react";
import { toast } from "react-hot-toast";

type Props = {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
};

const Sidebar: FC<Props> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const user = useUser();
  const router = useRouter();
  const { data } = useMe(user?.id);
  const supabaseClient = useSupabaseClient();
  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      toast.error("Du kunde inte loggas ut");
      console.log(error.message);
      return;
    }
    router.push("/login");
    toast.success("Du är utloggad");
  };
  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: HomeIcon,
      current: router.route === "/",
    },
    {
      name: "Genomgörda möten",
      href: "/meetings",
      icon: CalendarIcon,
      current: router.route === "/meetings",
    },
    {
      name: "Affärer",
      href: "/sales",
      icon: BanknotesIcon,
      current: router.route === "/sales",
    },
    {
      name: "Offerter",
      href: "/offers",
      icon: RectangleStackIcon,
      current: router.route === "/offers",
    },
    {
      name: "Bokade möten",
      href: "/bookings",
      icon: CalendarDaysIcon,
      current: router.route === "/bookings",
    },
    {
      name: "Tjänster",
      href: "/services",
      icon: FolderOpenIcon,
      current: router.route === "/services",
    },
  ];
  return (
    <>
      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-40 lg:hidden"
          onClose={setMobileMenuOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white focus:outline-none">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-4">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="sr-only">Stäng sidmeny</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <div className="pt-5 pb-4">
                  <nav aria-label="Sidebar">
                    <div className="space-y-1 px-2">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={clsx(
                            item.current
                              ? "border-2 border-[#EA6D5C] text-gray-900"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                            "group flex items-center rounded-md p-2 text-base font-medium"
                          )}
                        >
                          <item.icon
                            className={clsx(
                              item.current
                                ? "text-gray-500"
                                : "text-gray-400 group-hover:text-gray-500",
                              "mr-4 h-6 w-6"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="group flex w-full items-center rounded-md p-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      >
                        <ArrowLeftOnRectangleIcon
                          className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                          aria-hidden="true"
                        />
                        Logga ut
                      </button>
                    </div>
                  </nav>
                </div>
                <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                  <Link href="/profile" className="group block flex-shrink-0">
                    <div className="flex items-center">
                      <div className="relative h-10 w-10">
                        {data?.user?.avatar ? (
                          <Image
                            className="inline-block rounded-full"
                            src={data?.user?.avatar}
                            alt="avatar"
                            fill
                            sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
                          />
                        ) : (
                          <span className="absolute inset-0 rounded-full bg-gray-200 motion-safe:animate-pulse"></span>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                          {data?.user?.name}
                        </p>
                        <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                          Konto inställningar
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-14 flex-shrink-0" aria-hidden="true"></div>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex w-20 flex-col">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#EA6D5C]">
            <div className="flex-1">
              <nav
                aria-label="Sidebar"
                className="flex flex-col items-center space-y-3 py-6"
              >
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      item.current
                        ? "bg-[#e85643]"
                        : "bg-[#EA6D5C] hover:bg-[#e85643]",
                      "flex items-center rounded-lg p-4 text-white"
                    )}
                  >
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                    <span className="sr-only">{item.name}</span>
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center rounded-lg bg-[#EA6D5C] p-4 text-white hover:bg-[#e85643]"
                >
                  <ArrowLeftOnRectangleIcon
                    className="h-6 w-6"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Logga ut</span>
                </button>
              </nav>
            </div>
            <div className="flex flex-shrink-0 pb-5">
              <Link href="/profile" className="w-full flex-shrink-0">
                <div className="relative mx-auto block h-10 w-10">
                  {data?.user?.avatar ? (
                    <Image
                      className="rounded-full"
                      src={data?.user?.avatar}
                      alt="avatar"
                      fill
                      sizes="(max-width: 768px) 100vw,
      (max-width: 1200px) 50vw,
      33vw"
                    />
                  ) : (
                    <span className="absolute inset-0 rounded-full bg-gray-200 motion-safe:animate-pulse"></span>
                  )}
                </div>
                <div className="sr-only">
                  <p>{data?.user?.name}</p>
                  <p>Konto inställningar</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
