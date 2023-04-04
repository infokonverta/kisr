import { Dialog, Transition } from "@headlessui/react";
import { TrophyIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ResponsivePie } from "@nivo/pie";
import { Customer, Profile } from "@prisma/client";
import Directory from "@src/components/directory";
import Loading from "@src/components/loading";
import Navbar from "@src/components/navbar";
import Notification from "@src/components/notification";
import Overlay from "@src/components/overlay";
import Sidebar from "@src/components/sidebar";
import Stats from "@src/components/stats";
import {
  useBookings,
  useMe,
  useMeetings,
  useOffers,
  useProfiles,
  useSales,
  useServices,
} from "@src/hooks";
import { Booking, Error, Meeting, Offer, Sale, Service } from "@src/types";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import format from "date-fns/format";
import { NextPage } from "next";
import Image from "next/image";
import {
  CSSProperties,
  Dispatch,
  FC,
  Fragment,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CSVLink } from "react-csv";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

type Inputs = {
  name: string;
  date: string;
  amount?: string;
  revenue?: string;
  invoice?: string;
  customer: Customer;
};

const Slideover: FC<{
  currSale: Sale | null;
  currOffer: Offer | null;
  currMeeting: Meeting | null;
  currBooking: Booking | null;
  openSlideover: boolean;
  setOpenSlideover: Dispatch<SetStateAction<boolean>>;
}> = ({
  currSale,
  currOffer,
  currMeeting,
  currBooking,
  openSlideover,
  setOpenSlideover,
}) => {
  const { data, isLoading } = useProfiles();
  const { register, handleSubmit, reset } = useForm<Inputs>();
  useEffect(() => {
    if (openSlideover) reset();
  }, [openSlideover]);
  const queryClient = useQueryClient();
  const updateSale = useMutation(
    async (payload: Inputs) => {
      const sale = await fetch("/api/sales", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          id: currSale?.id,
          profileId: currSale?.profileId,
          points:
            data?.find((profile: Profile) => profile.id === currSale?.profileId)
              .points -
            Number(currSale?.revenue) +
            Number(payload.revenue),
          saleCount:
            data?.find((profile: Profile) => profile.id === currSale?.profileId)
              .saleCount -
            Number(currSale?.revenue) +
            Number(payload.revenue),
        }),
      });
      const response = await sale.json();
      return response;
    },
    {
      onSuccess: () => {
        setOpenSlideover(false);
        queryClient.invalidateQueries(["me"]);
        toast.success("Affären har uppdaterats");
        queryClient.invalidateQueries(["sales"]);
      },
      onError: (error: Error) => {
        console.log(error);
        toast.error("Affären kunde inte uppdateras");
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
            data?.find(
              (profile: Profile) => profile.id === currOffer?.profileId
            ).points -
            Number(currOffer?.amount) * 3000 +
            Number(payload.amount) * 3000,
          offerCount:
            data?.find(
              (profile: Profile) => profile.id === currOffer?.profileId
            ).offerCount -
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
        toast.success("Offerten har uppdaterats");
        queryClient.invalidateQueries(["offers"]);
      },
      onError: (error: Error) => {
        console.log(error);
        toast.error("Offerten kunde inte uppdateras");
      },
    }
  );
  const updateMeeting = useMutation(
    async (payload: Inputs) => {
      const meeting = await fetch("/api/meetings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          id: currMeeting?.id,
        }),
      });
      const response = await meeting.json();
      return response;
    },
    {
      onSuccess: () => {
        setOpenSlideover(false);
        toast.success("Mötet har uppdaterats");
        queryClient.invalidateQueries(["meetings"]);
      },
      onError: (error: Error) => {
        console.log(error);
        toast.error("Mötet kunde inte uppdateras");
      },
    }
  );
  const updateBooking = useMutation(
    async (payload: Inputs) => {
      const booking = await fetch("/api/bookings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          id: currBooking?.id,
        }),
      });
      const response = await booking.json();
      return response;
    },
    {
      onSuccess: () => {
        setOpenSlideover(false);
        toast.success("Mötet har uppdaterats");
        queryClient.invalidateQueries(["bookings"]);
      },
      onError: (error: Error) => {
        console.log(error);
        toast.error("Mötet kunde inte uppdateras");
      },
    }
  );
  const onSubmit: SubmitHandler<Inputs> = (payload) => {
    if (currSale) {
      updateSale.mutate(payload);
    }
    if (currOffer) {
      updateOffer.mutate(payload);
    }
    if (currMeeting) {
      updateMeeting.mutate(payload);
    }
    if (currBooking) {
      updateBooking.mutate(payload);
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
                        <div className="flex items-center justify-between">
                          {currSale && (
                            <Dialog.Title className="text-lg font-medium text-white">
                              Redigera affär
                            </Dialog.Title>
                          )}
                          {currOffer && (
                            <Dialog.Title className="text-lg font-medium text-white">
                              Redigera offert
                            </Dialog.Title>
                          )}
                          {currMeeting && (
                            <Dialog.Title className="text-lg font-medium text-white">
                              Redigera genomförd möte
                            </Dialog.Title>
                          )}
                          {currBooking && (
                            <Dialog.Title className="text-lg font-medium text-white">
                              Redigera bokad möte
                            </Dialog.Title>
                          )}
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
                                  defaultValue={
                                    currSale?.name ||
                                    currOffer?.name ||
                                    currMeeting?.name ||
                                    currBooking?.name
                                  }
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
                                    (currSale &&
                                      currSale.date + "T" + currSale.time) ||
                                    (currOffer &&
                                      currOffer.date + "T" + currOffer.time) ||
                                    (currMeeting &&
                                      currMeeting.date +
                                        "T" +
                                        currMeeting.time) ||
                                    (currBooking &&
                                      currBooking.date +
                                        "T" +
                                        currBooking.time) ||
                                    format(new Date(), "yyyy-MM-dd HH:mm")
                                  }
                                  required
                                />
                              </div>
                            </div>
                            {(currSale || currOffer) && (
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
                            )}
                            {currSale && (
                              <>
                                <div>
                                  <label
                                    htmlFor="revenue"
                                    className="block text-sm font-medium text-gray-900"
                                  >
                                    Omsättning
                                  </label>
                                  <div className="mt-1">
                                    <input
                                      {...register("revenue")}
                                      type="number"
                                      name="revenue"
                                      id="revenue"
                                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#EA6D5C] focus:ring-[#EA6D5C] sm:text-sm"
                                      defaultValue={currSale?.revenue}
                                      required
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label
                                    htmlFor="invoice"
                                    className="block text-sm font-medium text-gray-900"
                                  >
                                    Fakturering
                                  </label>
                                  <div className="mt-1">
                                    <select
                                      {...register("invoice")}
                                      id="invoice"
                                      name="invoice"
                                      className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#EA6D5C] focus:outline-none focus:ring-[#EA6D5C] sm:text-sm"
                                      defaultValue={currSale?.invoice}
                                      required
                                    >
                                      <option>1 månad</option>
                                      <option>2 månader</option>
                                      <option>3 månader</option>
                                      <option>4 månader</option>
                                      <option>5 månader</option>
                                      <option>6 månader</option>
                                      <option>7 månader</option>
                                      <option>8 månader</option>
                                      <option>9 månader</option>
                                      <option>10 månader</option>
                                      <option>11 månader</option>
                                      <option>12 månader</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label
                                    htmlFor="customer"
                                    className="block text-sm font-medium text-gray-900"
                                  >
                                    Kund
                                  </label>
                                  <div className="mt-1">
                                    <select
                                      {...register("customer")}
                                      id="customer"
                                      name="customer"
                                      className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-[#EA6D5C] focus:outline-none focus:ring-[#EA6D5C] sm:text-sm"
                                      defaultValue={
                                        currSale?.customer ?? undefined
                                      }
                                      required
                                    >
                                      <option value="NEW">Ny kund</option>
                                      <option value="REPEAT">
                                        Återkommande kund
                                      </option>
                                    </select>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end px-4 py-4">
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#EA6D5C] focus:ring-offset-2"
                        onClick={() => setOpenSlideover(false)}
                      >
                        Avbryt
                      </button>
                      <button
                        type="submit"
                        className={clsx(
                          isLoading ||
                            updateSale.isLoading ||
                            updateSale.isError ||
                            updateOffer.isLoading ||
                            updateOffer.isError ||
                            updateMeeting.isLoading ||
                            updateMeeting.isError ||
                            updateBooking.isLoading ||
                            updateBooking.isError
                            ? "cursor-not-allowed bg-slate-400 hover:bg-slate-500"
                            : "bg-[#EA6D5C] hover:bg-[#e85643]",
                          "ml-4 inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                        )}
                        disabled={
                          isLoading ||
                          updateSale.isLoading ||
                          updateSale.isError ||
                          updateOffer.isLoading ||
                          updateOffer.isError ||
                          updateMeeting.isLoading ||
                          updateMeeting.isError ||
                          updateBooking.isLoading ||
                          updateBooking.isError
                        }
                      >
                        {isLoading ||
                        updateSale.isLoading ||
                        updateSale.isError ||
                        updateOffer.isLoading ||
                        updateOffer.isError ||
                        updateMeeting.isLoading ||
                        updateMeeting.isError ||
                        updateBooking.isLoading ||
                        updateBooking.isError ? (
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

const Badge: FC<{
  src: string;
  alt: string;
}> = ({ src, alt }) => {
  return (
    <div className="relative mx-auto h-12 w-12 sm:h-24 sm:w-24">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
      />
    </div>
  );
};

const Rank: FC<{
  level: number;
}> = ({ level }) => {
  return (
    <>
      {level < 5 && <Badge src="/rookie.png" alt="rookie" />}
      {level >= 5 && level < 10 && <Badge src="/master.png" alt="master" />}
      {level >= 10 && level < 15 && <Badge src="/veteran.png" alt="veteran" />}
      {level >= 15 && level < 20 && <Badge src="/legends.png" alt="legend" />}
      {level >= 20 && level < 25 && <Badge src="/omega.png" alt="omega" />}
      {level >= 25 && level < 30 && <Badge src="/mythic.png" alt="mythic" />}
      {level >= 30 && <Badge src="/goat.png" alt="goat" />}
    </>
  );
};

const Leaderboard: FC = () => {
  const profiles = useProfiles();
  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:col-span-2">
      <div className="flex items-center justify-center overflow-hidden rounded-lg bg-gray-900 shadow">
        <div className="w-full p-6">
          <ul
            role="list"
            className="grid grid-cols-2 gap-x-4 gap-y-8 text-center text-white sm:grid-cols-4"
          >
            {profiles.data
              ?.filter((profile: Profile) => profile.points)
              .slice(0, 4)
              .map((profile: Profile, index: number) => (
                <li key={index} className="relative space-y-2 sm:space-y-4">
                  <div className="relative inline-block h-20 w-20 lg:h-32 lg:w-32">
                    {profile.avatar ? (
                      <Image
                        className={clsx(
                          "block rounded-full border-4",
                          index === 0 && "border-[#C9B037]",
                          index === 1 && "border-[#B4B4B4]",
                          index === 2 && "border-[#6A3805]",
                          index === 3 && "border-[#EA6D5C]"
                        )}
                        src={profile.avatar}
                        alt="avatar"
                        fill
                        sizes="(max-width: 768px) 100vw,
                            (max-width: 1200px) 50vw,
                            33vw"
                      />
                    ) : (
                      <span className="absolute inset-0 rounded-full bg-gray-800 motion-safe:animate-pulse"></span>
                    )}
                    <span
                      className={clsx(
                        "absolute top-0 right-0.5 z-10 block h-6 w-6 transform rounded-full lg:top-1.5 lg:right-2",
                        index === 0 && "bg-[#C9B037]",
                        index === 1 && "bg-[#B4B4B4]",
                        index === 2 && "bg-[#6A3805]",
                        index === 3 && "bg-[#EA6D5C]"
                      )}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={clsx(
                        "absolute top-0 right-0.5 block h-6 w-6 transform rounded-full motion-safe:animate-ping lg:top-1.5 lg:right-2",
                        index === 0 && "bg-[#C9B037]",
                        index === 1 && "bg-[#B4B4B4]",
                        index === 2 && "bg-[#6A3805]",
                        index === 3 && "bg-[#EA6D5C]"
                      )}
                    />
                  </div>
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="font-semibold text-white sm:font-bold">
                    <span className="text-lg">{profile.name}</span>
                    <br />
                    <span className="text-[#EA6D5C]">
                      Level {profile.level}
                    </span>
                  </p>
                  <Rank level={profile.level} />
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const Conversion: FC = () => {
  const sales = useSales();
  const offers = useOffers();
  const style = useMemo(() => {
    const properties: {
      [key: string]: string | number;
    } = {
      "--size": "15rem",
      "--thickness": "0.5rem",
    };
    if (!sales.data || !offers.data) {
      properties["--value"] = 0;
      return properties as CSSProperties;
    }
    properties["--value"] =
      (sales.data?.sales.length / offers.data?.offers.length) * 100;
    return properties as CSSProperties;
  }, [sales.data, offers.data]);
  return (
    <div className="grid h-full grid-cols-1 gap-4">
      <section>
        <div className="overflow-hidden rounded-lg bg-gray-900 shadow xl:h-full">
          <div className="flex h-full flex-col items-center justify-center space-y-12 p-6">
            <div
              className="radial-progress text-2xl font-bold text-[#EA6D5C]"
              style={style}
            >
              {sales.data && offers.data ? (
                <>
                  {(
                    ((sales.data.sales.length ?? 0) /
                      (offers.data.currMonth ?? 1)) *
                    100
                  ).toFixed(2)}
                  %
                </>
              ) : (
                <>0%</>
              )}
            </div>
            <p className="text-center font-semibold text-white sm:text-xl sm:font-bold">
              Konvertering (%)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

const Highest: FC = () => {
  const { data } = useSales();
  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:col-span-3">
      <div className="flex items-center justify-center overflow-hidden rounded-lg bg-gray-900 shadow">
        <div className="space-y-6 p-6">
          <TrophyIcon className="mx-auto h-16 w-16 text-[#EA6D5C] xl:h-24 xl:w-24" />
          <p className="text-center text-2xl font-semibold text-white sm:font-bold">
            Största försäljning den här månaden <br />
            <span className="mt-6 block text-4xl text-[#EA6D5C]">
              {data?.highest?.revenue ?? 0}
            </span>
          </p>
          <p className="text-center text-sm font-medium text-gray-500">
            {data?.highest?.profile.name ?? ""}
          </p>
        </div>
      </div>
    </div>
  );
};

const Distribution: FC = () => {
  const sales = useSales();
  const data = [
    {
      id: "Ny kund",
      label: "Ny kund",
      value: sales.data?.sales.filter((sale: Sale) => sale.customer === "NEW")
        .length,
    },
    {
      id: "Befintlig kund",
      label: "Befintlig kund",
      value: sales.data?.sales.filter(
        (sale: Sale) => sale.customer === "REPEAT"
      ).length,
    },
  ];
  return (
    <div className="grid h-full grid-cols-1 gap-4">
      <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-gray-900 shadow">
        <div className="p-6">
          <div className="h-96 w-96">
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
              legends={[
                {
                  anchor: "bottom",
                  direction: "row",
                  justify: false,
                  translateX: 0,
                  translateY: 56,
                  itemsSpacing: 0,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: "#fff",
                  itemDirection: "left-to-right",
                  itemOpacity: 1,
                  symbolSize: 18,
                  symbolShape: "circle",
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemTextColor: "#fff",
                      },
                    },
                  ],
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Services: FC = () => {
  const services = useServices();
  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:col-span-2">
      <section>
        <div className="overflow-hidden rounded-lg bg-gray-900 shadow xl:h-full">
          {services.data?.services.length >= 5 && (
            <>
              <div className="h-96 sm:p-6">
                <ResponsivePie
                  data={[...services.data?.services]
                    .splice(0, 5)
                    .filter((service: Service) => service.sales.length)
                    .map((service: Service) => ({
                      id: service.name,
                      label: service.name,
                      value: service.sales.length,
                    }))}
                  margin={{ top: 20, right: 100, bottom: 20, left: 100 }}
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
              <p className="p-6 text-center text-sm font-medium text-gray-500 sm:p-0">
                Top 5 mest sålda paket
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

const History: FC<{
  setCurrSale: Dispatch<SetStateAction<Sale | null>>;
  setCurrOffer: Dispatch<SetStateAction<Offer | null>>;
  setCurrMeeting: Dispatch<SetStateAction<Meeting | null>>;
  setCurrBooking: Dispatch<SetStateAction<Booking | null>>;
  setOpenSlideover: Dispatch<SetStateAction<boolean>>;
}> = ({
  setCurrSale,
  setCurrOffer,
  setCurrMeeting,
  setCurrBooking,
  setOpenSlideover,
}) => {
  const user = useUser();
  const sales = useSales();
  const offers = useOffers();
  const meetings = useMeetings();
  const bookings = useBookings();
  const profile = useMe(user?.id);
  const [area, setArea] = useState("Affärer");
  const salesData = useMemo(() => {
    return sales.data
      ? sales.data?.sales?.map((sale: Sale) => ({
          id: sale.id,
          säljare: sale.profile.name,
          företag: sale.name,
          antal: sale.amount,
          fakturering: sale.invoice,
          omsättning: sale.revenue,
          provision: sale.provision,
          datum: sale.date,
          tid: sale.time,
        }))
      : [];
  }, [sales.data]);
  const offersData = useMemo(() => {
    return offers.data
      ? offers.data?.offers?.map((offer: Offer) => ({
          id: offer.id,
          säljare: offer.profile.name,
          företag: offer.name,
          antal: offer.amount,
          datum: offer.date,
          tid: offer.time,
        }))
      : [];
  }, [offers.data]);
  const meetingsData = useMemo(() => {
    return meetings.data
      ? meetings.data?.meetings?.map((meeting: Meeting) => ({
          id: meeting.id,
          säljare: meeting.profile.name,
          företag: meeting.name,
          datum: meeting.date,
          tid: meeting.time,
        }))
      : [];
  }, [meetings.data]);
  const bookingsData = useMemo(() => {
    return bookings.data
      ? bookings.data?.bookings?.map((booking: Booking) => ({
          id: booking.id,
          säljare: booking.profile.name,
          företag: booking.name,
          datum: booking.date,
          tid: booking.time,
        }))
      : [];
  }, [bookings.data]);
  return (
    <div className="overflow-hidden rounded-lg bg-gray-900 shadow">
      <div className="p-6">
        <div>
          <div className="flex items-center">
            <div>
              <label
                htmlFor="area"
                className="block text-sm font-medium text-white"
              >
                Område
              </label>
              <select
                id="area"
                name="area"
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base text-black focus:border-[#EA6D5C] focus:outline-none focus:ring-[#EA6D5C] sm:text-sm"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              >
                <option>Affärer</option>
                <option>Genomförda möten</option>
                <option>Offerter</option>
                <option>Bokade möten</option>
              </select>
            </div>
            {profile.data?.user?.role === "ADMIN" && (
              <>
                {sales.data?.sales?.length > 0 && area === "Affärer" && (
                  <CSVLink
                    data={salesData}
                    filename="team.csv"
                    className="mt-6 ml-3 inline-flex items-center rounded-md border border-transparent bg-[#EA6D5C] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[#e85643] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                  >
                    Exportera
                  </CSVLink>
                )}
                {meetings.data?.meetings?.length > 0 &&
                  area === "Genomförda möten" && (
                    <CSVLink
                      data={meetingsData}
                      filename="team.csv"
                      className="mt-6 ml-3 inline-flex items-center rounded-md border border-transparent bg-[#EA6D5C] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[#e85643] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                    >
                      Exportera
                    </CSVLink>
                  )}
                {offers.data?.offers?.length > 0 && area === "Offerter" && (
                  <CSVLink
                    data={offersData}
                    filename="team.csv"
                    className="mt-6 ml-3 inline-flex items-center rounded-md border border-transparent bg-[#EA6D5C] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[#e85643] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                  >
                    Exportera
                  </CSVLink>
                )}
                {bookings.data?.bookings?.length > 0 &&
                  area === "Bokade möten" && (
                    <CSVLink
                      data={bookingsData}
                      filename="team.csv"
                      className="mt-6 ml-3 inline-flex items-center rounded-md border border-transparent bg-[#EA6D5C] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[#e85643] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                    >
                      Exportera
                    </CSVLink>
                  )}
              </>
            )}
          </div>
          {area === "Genomförda möten" && (
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
                              Datum
                            </a>
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                          >
                            <a href="#" className="group inline-flex">
                              Tid
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
                        {meetings.data?.meetings?.map((meeting: Meeting) => (
                          <tr key={meeting.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                              {meeting.profile.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                              {meeting.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                              {meeting.date}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                              {meeting.time}
                            </td>
                            {profile.data?.user?.role === "ADMIN" && (
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <button
                                  type="button"
                                  className="text-[#EA6D5C] hover:text-[#e85643]"
                                  onClick={() => {
                                    setCurrSale(null);
                                    setCurrOffer(null);
                                    setCurrBooking(null);
                                    setOpenSlideover(true);
                                    setCurrMeeting(meeting);
                                  }}
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
          )}
          {area === "Offerter" && (
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
                        {offers.data?.offers?.map((offer: Offer) => (
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
                            {profile.data?.user?.role === "ADMIN" && (
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <button
                                  type="button"
                                  className="text-[#EA6D5C] hover:text-[#e85643]"
                                  onClick={() => {
                                    setCurrSale(null);
                                    setCurrOffer(offer);
                                    setCurrMeeting(null);
                                    setCurrBooking(null);
                                    setOpenSlideover(true);
                                  }}
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
          )}
          {area === "Affärer" && (
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
                              Omsättning
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
                        {sales.data?.sales?.map((sale: Sale) => (
                          <tr key={sale.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                              {sale.profile.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                              {sale.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                              {sale.revenue}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                              {sale.date}
                            </td>
                            {profile.data?.user?.role === "ADMIN" && (
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <button
                                  onClick={() => {
                                    setCurrSale(sale);
                                    setCurrOffer(null);
                                    setCurrMeeting(null);
                                    setCurrBooking(null);
                                    setOpenSlideover(true);
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
          )}
          {area === "Bokade möten" && (
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
                              Datum
                            </a>
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                          >
                            <a href="#" className="group inline-flex">
                              Tid
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
                        {bookings.data?.bookings?.map((booking: Booking) => (
                          <tr key={booking.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                              {booking.profile.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                              {booking.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                              {booking.date}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-white">
                              {booking.time}
                            </td>
                            {profile.data?.user?.role === "ADMIN" && (
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <button
                                  type="button"
                                  className="text-[#EA6D5C] hover:text-[#e85643]"
                                  onClick={() => {
                                    setCurrSale(null);
                                    setCurrOffer(null);
                                    setCurrMeeting(null);
                                    setOpenSlideover(true);
                                    setCurrBooking(booking);
                                  }}
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
          )}
        </div>
      </div>
    </div>
  );
};

const HomePage: NextPage = () => {
  const sales = useSales();
  const offers = useOffers();
  const meetings = useMeetings();
  const bookings = useBookings();
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [show, setShow] = useState(false);
  const supabaseClient = useSupabaseClient();
  const [openSlideover, setOpenSlideover] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currSale, setCurrSale] = useState<Sale | null>(null);
  const [currOffer, setCurrOffer] = useState<Offer | null>(null);
  const [currMeeting, setCurrMeeting] = useState<Meeting | null>(null);
  const [currBooking, setCurrBooking] = useState<Booking | null>(null);
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
      {(sales.isLoading ||
        sales.isError ||
        offers.isLoading ||
        offers.isError ||
        meetings.isLoading ||
        meetings.isError ||
        bookings.isLoading ||
        bookings.isError) && <Overlay />}
      <Notification body={body} show={show} title={title} setShow={setShow} />
      <div className="flex sm:h-screen">
        <Slideover
          currSale={currSale}
          currOffer={currOffer}
          currMeeting={currMeeting}
          currBooking={currBooking}
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
                    Dashboard
                  </h2>
                  <div>
                    <label htmlFor="month" className="sr-only">
                      Månad
                    </label>
                    <input
                      lang="sv"
                      type="month"
                      name="month"
                      id="month"
                      className="block w-full rounded-md border-none bg-gray-900 p-4 text-white shadow-sm focus:border-[#EA6D5C] focus:ring-[#EA6D5C]"
                      defaultValue={format(new Date(), "yyyy-MM")}
                    />
                  </div>
                  <Stats global={true} />
                  <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-3">
                    <Highest />
                    <Leaderboard />
                    <Conversion />
                    <Services />
                    <Distribution />
                  </div>
                  <History
                    setCurrSale={setCurrSale}
                    setCurrOffer={setCurrOffer}
                    setCurrMeeting={setCurrMeeting}
                    setCurrBooking={setCurrBooking}
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

export default HomePage;
