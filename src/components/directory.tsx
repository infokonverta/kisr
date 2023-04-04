import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Profile } from "@prisma/client";
import { useMe, useProfiles } from "@src/hooks";
import { useUser } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { FC, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

type Inputs = {
  name: string;
  email: string;
  password: string;
};

const Badge: FC<{
  src: string;
  alt: string;
}> = ({ src, alt }) => {
  return (
    <div className="relative ml-auto h-6 w-6">
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

const fetcher = async (payload: Inputs) => {
  const user = await fetch("/api/admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const response = await user.json();
  return response;
};

const Directory: FC = () => {
  const user = useUser();
  const profiles = useProfiles();
  const profile = useMe(user?.id);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<Inputs>();
  const createUser = useMutation((payload: Inputs) => fetcher(payload), {
    onSuccess: () => {
      reset();
      toast.success("Användaren har skapats");
      queryClient.invalidateQueries(["profiles"]);
    },
    onError: (error: any) => {
      console.log(error);
      toast.error("Det gick inte att skapa användaren");
    },
  });
  const onSubmit: SubmitHandler<Inputs> = (inputs) => createUser.mutate(inputs);
  return (
    <aside className="hidden lg:order-first lg:block lg:flex-shrink-0">
      <div className="relative flex h-full w-96 flex-col overflow-y-auto border-r border-gray-200 bg-white">
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-lg font-medium text-gray-900">Katalog</h2>
          <p className="mt-1 text-sm text-gray-600">
            Här hittar du en lista med alla medlemmar och deras rank
          </p>
          <div className="mt-6 flex space-x-4">
            <div className="min-w-0 flex-1">
              <label htmlFor="search" className="sr-only">
                Sök
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="search"
                  name="search"
                  id="search"
                  className="block w-full rounded-md border-gray-300 pl-10 focus:border-[#EA6D5C] focus:ring-[#EA6D5C] sm:text-sm"
                  placeholder="Sök"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            {profile.data?.user?.role === "ADMIN" && (
              <button
                type="submit"
                onClick={() => setOpen(!open)}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#EA6D5C] focus:ring-offset-2"
              >
                {open ? (
                  <XMarkIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                ) : (
                  <PlusIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                )}
                <span className="sr-only">Sök</span>
              </button>
            )}
          </div>
        </div>
        {/* Directory list */}
        <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="Directory">
          <div className="relative">
            {open ? (
              <form
                className="flex flex-1 flex-col justify-between"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="divide-y divide-gray-200 px-4 sm:px-6">
                  <div className="space-y-6 pt-6 pb-5">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-900"
                      >
                        Namn
                      </label>
                      <div className="mt-1">
                        <input
                          {...register("name")}
                          type="text"
                          name="name"
                          id="name"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#EA6D5C] focus:ring-[#EA6D5C] sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-900"
                      >
                        E-postadress
                      </label>
                      <div className="mt-1">
                        <input
                          {...register("email")}
                          type="email"
                          name="email"
                          id="email"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#EA6D5C] focus:ring-[#EA6D5C] sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-900"
                      >
                        Lösenord
                      </label>
                      <div className="mt-1">
                        <input
                          {...register("password")}
                          type="password"
                          name="password"
                          id="password"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#EA6D5C] focus:ring-[#EA6D5C] sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-[#EA6D5C] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#e85643] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    >
                      Skapa
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <ul role="list" className="relative z-0 divide-y divide-gray-200">
                {profiles.data
                  ?.filter((profile: Profile) =>
                    profile.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((profile: Profile) => (
                    <li key={profile.id}>
                      <div className="relative flex items-center space-x-3 px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#EA6D5C] hover:bg-gray-50">
                        <div className="relative h-10 w-10 flex-shrink-0 ">
                          {profile.avatar ? (
                            <Image
                              className="rounded-full"
                              src={profile.avatar}
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
                        <div className="flex w-full items-center">
                          <Link
                            href={`/u/${profile.id}`}
                            className="focus:outline-none"
                          >
                            {/* Extend touch target to entire panel */}
                            <span
                              className="absolute inset-0"
                              aria-hidden="true"
                            />
                            <p className="text-sm font-medium text-gray-900">
                              {profile.name}
                            </p>
                            <p className="truncate text-sm text-gray-500">
                              Level {profile.level}
                            </p>
                          </Link>
                          <Rank level={profile.level} />
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Directory;
