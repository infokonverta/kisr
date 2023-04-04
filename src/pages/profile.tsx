import { Dialog, Transition } from "@headlessui/react";
import { MinusIcon } from "@heroicons/react/24/outline";
import { ResponsiveLine } from "@nivo/line";
import { Profile } from "@prisma/client";
import Directory from "@src/components/directory";
import Loading from "@src/components/loading";
import Navbar from "@src/components/navbar";
import Notification from "@src/components/notification";
import Sidebar from "@src/components/sidebar";
import Stats from "@src/components/stats";
import { months } from "@src/data";
import {
  useBookings,
  useMe,
  useMeetings,
  useOffers,
  useSales,
} from "@src/hooks";
import { Booking, Error, Meeting, Offer, Sale } from "@src/types";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { NextPage } from "next";
import Image from "next/image";
import {
  CSSProperties,
  Dispatch,
  FC,
  FormEvent,
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
  meetingGoal: string;
  saleGoal: string;
  offerGoal: string;
  bookingGoal: string;
};

const Modal: FC<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}> = ({ open, setOpen }) => {
  const user = useUser();
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const { data, isLoading } = useMe(user?.id);
  const queryClient = useQueryClient();
  const supabaseClient = useSupabaseClient();
  useEffect(() => {
    if (!open) {
      setImage(null);
      setImageUrl(null);
      setImageName(null);
    }
  }, [open]);
  const handleUpdate = async (payload: {
    name: string;
    avatar?: string;
    meetingGoal: number;
    offerGoal: number;
    saleGoal: number;
    bookingGoal: number;
  }) => {
    const me = await fetch("/api/me/" + user?.id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const response = await me.json();
    return response;
  };
  const { register, handleSubmit } = useForm<Inputs>();
  const update = useMutation(handleUpdate, {
    onSuccess: () => {
      setOpen(false);
      queryClient.invalidateQueries(["me"]);
      queryClient.invalidateQueries(["profiles"]);
      toast.success("Dina inställningar har sparats");
    },
    onError: (error: Error) => {
      console.log(error);
      toast.error("Dina inställningar kunde inte sparas");
    },
  });
  const onSubmit: SubmitHandler<Inputs> = async ({
    name,
    meetingGoal,
    offerGoal,
    saleGoal,
    bookingGoal,
  }) => {
    if ((!imageName || !image || !imageUrl) && data?.user?.avatar) {
      update.mutate({
        name,
        avatar: data?.user?.avatar,
        meetingGoal: Number(meetingGoal),
        offerGoal: Number(offerGoal),
        saleGoal: Number(saleGoal),
        bookingGoal: Number(bookingGoal),
      });
    } else if (imageName && image && imageUrl && !data?.user?.avatar) {
      const { error } = await supabaseClient.storage
        .from("avatars")
        .upload(imageName, image, {
          cacheControl: "3600",
          upsert: false,
        });
      if (error) {
        console.log(error);
        toast.error("Det gick inte att ladda upp din profilbild");
      }
      update.mutate({
        name,
        avatar: imageUrl,
        meetingGoal: Number(meetingGoal),
        offerGoal: Number(offerGoal),
        saleGoal: Number(saleGoal),
        bookingGoal: Number(bookingGoal),
      });
    } else if (imageName && image && imageUrl && data?.user?.avatar) {
      const { error } = await supabaseClient.storage
        .from("avatars")
        .update(imageName, image, {
          cacheControl: "3600",
          upsert: false,
        });
      if (error) {
        console.log(error);
        toast.error("Det gick inte att uppdatera din profilbild");
      }
      update.mutate({
        name,
        avatar: imageUrl,
        meetingGoal: Number(meetingGoal),
        offerGoal: Number(offerGoal),
        saleGoal: Number(saleGoal),
        bookingGoal: Number(bookingGoal),
      });
    } else {
      update.mutate({
        name,
        meetingGoal: Number(meetingGoal),
        offerGoal: Number(offerGoal),
        saleGoal: Number(saleGoal),
        bookingGoal: Number(bookingGoal),
      });
    }
  };
  const handleImage = async (event: FormEvent<HTMLInputElement>) => {
    event.preventDefault();
    const target = event.target as typeof event.target & {
      files: File[];
    };
    const file = target.files[0];
    const fileExt = file.name.split(".").pop();
    let filename = data?.user?.avatar
      ? data?.user?.avatar.split("avatars/")[1].split("?")[0]
      : `${Math.random()}.${fileExt}`;
    setImage(file);
    setImageName(filename);
    setImageUrl(
      "https://musoavshgjpdedkxyflw.supabase.co/storage/v1/object/public/avatars/" +
        filename +
        "?bust=" +
        Date.now()
    );
  };
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative my-8 w-full max-w-xl transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all">
                <div>
                  <div className="mt-3 sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Inställningar
                    </Dialog.Title>
                    <form
                      className="divide-y-slate-200 mt-6 space-y-8 divide-y"
                      onSubmit={handleSubmit(onSubmit)}
                    >
                      <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
                        <div className="sm:col-span-6">
                          <label
                            htmlFor="first-name"
                            className="block text-sm font-medium text-slate-900"
                          >
                            Namn
                          </label>
                          <input
                            {...register("name")}
                            type="text"
                            name="name"
                            id="name"
                            className="mt-1 block w-full rounded-md border-slate-300 text-slate-900 shadow-sm focus:border-[#EA6D5C] focus:ring-[#EA6D5C] sm:text-sm"
                            defaultValue={data?.user?.name}
                          />
                        </div>
                        <div className="sm:col-span-6">
                          <label
                            htmlFor="photo"
                            className="block text-sm font-medium text-slate-900"
                          >
                            Bild (1:1 storlek)
                          </label>
                          <div className="mt-1 flex items-center">
                            <img
                              className="inline-block h-12 w-12 rounded-full"
                              src={
                                image
                                  ? URL.createObjectURL(image)
                                  : data?.user?.avatar ?? ""
                              }
                              alt="avatar"
                            />
                            <div className="ml-4 flex">
                              <div className="relative flex cursor-pointer items-center rounded-md border border-slate-300 bg-white py-2 px-3 shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-[#EA6D5C] focus-within:ring-offset-2 focus-within:ring-offset-slate-50 hover:bg-slate-50">
                                <label
                                  htmlFor="user-photo"
                                  className="pointer-events-none relative text-sm font-medium text-slate-900"
                                >
                                  <span>Ändra</span>
                                  <span className="sr-only"> profilbild</span>
                                </label>
                                <input
                                  id="user-photo"
                                  name="user-photo"
                                  type="file"
                                  className="absolute inset-0 h-full w-full cursor-pointer rounded-md border-gray-300 opacity-0"
                                  onChange={handleImage}
                                />
                              </div>
                              {/* <button
                                type="button"
                                className="ml-3 rounded-md border border-transparent bg-transparent py-2 px-3 text-sm font-medium text-slate-900 hover:text-slate-700 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#EA6D5C] focus:ring-offset-2 focus:ring-offset-slate-50"
                              >
                                Ta bort
                              </button> */}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-y-6 pt-8 sm:grid-cols-6 sm:gap-x-6">
                        <div className="sm:col-span-6">
                          <h2 className="text-xl font-medium text-slate-900">
                            Utvecklingsmål
                          </h2>
                        </div>

                        <div className="sm:col-span-3">
                          <label
                            htmlFor="meetings"
                            className="block text-sm font-medium text-slate-900"
                          >
                            Genomförda möten (i antal)
                          </label>
                          <input
                            {...register("meetingGoal")}
                            type="number"
                            name="meetingGoal"
                            id="meetings"
                            className="mt-1 block w-full rounded-md border-slate-300 text-slate-900 shadow-sm focus:border-[#EA6D5C] focus:ring-[#EA6D5C] sm:text-sm"
                            defaultValue={data?.user?.meetingGoal}
                            min={1}
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label
                            htmlFor="offers"
                            className="block text-sm font-medium text-slate-900"
                          >
                            Skickade offerter (i antal)
                          </label>
                          <input
                            {...register("offerGoal")}
                            type="number"
                            name="offerGoal"
                            id="offers"
                            className="mt-1 block w-full rounded-md border-slate-300 text-slate-900 shadow-sm focus:border-[#EA6D5C] focus:ring-[#EA6D5C] sm:text-sm"
                            defaultValue={data?.user?.offerGoal}
                            min={1}
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label
                            htmlFor="sales"
                            className="block text-sm font-medium text-slate-900"
                          >
                            Försäljningar (i omsättning)
                          </label>
                          <input
                            {...register("saleGoal")}
                            type="number"
                            name="saleGoal"
                            id="sales"
                            className="mt-1 block w-full rounded-md border-slate-300 text-slate-900 shadow-sm focus:border-[#EA6D5C] focus:ring-[#EA6D5C] sm:text-sm"
                            defaultValue={data?.user?.saleGoal}
                            min={1}
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label
                            htmlFor="bookings"
                            className="block text-sm font-medium text-slate-900"
                          >
                            Bokade möten (i antal)
                          </label>
                          <input
                            {...register("bookingGoal")}
                            type="number"
                            name="bookingGoal"
                            id="bookings"
                            className="mt-1 block w-full rounded-md border-slate-300 text-slate-900 shadow-sm focus:border-[#EA6D5C] focus:ring-[#EA6D5C] sm:text-sm"
                            defaultValue={data?.user?.bookingGoal}
                            min={1}
                          />
                        </div>

                        <p className="text-sm text-slate-500 sm:col-span-6">
                          Senaste ändringar gjordes{" "}
                          <time dateTime={data?.user?.updatedAt}>
                            {data?.user?.updatedAt
                              .toString()
                              .replace("T", ", ")
                              .substring(0, 17)}
                          </time>
                          .
                        </p>
                      </div>
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <button
                          type="submit"
                          className={clsx(
                            isLoading || update.isLoading || update.isError
                              ? "cursor-not-allowed bg-slate-400 hover:bg-slate-500"
                              : "bg-[#EA6D5C] hover:bg-[#e85643]",
                            "inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                          )}
                          disabled={
                            isLoading || update.isLoading || update.isError
                          }
                        >
                          {isLoading || update.isLoading || update.isError ? (
                            <Loading />
                          ) : (
                            "Spara"
                          )}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                          onClick={() => setOpen(false)}
                        >
                          Avbryt
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

const Header: FC = () => {
  const user = useUser();
  const profile = useMe(user?.id);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const handleLevelup = async (payload: {
    level: number;
    meetingCount: number;
    offerCount: number;
    saleCount: number;
  }) => {
    const me = await fetch("/api/me/" + user?.id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const response = await me.json();
    return response;
  };
  const levelup = useMutation(handleLevelup, {
    onSuccess: (data: Profile) => {
      toast.success("Du har gått upp till level " + data.level);
      queryClient.invalidateQueries(["me"]);
    },
    onError: (error: Error) => {
      console.log(error);
      toast.error("Det gick inte gå upp i level");
    },
  });
  return (
    <>
      <Modal open={open} setOpen={setOpen} />
      <div className="mx-auto mt-8 md:flex md:items-center md:justify-between md:space-x-5">
        <div className="flex items-center space-x-5">
          <div className="flex-shrink-0">
            <div className="relative h-16 w-16">
              {profile.data?.user?.avatar ? (
                <Image
                  className="rounded-full"
                  src={profile.data?.user?.avatar}
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
                className="absolute inset-0 rounded-full shadow-inner"
                aria-hidden="true"
              />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {profile.data?.user?.name}
            </h1>
            <p className="text-sm font-medium text-gray-500">
              Level {profile.data?.user?.level}
            </p>
          </div>
        </div>
        <div className="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#EA6D5C] focus:ring-offset-2 focus:ring-offset-gray-100"
          >
            Inställningar
          </button>
          <button
            type="button"
            onClick={() =>
              levelup.mutate({
                level: profile.data?.user?.level + 1,
                meetingCount:
                  profile.data?.user?.meetingCount -
                  8 * profile.data?.user.level,
                offerCount:
                  profile.data?.user?.offerCount -
                  6 * profile.data?.user?.level,
                saleCount:
                  profile.data?.user?.saleCount -
                  14000 * profile.data?.user?.level,
              })
            }
            className={clsx(
              ((profile.data?.user?.saleCount ?? 0) /
                (14000 * (profile.data?.user?.level ?? 1))) *
                100 <
                100 ||
                ((profile.data?.user?.meetingCount ?? 0) /
                  (8 * (profile.data?.user?.level ?? 1))) *
                  100 <
                  100 ||
                ((profile.data?.user?.offerCount ?? 0) /
                  (6 * (profile.data?.user?.level ?? 1))) *
                  100 <
                  100
                ? "cursor-not-allowed bg-slate-400 hover:bg-slate-500"
                : "bg-[#EA6D5C] hover:bg-[#e85643]",
              "inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#EA6D5C] focus:ring-offset-2 focus:ring-offset-gray-100"
            )}
            disabled={
              ((profile.data?.user?.saleCount ?? 0) /
                (14000 * (profile.data?.user?.level ?? 1))) *
                100 <
                100 ||
              ((profile.data?.user?.meetingCount ?? 0) /
                (8 * (profile.data?.user?.level ?? 1))) *
                100 <
                100 ||
              ((profile.data?.user?.offerCount ?? 0) /
                (6 * (profile.data?.user?.level ?? 1))) *
                100 <
                100
            }
          >
            Level up
          </button>
        </div>
      </div>
    </>
  );
};

const Chart: FC = () => {
  const user = useUser();
  const sales = useSales();
  const offers = useOffers();
  const meetings = useMeetings();
  const bookings = useBookings();
  const profile = useMe(user?.id);
  const [area, setArea] = useState("Affärer");
  const salesData = [
    {
      id: "sales",
      data: sales.data?.sales.filter(
        (sale: Sale) => sale.profileId === user?.id
      ).length
        ? sales.data?.sales
            .filter((sale: Sale) => sale.profileId === user?.id)
            .map((sale: Sale) => ({
              x: sale.date,
              y: sales.data?.sales
                ?.filter(
                  (item: Sale) =>
                    item.date === sale.date && item.profileId === user?.id
                )
                .reduce((acc: number, curr: Sale) => acc + curr.revenue, 0),
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
  const meetingsData = [
    {
      id: "meetings",
      data: meetings.data?.meetings.filter(
        (meeting: Meeting) => meeting.profileId === user?.id
      ).length
        ? meetings.data?.meetings
            .filter((meeting: Meeting) => meeting.profileId === user?.id)
            .map((meeting: Meeting) => ({
              x: meeting.date,
              y: meetings.data?.meetings?.filter(
                (item: Meeting) =>
                  item.date === meeting.date && item.profileId === user?.id
              ).length,
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
  const bookingsData = [
    {
      id: "bookings",
      data: bookings.data?.bookings.filter(
        (booking: Booking) => booking.profileId === user?.id
      ).length
        ? bookings.data?.bookings
            .filter((booking: Booking) => booking.profileId === user?.id)
            .map((booking: Booking) => ({
              x: booking.date,
              y: bookings.data?.bookings?.filter(
                (item: Meeting) =>
                  item.date === booking.date && item.profileId === user?.id
              ).length,
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
    <div className="grid h-full grid-cols-1 gap-4 xl:col-span-2">
      <div className="flex items-center justify-center overflow-hidden rounded-lg bg-gray-900 shadow">
        <div className="w-full sm:p-6">
          <div className="flex items-center p-6">
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
            {sales.data?.sales.filter(
              (sale: Sale) => sale.profileId === user?.id
            ).length > 0 &&
              area === "Affärer" && (
                <CSVLink
                  data={sales.data?.sales
                    .filter((sale: Sale) => sale.profileId === user?.id)
                    .map((sale: Sale) => ({
                      id: sale.id,
                      säljare: sale.profile.name,
                      företag: sale.name,
                      antal: sale.amount,
                      fakturering: sale.invoice,
                      omsättning: sale.revenue,
                      provision: sale.provision,
                      datum: sale.date,
                      tid: sale.time,
                    }))}
                  filename={profile.data?.user?.name + ".csv"}
                  className="mt-6 ml-3 inline-flex items-center rounded-md border border-transparent bg-[#EA6D5C] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[#e85643] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                >
                  Exportera
                </CSVLink>
              )}
            {meetings.data?.meetings.filter(
              (meeting: Meeting) => meeting.profileId === user?.id
            ).length > 0 &&
              area === "Genomförda möten" && (
                <CSVLink
                  data={meetings.data?.meetings
                    .filter(
                      (meeting: Meeting) => meeting.profileId === user?.id
                    )
                    .map((meeting: Meeting) => ({
                      id: meeting.id,
                      säljare: meeting.profile.name,
                      företag: meeting.name,
                      datum: meeting.date,
                      tid: meeting.time,
                    }))}
                  filename={profile.data?.user?.name + ".csv"}
                  className="mt-6 ml-3 inline-flex items-center rounded-md border border-transparent bg-[#EA6D5C] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[#e85643] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                >
                  Exportera
                </CSVLink>
              )}
            {offers.data?.offers.filter(
              (offer: Offer) => offer.profileId === user?.id
            ).length > 0 &&
              area === "Offerter" && (
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
                  filename={profile.data?.user?.name + ".csv"}
                  className="mt-6 ml-3 inline-flex items-center rounded-md border border-transparent bg-[#EA6D5C] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[#e85643] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                >
                  Exportera
                </CSVLink>
              )}
            {bookings.data?.bookings.filter(
              (booking: Booking) => booking.profileId === user?.id
            ).length > 0 &&
              area === "Bokade möten" && (
                <CSVLink
                  data={bookings.data?.bookings
                    .filter(
                      (booking: Booking) => booking.profileId === user?.id
                    )
                    .map((booking: Booking) => ({
                      id: booking.id,
                      säljare: booking.profile.name,
                      företag: booking.name,
                      datum: booking.date,
                      tid: booking.time,
                    }))}
                  filename={profile.data?.user?.name + ".csv"}
                  className="mt-6 ml-3 inline-flex items-center rounded-md border border-transparent bg-[#EA6D5C] px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-[#e85643] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                >
                  Exportera
                </CSVLink>
              )}
          </div>
          <div className="h-96">
            {area === "Affärer" && sales.data && (
              <ResponsiveLine
                data={salesData}
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
            )}
            {area === "Offerter" && offers.data && (
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
            )}
            {area === "Genomförda möten" && meetings.data && (
              <ResponsiveLine
                data={meetingsData}
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
            )}
            {area === "Bokade möten" && bookings.data && (
              <ResponsiveLine
                data={bookingsData}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NextBadge: FC<{
  src: string;
  alt: string;
}> = ({ src, alt }) => {
  return (
    <div className="relative mx-auto h-6 w-6">
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

const NextRank: FC<{
  level: number;
}> = ({ level }) => {
  return (
    <>
      {level + 5 < 5 && <NextBadge src="/rookie.png" alt="rookie" />}
      {level + 5 >= 5 && level + 5 < 10 && (
        <NextBadge src="/master.png" alt="master" />
      )}
      {level + 5 >= 10 && level + 5 < 15 && (
        <NextBadge src="/veteran.png" alt="veteran" />
      )}
      {level + 5 >= 15 && level + 5 < 20 && (
        <NextBadge src="/legend.png" alt="legend" />
      )}
      {level + 5 >= 20 && level + 5 < 25 && (
        <NextBadge src="/omega.png" alt="omega" />
      )}
      {level + 5 >= 25 && level + 5 < 30 && (
        <NextBadge src="/mythic.png" alt="mythic" />
      )}
    </>
  );
};

const CurrBadge: FC<{
  src: string;
  alt: string;
}> = ({ src, alt }) => {
  return (
    <div className="relative mx-auto h-32 w-32">
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

const CurrRank: FC<{
  level: number;
}> = ({ level }) => {
  return (
    <>
      {level < 5 && <CurrBadge src="/rookie.png" alt="rookie" />}
      {level >= 5 && level < 10 && <CurrBadge src="/master.png" alt="master" />}
      {level >= 10 && level < 15 && (
        <CurrBadge src="/veteran.png" alt="veteran" />
      )}
      {level >= 15 && level < 20 && (
        <CurrBadge src="/legends.png" alt="legend" />
      )}
      {level >= 20 && level < 25 && <CurrBadge src="/omega.png" alt="omega" />}
      {level >= 25 && level < 30 && (
        <CurrBadge src="/mythic.png" alt="mythic" />
      )}
      {level >= 30 && <CurrBadge src="/goat.png" alt="goat" />}
    </>
  );
};

const Status: FC = () => {
  const user = useUser();
  const { data } = useMe(user?.id);
  return (
    <div className="grid h-full grid-cols-1 gap-4">
      <section>
        <div className="overflow-hidden rounded-lg bg-gray-900 shadow xl:h-full">
          <div className="relative flex h-full flex-col items-center justify-center space-y-6 p-6">
            <span className="absolute inset-0" aria-hidden="true" />
            <CurrRank level={data?.user?.level} />
            <p className="text-center text-lg font-semibold text-white sm:text-2xl sm:font-bold">
              {data?.user?.level < 5 && "ROOKIE"}
              {data?.user?.level >= 5 && data?.user?.level < 10 && "MASTER"}
              {data?.user?.level >= 10 && data?.user?.level < 15 && "VETERAN"}
              {data?.user?.level >= 15 && data?.user?.level < 20 && "LEGEND"}
              {data?.user?.level >= 20 && data?.user?.level < 25 && "OMEGA"}
              {data?.user?.level >= 25 && data?.user?.level < 30 && "MYTHIC"}
              {data?.user?.level >= 30 && "GOAT"}
            </p>
            <div className="flex items-center justify-center space-x-6">
              {data?.user?.level >= 30 ? (
                <p className="text-sm font-medium text-gray-500">
                  Du har nått max rank
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-500">
                    Nästa rank
                  </p>
                  <MinusIcon className="h-6 w-6" />
                  <NextRank level={data?.user?.level} />
                </>
              )}
            </div>
            <p className="text-center font-semibold text-white sm:text-xl sm:font-bold">
              Dina poäng den här månaden ligger på <br />
              <span className="mt-6 block text-lg text-[#EA6D5C] sm:text-2xl">
                {data?.user?.points}
              </span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

const Goals: FC = () => {
  const user = useUser();
  const { data } = useMe(user?.id);
  const meetingStyle = {
    "--value":
      ((data?.currMonthMeetings ?? 0) / (data?.user?.meetingGoal ?? 1)) * 100,
    "--size": "9rem",
    "--thickness": "0.5rem",
  } as CSSProperties;
  const offerStyle = {
    "--value":
      ((data?.currMonthOffers ?? 0) / (data?.user?.offerGoal ?? 1)) * 100,
    "--size": "9rem",
    "--thickness": "0.5rem",
  } as CSSProperties;
  const saleStyle = {
    "--value":
      ((data?.currMonthSales ?? 0) / (data?.user?.saleGoal ?? 1)) * 100,
    "--size": "9rem",
    "--thickness": "0.5rem",
  } as CSSProperties;
  const bookingStyle = {
    "--value":
      ((data?.currMonthBookings ?? 0) / (data?.user?.bookingGoal ?? 1)) * 100,
    "--size": "9rem",
    "--thickness": "0.5rem",
  } as CSSProperties;
  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:col-span-2">
      <div className="flex items-center justify-center overflow-hidden rounded-lg bg-gray-900 shadow">
        <div className="flex w-full flex-col items-center space-y-12 p-6 sm:flex-row sm:justify-between sm:space-y-0">
          <div className="space-y-12">
            <p className="text-center text-sm font-semibold text-white">
              Genomförda möten
            </p>
            <div
              className="radial-progress mx-auto flex items-center justify-center text-[#EA6D5C]"
              style={meetingStyle}
            >
              {(((data?.currMonthMeetings ?? 0) /
                (data?.user?.meetingGoal ?? 1)) *
                100 >
              100
                ? 100
                : ((data?.currMonthMeetings ?? 0) /
                    (data?.user?.meetingGoal ?? 1)) *
                  100
              ).toFixed(0)}
              %
            </div>
          </div>
          <div className="space-y-12">
            <p className="text-center text-sm font-semibold text-white">
              Skickade offerter
            </p>
            <div
              className="radial-progress mx-auto flex items-center justify-center text-[#EA6D5C]"
              style={offerStyle}
            >
              {(((data?.currMonthOffers ?? 0) / (data?.user?.offerGoal ?? 1)) *
                100 >
              100
                ? 100
                : ((data?.currMonthOffers ?? 0) /
                    (data?.user?.offerGoal ?? 1)) *
                  100
              ).toFixed(0)}
              %
            </div>
          </div>
          <div className="space-y-12">
            <p className="text-center text-sm font-semibold text-white">
              Försäljningar
            </p>
            <div
              className="radial-progress mx-auto flex items-center justify-center text-[#EA6D5C]"
              style={saleStyle}
            >
              {(((data?.currMonthSales ?? 0) / (data?.user?.saleGoal ?? 1)) *
                100 >
              100
                ? 100
                : ((data?.currMonthSales ?? 0) / (data?.user?.saleGoal ?? 1)) *
                  100
              ).toFixed(0)}
              %
            </div>
          </div>
          <div className="space-y-12">
            <p className="text-center text-sm font-semibold text-white">
              Bokade möten
            </p>
            <div
              className="radial-progress mx-auto flex items-center justify-center text-[#EA6D5C]"
              style={bookingStyle}
            >
              {(((data?.currMonthBookings ?? 0) /
                (data?.user?.bookingGoal ?? 1)) *
                100 >
              100
                ? 100
                : ((data?.currMonthBookings ?? 0) /
                    (data?.user?.bookingGoal ?? 1)) *
                  100
              ).toFixed(0)}
              %
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Level: FC = () => {
  const user = useUser();
  const { data } = useMe(user?.id);
  return (
    <div className="grid h-full grid-cols-1 gap-4">
      <section>
        <div className="overflow-hidden rounded-lg bg-gray-900 shadow xl:h-full">
          <div className="space-y-12 p-6">
            <div className="space-y-4">
              <p className="text-lg font-semibold text-white">
                Genomförda möten ({data?.user?.meetingCount ?? 0}/
                {8 * (data?.user?.level ?? 0)})
              </p>
              <div className="overflow-hidden rounded-full bg-gray-200">
                <div
                  style={{
                    width:
                      ((data?.user?.meetingCount ?? 0) /
                        (8 * (data?.user?.level ?? 0))) *
                      100
                        ? ((data?.user?.meetingCount ?? 0) /
                            (8 * (data?.user?.level ?? 0))) *
                            100 +
                          "%"
                        : "0%",
                  }}
                  className="h-2 rounded-full bg-[#EA6D5C]"
                />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-lg font-semibold text-white">
                Skickade offerter ({data?.user?.offerCount ?? 0}/
                {6 * (data?.user?.level ?? 0)})
              </p>
              <div className="overflow-hidden rounded-full bg-gray-200">
                <div
                  style={{
                    width:
                      ((data?.user?.offerCount ?? 0) /
                        (6 * (data?.user?.level ?? 0))) *
                      100
                        ? ((data?.user?.offerCount ?? 0) /
                            (6 * (data?.user?.level ?? 0))) *
                            100 +
                          "%"
                        : "0%",
                  }}
                  className="h-2 rounded-full bg-[#EA6D5C]"
                />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-lg font-semibold text-white">
                Försäljningar ({data?.user?.saleCount ?? 0}/
                {14000 * (data?.user?.level ?? 0)})
              </p>
              <div className="overflow-hidden rounded-full bg-gray-200">
                <div
                  style={{
                    width:
                      ((data?.user?.saleCount ?? 0) /
                        (14000 * (data?.user?.level ?? 0))) *
                      100
                        ? ((data?.user?.saleCount ?? 0) /
                            (14000 * (data?.user?.level ?? 0))) *
                            100 +
                          "%"
                        : "0%",
                  }}
                  className="h-2 rounded-full bg-[#EA6D5C]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProfilePage: NextPage = () => {
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [show, setShow] = useState(false);
  const supabaseClient = useSupabaseClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-white">
                      {months[new Date().getMonth()]} {new Date().getFullYear()}
                    </h3>
                    <Stats global={false} />
                  </div>
                  <Header />
                  <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-3">
                    <Chart />
                    <Status />
                    <Goals />
                    <Level />
                  </div>
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

export default ProfilePage;
