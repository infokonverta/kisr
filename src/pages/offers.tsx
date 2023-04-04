import { Dialog, Transition } from "@headlessui/react";
import {
  AcademicCapIcon,
  TrophyIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ResponsiveLine } from "@nivo/line";
import Directory from "@src/components/directory";
import Loading from "@src/components/loading";
import Navbar from "@src/components/navbar";
import Notification from "@src/components/notification";
import Sidebar from "@src/components/sidebar";
import Stats from "@src/components/stats";
import { months } from "@src/data";
import { useMe, useOffers } from "@src/hooks";
import { Error, Offer } from "@src/types";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import format from "date-fns/format";
import { NextPage } from "next";
import Link from "next/link";
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
  date: string;
  amount: string;
};

const Slideover: FC<{
  currOffer: Offer | null;
  openSlideover: boolean;
  setOpenSlideover: Dispatch<SetStateAction<boolean>>;
}> = ({ currOffer, openSlideover, setOpenSlideover }) => {
  const user = useUser();
  const { data, isLoading } = useMe(user?.id);
  const { register, handleSubmit, reset } = useForm<Inputs>();
  useEffect(() => {
    if (openSlideover) reset();
  }, [openSlideover]);
  const queryClient = useQueryClient();
  const createOffer = useMutation(
    async (payload: Inputs) => {
      const offer = await fetch("/api/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          points: data?.user?.points + Number(payload.amount) * 3000,
          offerCount: data?.user?.offerCount + Number(payload.amount),
        }),
      });
      const response = await offer.json();
      return response;
    },
    {
      onSuccess: () => {
        setOpenSlideover(false);
        queryClient.invalidateQueries(["me"]);
        toast.success("Din offert har lagts till");
        queryClient.invalidateQueries(["offers"]);
      },
      onError: (error: Error) => {
        console.log(error);
        toast.error("Offerten kunde inte läggas till");
      },
    }
  );
  const updateOffer = useMutation(
    async (payload: Inputs) => {
      const offer = await fetch("/api/offers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          id: currOffer?.id,
          profileId: currOffer?.profileId,
          points:
            data?.user?.points -
            Number(currOffer?.amount) * 3000 +
            Number(payload.amount) * 3000,
          offerCount:
            data?.user?.offerCount -
            Number(currOffer?.amount) +
            Number(payload.amount),
        }),
      });
      const response = await offer.json();
      return response;
    },
    {
      onSuccess: () => {
        setOpenSlideover(false);
        queryClient.invalidateQueries(["me"]);
        toast.success("Din offert har uppdaterats");
        queryClient.invalidateQueries(["offers"]);
      },
      onError: (error: Error) => {
        console.log(error);
        toast.error("Offerten kunde inte uppdateras");
      },
    }
  );
  const deleteOffer = useMutation(
    async () => {
      const offer = await fetch("/api/offers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currOffer?.id,
          points: data?.user?.points - Number(currOffer?.amount) * 3000,
          offerCount: data?.user?.offerCount - Number(currOffer?.amount),
        }),
      });
      const response = await offer.json();
      return response;
    },
    {
      onSuccess: () => {
        setOpenSlideover(false);
        queryClient.invalidateQueries(["me"]);
        toast.success("Din offert har tagits bort");
        queryClient.invalidateQueries(["offers"]);
      },
      onError: (error: Error) => {
        console.log(error);
        toast.error("Offerten kunde inte tas bort");
      },
    }
  );
  const onSubmit: SubmitHandler<Inputs> = ({ name, date, amount }) => {
    if (currOffer) {
      updateOffer.mutate({
        name,
        date,
        amount,
      });
    } else {
      createOffer.mutate({
        name,
        date,
        amount,
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
                        {currOffer ? (
                          <>
                            <div className="flex items-center justify-between">
                              <Dialog.Title className="text-lg font-medium text-white">
                                Redigera offert
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
                                Lägg till offert
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
                                Fyll i formuläret nedan för att registrera din
                                offert
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
                                  defaultValue={currOffer?.name}
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <label
                                htmlFor="date"
                                className="block text-sm font-medium text-gray-900"
                              >
                                Datum
                              </label>
                              <div className="mt-1">
                                <input
                                  {...register("date")}
                                  type="datetime-local"
                                  name="date"
                                  id="date"
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#EA6D5C] focus:ring-[#EA6D5C] sm:text-sm"
                                  defaultValue={
                                    currOffer
                                      ? currOffer.date + "T" + currOffer.time
                                      : format(new Date(), "yyyy-MM-dd HH:mm")
                                  }
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <label
                                htmlFor="amount"
                                className="block text-sm font-medium text-gray-900"
                              >
                                Antal
                              </label>
                              <div className="mt-1">
                                <select
                                  {...register("amount")}
                                  id="amount"
                                  name="amount"
                                  className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#EA6D5C] focus:outline-none focus:ring-[#EA6D5C] sm:text-sm"
                                  defaultValue={currOffer?.amount}
                                  required
                                >
                                  <option>1</option>
                                  <option>2</option>
                                  <option>3</option>
                                  <option>4</option>
                                  <option>5</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="pt-4 pb-6">
                            <div className="flex text-sm">
                              <Link
                                href="/profile"
                                className="group inline-flex items-center font-medium text-[#EA6D5C] hover:text-[#e85643]"
                              >
                                <TrophyIcon
                                  className="h-5 w-5 text-[#EA6D5C] group-hover:text-[#e85643]"
                                  aria-hidden="true"
                                />
                                <span className="ml-2">
                                  Du har skickat {data?.currMonthOffers ?? 0}{" "}
                                  offerter den här månaden
                                </span>
                              </Link>
                            </div>
                            <div className="mt-4 flex text-sm">
                              <Link
                                href="/profile"
                                className="group inline-flex items-center text-gray-500 hover:text-gray-900"
                              >
                                <AcademicCapIcon
                                  className="h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                                <span className="ml-2">
                                  Ditt mål är att skicka {data?.user?.offerGoal}{" "}
                                  offerter
                                </span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end px-4 py-4">
                      {currOffer ? (
                        <button
                          type="button"
                          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#EA6D5C] focus:ring-offset-2"
                          onClick={() => deleteOffer.mutate()}
                          disabled={
                            isLoading ||
                            createOffer.isLoading ||
                            createOffer.isError ||
                            updateOffer.isLoading ||
                            updateOffer.isError ||
                            deleteOffer.isLoading ||
                            deleteOffer.isError
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
                            createOffer.isLoading ||
                            createOffer.isError ||
                            updateOffer.isLoading ||
                            updateOffer.isError ||
                            deleteOffer.isLoading ||
                            deleteOffer.isError
                            ? "cursor-not-allowed bg-slate-400 hover:bg-slate-500"
                            : "bg-[#EA6D5C] hover:bg-[#e85643]",
                          "ml-4 inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        )}
                        disabled={
                          isLoading ||
                          createOffer.isLoading ||
                          createOffer.isError ||
                          updateOffer.isLoading ||
                          updateOffer.isError ||
                          deleteOffer.isLoading ||
                          deleteOffer.isError
                        }
                      >
                        {isLoading ||
                        createOffer.isLoading ||
                        createOffer.isError ||
                        updateOffer.isLoading ||
                        updateOffer.isError ||
                        deleteOffer.isLoading ||
                        deleteOffer.isError ? (
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
  setCurrOffer: Dispatch<SetStateAction<Offer | null>>;
  setOpenSlideover: Dispatch<SetStateAction<boolean>>;
}> = ({ setCurrOffer, setOpenSlideover }) => {
  const user = useUser();
  const offers = useOffers();
  const offersData = [
    {
      id: "offers",
      data: offers.data?.offers.filter(
        (offer: Offer) => offer.profileId === user?.id
      ).length
        ? offers.data?.offers
            .filter((offer: Offer) => offer.profileId === user?.id)
            .map((offer: Offer) => ({
              x: offer.date,
              y: offers.data?.offers
                ?.filter(
                  (item: Offer) =>
                    item.date === offer.date && item.profileId === user?.id
                )
                .reduce((acc: number, curr: Offer) => acc + curr.amount, 0),
            }))
            .reverse()
        : Array(7)
            .fill(0)
            .map((element, index) => ({
              x: index,
              y: element,
            })),
    },
  ];
  return (
    <div className="flex items-center justify-center overflow-hidden rounded-lg bg-gray-900 shadow">
      <div className="w-full">
        <div className="flex items-center p-6">
          <button
            type="button"
            onClick={() => {
              setCurrOffer(null);
              setOpenSlideover(true);
            }}
            className="ml-auto inline-flex items-center rounded-md border border-transparent bg-[#EA6D5C] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[#e85643] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
          >
            Lägg till offert
          </button>
        </div>
        <div className="h-96 sm:p-6">
          <ResponsiveLine
            data={offersData}
            theme={{
              axis: {
                domain: {
                  line: {
                    stroke: "#fff",
                  },
                },
                ticks: {
                  line: {
                    stroke: "#fff",
                  },
                  text: {
                    fill: "#fff",
                  },
                },
              },
            }}
            margin={{ top: 50, right: 60, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            yFormat=" >-.2f"
            curve="catmullRom"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "",
              legendOffset: 36,
              legendPosition: "middle",
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "",
              legendOffset: -40,
              legendPosition: "middle",
            }}
            enableGridX={false}
            enableGridY={false}
            pointSize={10}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            useMesh={true}
          />
        </div>
      </div>
    </div>
  );
};

const History: FC<{
  setCurrOffer: Dispatch<SetStateAction<Offer | null>>;
  setOpenSlideover: Dispatch<SetStateAction<boolean>>;
}> = ({ setCurrOffer, setOpenSlideover }) => {
  const user = useUser();
  const offers = useOffers();
  const profile = useMe(user?.id);
  return (
    <div className="overflow-hidden rounded-lg bg-gray-900 shadow">
      <div className="p-6">
        <div>
          {!!offers.data && offers.data.length > 0 && (
            <CSVLink
              data={offers.data?.offers
                .filter((offer: Offer) => offer.profileId === user?.id)
                .map((offer: Offer) => ({
                  id: offer.id,
                  säljare: offer.profile.name,
                  företag: offer.name,
                  antal: offer.amount,
                  datum: offer.date,
                  tid: offer.time,
                }))}
              filename="offerter.csv"
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
                            Säljare
                          </a>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          <a href="#" className="group inline-flex">
                            Företag
                          </a>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          <a href="#" className="group inline-flex">
                            Antal
                          </a>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          <a href="#" className="group inline-flex">
                            Datum
                          </a>
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          <span className="sr-only">Redigera</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800">
                      {offers.data?.offers
                        .filter(
                          (offer: Offer) =>
                            offer.profileId === profile.data?.user?.id
                        )
                        .map((offer: Offer) => (
                          <tr key={offer.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                              {offer.profile.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                              {offer.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                              {offer.amount}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                              {offer.date}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrOffer(offer);
                                  setOpenSlideover(true);
                                }}
                                className="text-[#EA6D5C] hover:text-[#e85643]"
                              >
                                Redigera
                              </button>
                            </td>
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

const OffersPage: NextPage = () => {
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [show, setShow] = useState(false);
  const supabaseClient = useSupabaseClient();
  const [openSlideover, setOpenSlideover] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currOffer, setCurrOffer] = useState<Offer | null>(null);
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
          currOffer={currOffer}
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
                    Offerter
                  </h2>
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-white">
                      {months[new Date().getMonth()]} {new Date().getFullYear()}
                    </h3>
                    <Stats global={false} />
                  </div>
                  <Chart
                    setCurrOffer={setCurrOffer}
                    setOpenSlideover={setOpenSlideover}
                  />
                  <History
                    setCurrOffer={setCurrOffer}
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

export default OffersPage;
