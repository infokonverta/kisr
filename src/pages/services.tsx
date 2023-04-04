import { Dialog, Transition } from "@headlessui/react";
import { FolderOpenIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ResponsivePie } from "@nivo/pie";
import Directory from "@src/components/directory";
import Loading from "@src/components/loading";
import Navbar from "@src/components/navbar";
import Notification from "@src/components/notification";
import Sidebar from "@src/components/sidebar";
import Stats from "@src/components/stats";
import { months } from "@src/data";
import { useMe, useServices } from "@src/hooks";
import { Error, Service } from "@src/types";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { NextPage } from "next";
import {
  Dispatch,
  FC,
  Fragment,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { CSVLink } from "react-csv";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

type Inputs = {
  name: string;
  provision: string;
};

const Slideover: FC<{
  currService: Service | null;
  openSlideover: boolean;
  setOpenSlideover: Dispatch<SetStateAction<boolean>>;
}> = ({ currService, openSlideover, setOpenSlideover }) => {
  const { data, isLoading } = useServices();
  const { register, handleSubmit, reset } = useForm<Inputs>();
  useEffect(() => {
    if (openSlideover) reset();
  }, [openSlideover]);
  const queryClient = useQueryClient();
  const createService = useMutation(
    async (payload: Inputs) => {
      const service = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const response = await service.json();
      return response;
    },
    {
      onSuccess: () => {
        setOpenSlideover(false);
        queryClient.invalidateQueries(["me"]);
        toast.success("Tjänsten har lagts till");
        queryClient.invalidateQueries(["services"]);
      },
      onError: (error: Error) => {
        console.log(error);
        toast.error("Tjänsten kunde inte läggas till");
      },
    }
  );
  const updateService = useMutation(
    async (payload: Inputs) => {
      const service = await fetch("/api/services", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          id: currService?.id,
        }),
      });
      const response = await service.json();
      return response;
    },
    {
      onSuccess: () => {
        setOpenSlideover(false);
        queryClient.invalidateQueries(["me"]);
        toast.success("Tjänsten har uppdaterats");
        queryClient.invalidateQueries(["services"]);
      },
      onError: (error: Error) => {
        console.log(error);
        toast.error("Tjänsten kunde inte uppdateras");
      },
    }
  );
  const deleteService = useMutation(
    async (id: number) => {
      const service = await fetch("/api/services", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });
      const response = await service.json();
      return response;
    },
    {
      onSuccess: () => {
        setOpenSlideover(false);
        queryClient.invalidateQueries(["me"]);
        toast.success("Tjänsten har tagits bort");
        queryClient.invalidateQueries(["services"]);
      },
      onError: (error: Error) => {
        console.log(error);
        toast.error("Tjänsten kunde inte tas bort");
      },
    }
  );
  const onSubmit: SubmitHandler<Inputs> = ({ name, provision }) => {
    if (currService) {
      updateService.mutate({
        name,
        provision,
      });
    } else {
      createService.mutate({
        name,
        provision,
      });
    }
  };
  return (
    <Transition.Root show={openSlideover} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpenSlideover}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <form
                    className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl"
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    <div className="h-0 flex-1 overflow-y-auto">
                      <div className="bg-[#EA6D5C] py-6 px-4 sm:px-6">
                        {currService ? (
                          <>
                            <div className="flex items-center justify-between">
                              <Dialog.Title className="text-lg font-medium text-white">
                                Redigera paket
                              </Dialog.Title>
                              <div className="ml-3 flex h-7 items-center">
                                <button
                                  type="button"
                                  className="rounded-md bg-[#EA6D5C] text-white focus:outline-none focus:ring-2 focus:ring-white"
                                  onClick={() => setOpenSlideover(false)}
                                >
                                  <span className="sr-only">Stäng panel</span>
                                  <XMarkIcon
                                    className="h-6 w-6"
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            </div>
                            <div className="mt-1">
                              <p className="text-sm text-white">
                                Glöm inte att trycka på spara längst ner i
                                formuläret
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <Dialog.Title className="text-lg font-medium text-white">
                                Lägg till paket
                              </Dialog.Title>
                              <div className="ml-3 flex h-7 items-center">
                                <button
                                  type="button"
                                  className="rounded-md bg-[#EA6D5C] text-white focus:outline-none focus:ring-2 focus:ring-white"
                                  onClick={() => setOpenSlideover(false)}
                                >
                                  <span className="sr-only">Stäng panel</span>
                                  <XMarkIcon
                                    className="h-6 w-6"
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            </div>
                            <div className="mt-1">
                              <p className="text-sm text-white">
                                Fyll i formuläret nedan för att registrera
                                paketet
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="divide-y divide-gray-200 px-4 sm:px-6">
                          <div className="space-y-6 pt-6 pb-5">
                            <div>
                              <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-900"
                              >
                                Företag
                              </label>
                              <div className="mt-1">
                                <input
                                  {...register("name")}
                                  type="text"
                                  name="name"
                                  id="name"
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#EA6D5C] focus:ring-[#EA6D5C] sm:text-sm"
                                  defaultValue={currService?.name}
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <label
                                htmlFor="provision"
                                className="block text-sm font-medium text-gray-900"
                              >
                                Provision
                              </label>
                              <div className="mt-1">
                                <input
                                  {...register("provision")}
                                  type="number"
                                  name="provision"
                                  id="provision"
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#EA6D5C] focus:ring-[#EA6D5C] sm:text-sm"
                                  defaultValue={currService?.provision}
                                  min={0}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <div className="pt-4 pb-6">
                            <div className="flex text-sm">
                              <div className="group inline-flex items-center text-gray-500 hover:text-gray-900">
                                <FolderOpenIcon
                                  className="h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                                <span className="ml-2">
                                  Det finns totalt {data?.services.length}{" "}
                                  tillgängliga tjänster
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end px-4 py-4">
                      {currService ? (
                        <button
                          type="button"
                          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#EA6D5C] focus:ring-offset-2"
                          onClick={() => deleteService.mutate(currService.id)}
                          disabled={
                            isLoading ||
                            createService.isLoading ||
                            createService.isError ||
                            updateService.isLoading ||
                            updateService.isError ||
                            deleteService.isLoading ||
                            deleteService.isError
                          }
                        >
                          Ta bort
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#EA6D5C] focus:ring-offset-2"
                          onClick={() => setOpenSlideover(false)}
                        >
                          Avbryt
                        </button>
                      )}
                      <button
                        type="submit"
                        className={clsx(
                          isLoading ||
                            createService.isLoading ||
                            createService.isError ||
                            updateService.isLoading ||
                            updateService.isError ||
                            deleteService.isLoading ||
                            deleteService.isError
                            ? "cursor-not-allowed bg-slate-400 hover:bg-slate-500"
                            : "bg-[#EA6D5C] hover:bg-[#e85643]",
                          "ml-4 inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        )}
                        disabled={
                          isLoading ||
                          createService.isLoading ||
                          createService.isError ||
                          updateService.isLoading ||
                          updateService.isError ||
                          deleteService.isLoading ||
                          deleteService.isError
                        }
                      >
                        {isLoading ||
                        createService.isLoading ||
                        createService.isError ||
                        updateService.isLoading ||
                        updateService.isError ||
                        deleteService.isLoading ||
                        deleteService.isError ? (
                          <Loading />
                        ) : (
                          "Spara"
                        )}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

const Chart: FC<{
  setCurrService: Dispatch<SetStateAction<Service | null>>;
  setOpenSlideover: Dispatch<SetStateAction<boolean>>;
}> = ({ setCurrService, setOpenSlideover }) => {
  const user = useUser();
  const services = useServices();
  const profile = useMe(user?.id);
  const data = services.data?.services.filter(
    (service: Service) => service.sales.length
  ).length
    ? services.data?.services
        .filter((service: Service) => service.sales.length)
        .map((service: Service) => ({
          id: service.name,
          label: service.name,
          value: service.sales.length,
        }))
        .reverse()
    : Array(7)
        .fill(0)
        .map((element, index) => ({
          x: index,
          y: element,
        }));
  return (
    <div className="hidden items-center justify-center overflow-hidden rounded-lg bg-gray-900 shadow sm:flex">
      <div className="w-full">
        <div className="flex items-center p-6">
          {profile.data?.user?.role === "ADMIN" && (
            <button
              type="button"
              onClick={() => {
                setCurrService(null);
                setOpenSlideover(true);
              }}
              className="ml-auto inline-flex items-center rounded-md border border-transparent bg-[#EA6D5C] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[#e85643] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              Lägg till paket
            </button>
          )}
        </div>
        <div className="h-[40rem] sm:p-6">
          <ResponsivePie
            data={data}
            margin={{ top: 20, right: 100, bottom: 80, left: 100 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{
              from: "color",
              modifiers: [["darker", 0.2]],
            }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#fff"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{
              from: "color",
              modifiers: [["darker", 2]],
            }}
          />
        </div>
      </div>
    </div>
  );
};

const History: FC<{
  setCurrService: Dispatch<SetStateAction<Service | null>>;
  setOpenSlideover: Dispatch<SetStateAction<boolean>>;
}> = ({ setCurrService, setOpenSlideover }) => {
  const user = useUser();
  const services = useServices();
  const profile = useMe(user?.id);
  return (
    <div className="overflow-hidden rounded-lg bg-gray-900 shadow">
      <div className="p-6">
        <div>
          {!!services.data &&
            services.data.services.length > 0 &&
            profile.data?.user?.role === "ADMIN" && (
              <CSVLink
                data={services.data?.services.map((service: Service) => ({
                  id: service.id,
                  tjänst: service.name,
                  provision: service.provision,
                  "antal sålda": service.sales.length,
                }))}
                filename="tjänster.csv"
                className="inline-flex items-center rounded-md border border-transparent bg-[#EA6D5C] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[#e85643] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
              >
                Exportera
              </CSVLink>
            )}
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6"
                        >
                          <a href="#" className="group inline-flex">
                            Tjänst
                          </a>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          <a href="#" className="group inline-flex">
                            Provision
                          </a>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          <a href="#" className="group inline-flex">
                            Antal sålda
                          </a>
                        </th>
                        {profile.data?.user?.role === "ADMIN" && (
                          <th
                            scope="col"
                            className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                          >
                            <span className="sr-only">Redigera</span>
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800">
                      {services.data?.services.map((service: Service) => (
                        <tr key={service.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                            {service.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                            {service.provision}%
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                            {service.sales.length}
                          </td>
                          {profile.data?.user?.role === "ADMIN" && (
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenSlideover(true);
                                  setCurrService(service);
                                }}
                                className="text-[#EA6D5C] hover:text-[#e85643]"
                              >
                                Redigera
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServicesPage: NextPage = () => {
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [show, setShow] = useState(false);
  const supabaseClient = useSupabaseClient();
  const [openSlideover, setOpenSlideover] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currService, setCurrService] = useState<Service | null>(null);
  useEffect(() => {
    const meetings = supabaseClient
      .channel("public:meetings")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Meeting" },
        async (payload) => {
          setShow(true);
          const user = await supabaseClient
            .from("Profile")
            .select("name")
            .eq("id", payload.new.profileId);
          setTitle("Ett nytt möte har genomförts");
          setBody(
            user.data?.[0].name +
              " har genomfört ett möte med " +
              payload.new.name
          );
        }
      )
      .subscribe();
    const offers = supabaseClient
      .channel("public:offers")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Offer" },
        async (payload) => {
          setShow(true);
          const user = await supabaseClient
            .from("Profile")
            .select("name")
            .eq("id", payload.new.profileId);
          setTitle("Nya offerter har skickats");
          setBody(
            user.data?.[0].name +
              " har skickat offerter till " +
              payload.new.name
          );
        }
      )
      .subscribe();
    const sales = supabaseClient
      .channel("public:sales")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Sale" },
        async (payload) => {
          setShow(true);
          const user = await supabaseClient
            .from("Profile")
            .select("name")
            .eq("id", payload.new.profileId);
          setTitle("En ny försäljning har har lagts till");
          setBody(
            user.data?.[0].name +
              " har genomfört en försäljning på " +
              payload.new.revenue +
              " SEK"
          );
        }
      )
      .subscribe();
    const bookings = supabaseClient
      .channel("public:bookings")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "Booking" },
        async (payload) => {
          setShow(true);
          const user = await supabaseClient
            .from("Profile")
            .select("name")
            .eq("id", payload.new.profileId);
          setTitle("Ett nytt möte har bokats");
          setBody(
            user.data?.[0].name + " har bokat ett möte med " + payload.new.name
          );
        }
      )
      .subscribe();
    return () => {
      supabaseClient.removeChannel(meetings);
      supabaseClient.removeChannel(offers);
      supabaseClient.removeChannel(sales);
      supabaseClient.removeChannel(bookings);
    };
  }, []);
  return (
    <>
      <Notification body={body} show={show} title={title} setShow={setShow} />
      <div className="flex sm:h-screen">
        <Slideover
          currService={currService}
          openSlideover={openSlideover}
          setOpenSlideover={setOpenSlideover}
        />
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Navbar setMobileMenuOpen={setMobileMenuOpen} />
          <main className="flex flex-1 overflow-hidden">
            <section className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto lg:order-last">
              <main className="py-8">
                <div className="space-y-8 px-4 sm:px-6">
                  <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">
                    Tjänster
                  </h2>
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-white">
                      {months[new Date().getMonth()]} {new Date().getFullYear()}
                    </h3>
                    <Stats global={false} />
                  </div>
                  <Chart
                    setCurrService={setCurrService}
                    setOpenSlideover={setOpenSlideover}
                  />
                  <History
                    setCurrService={setCurrService}
                    setOpenSlideover={setOpenSlideover}
                  />
                </div>
              </main>
            </section>
            <Directory />
          </main>
        </div>
      </div>
    </>
  );
};

export default ServicesPage;
