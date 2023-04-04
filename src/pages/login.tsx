import Notification from "@src/components/notification";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import Router from "next/router";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

type Inputs = {
  email: string;
  password: string;
};

const Login: NextPage = () => {
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [show, setShow] = useState(false);
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
  const { register, handleSubmit } = useForm<Inputs>();
  const supabaseClient = useSupabaseClient();
  const onSubmit: SubmitHandler<Inputs> = async ({ email, password }) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) {
      Router.push("/");
      toast.success("Välkommen tillbaka");
    }
  };
  return (
    <>
      <Notification body={body} title={title} show={show} setShow={setShow} />
      <div className="flex h-screen bg-white">
        <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="relative h-52">
              <Image
                src="/logo.png"
                alt="KISR logo"
                fill
                sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
              />
            </div>
            <div className="mt-6">
              <div>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      E-postadress
                    </label>
                    <div className="mt-1">
                      <input
                        {...register("email")}
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#EA6D5C] focus:outline-none focus:ring-[#EA6D5C] sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Lösenord
                    </label>
                    <div className="mt-1">
                      <input
                        {...register("password")}
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#EA6D5C] focus:outline-none focus:ring-[#EA6D5C] sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="flex w-full justify-center rounded-md border border-transparent bg-[#EA6D5C] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#e85643] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    >
                      Logga in
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black">
            <img src="login.png" alt="KISR" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx);
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  return {
    props: {},
  };
};
