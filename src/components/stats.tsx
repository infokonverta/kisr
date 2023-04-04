import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import { BanknotesIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { useMe, useMeetings, useOffers, useSales } from "@src/hooks";
import { useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { FC } from "react";

type Props = {
  global: boolean;
};

const Stats: FC<Props> = ({ global }) => {
  const user = useUser();
  const sales = useSales();
  const offers = useOffers();
  const router = useRouter();
  const meetings = useMeetings();
  const query = router.query as { id: string | undefined };
  const profile = useMe(query.id ?? user?.id);
  const stats = global
    ? [
        {
          id: 1,
          name: "Genomförda möten",
          stat: meetings?.data?.currMonth ?? 0,
          previousStat: meetings?.data?.prevMonth ?? 0,
          icon: CalendarIcon,
          change: isNaN(
            ((meetings?.data?.currMonth - meetings?.data?.prevMonth) /
              meetings?.data?.prevMonth) *
              100
          )
            ? 0
            : isFinite(
                ((meetings?.data?.currMonth - meetings?.data?.prevMonth) /
                  meetings?.data?.prevMonth) *
                  100
              )
            ? (
                ((meetings?.data?.currMonth - meetings?.data?.prevMonth) /
                  meetings?.data?.prevMonth) *
                100
              ).toFixed(2)
            : meetings?.data?.currMonth * 100,
          changeType:
            Math.sign(
              ((meetings?.data?.currMonth - meetings?.data?.prevMonth) /
                meetings?.data?.prevMonth) *
                100
            ) > 0
              ? "increase"
              : Math.sign(
                  ((meetings?.data?.currMonth - meetings?.data?.prevMonth) /
                    meetings?.data?.prevMonth) *
                    100
                ) < 0
              ? "decrease"
              : "",
        },
        {
          id: 2,
          name: "Försäljningar",
          stat: sales?.data?.currMonth ?? 0,
          previousStat: sales?.data?.prevMonth ?? 0,
          icon: BanknotesIcon,
          change: isNaN(
            ((sales?.data?.currMonth - sales?.data?.prevMonth) /
              sales?.data?.prevMonth) *
              100
          )
            ? 0
            : isFinite(
                ((sales?.data?.currMonth - sales?.data?.prevMonth) /
                  sales?.data?.prevMonth) *
                  100
              )
            ? (
                ((sales?.data?.currMonth - sales?.data?.prevMonth) /
                  sales?.data?.prevMonth) *
                100
              ).toFixed(2)
            : sales?.data?.currMonth * 100,
          changeType:
            Math.sign(
              ((sales?.data?.currMonth - sales?.data?.prevMonth) /
                sales?.data?.prevMonth) *
                100
            ) > 0
              ? "increase"
              : Math.sign(
                  ((sales?.data?.currMonth - sales?.data?.prevMonth) /
                    sales?.data?.prevMonth) *
                    100
                ) < 0
              ? "decrease"
              : "",
        },
        {
          id: 3,
          name: "Skickade offerter",
          stat: offers?.data?.currMonth ?? 0,
          previousStat: offers?.data?.prevMonth ?? 0,
          icon: CalendarIcon,
          change: isNaN(
            ((offers?.data?.currMonth - offers?.data?.prevMonth) /
              offers?.data?.prevMonth) *
              100
          )
            ? 0
            : isFinite(
                ((offers?.data?.currMonth - offers?.data?.prevMonth) /
                  offers?.data?.prevMonth) *
                  100
              )
            ? (
                ((offers?.data?.currMonth - offers?.data?.prevMonth) /
                  offers?.data?.prevMonth) *
                100
              ).toFixed(2)
            : offers?.data?.currMonth * 100,
          changeType:
            Math.sign(
              ((offers?.data?.currMonth - offers?.data?.prevMonth) /
                offers?.data?.prevMonth) *
                100
            ) > 0
              ? "increase"
              : Math.sign(
                  ((offers?.data?.currMonth - offers?.data?.prevMonth) /
                    offers?.data?.prevMonth) *
                    100
                ) < 0
              ? "decrease"
              : "",
        },
      ]
    : [
        {
          id: 1,
          href: "/meetings",
          name: "Genomförda möten",
          stat: profile?.data?.currMonthMeetings ?? 0,
          previousStat: profile?.data?.prevMonthMeetings ?? 0,
          icon: CalendarIcon,
          change: isNaN(
            ((profile?.data?.currMonthMeetings -
              profile?.data?.prevMonthMeetings) /
              profile?.data?.prevMonthMeetings) *
              100
          )
            ? 0
            : isFinite(
                ((profile?.data?.currMonthMeetings -
                  profile?.data?.prevMonthMeetings) /
                  profile?.data?.prevMonthMeetings) *
                  100
              )
            ? (
                ((profile?.data?.currMonthMeetings -
                  profile?.data?.prevMonthMeetings) /
                  profile?.data?.prevMonthMeetings) *
                100
              ).toFixed(2)
            : profile?.data?.currMonthMeetings * 100,
          changeType:
            Math.sign(
              ((profile?.data?.currMonthMeetings -
                profile?.data?.prevMonthMeetings) /
                profile?.data?.prevMonthMeetings) *
                100
            ) > 0
              ? "increase"
              : Math.sign(
                  ((profile?.data?.currMonthMeetings -
                    profile?.data?.prevMonthMeetings) /
                    profile?.data?.prevMonthMeetings) *
                    100
                ) < 0
              ? "decrease"
              : "",
        },
        {
          id: 2,
          href: "/sales",
          name: "Försäljningar",
          stat: profile?.data?.currMonthSales ?? 0,
          previousStat: profile?.data?.prevMonthSales ?? 0,
          icon: BanknotesIcon,
          change: isNaN(
            ((profile?.data?.currMonthSales - profile?.data?.prevMonthSales) /
              profile?.data?.prevMonthSales) *
              100
          )
            ? 0
            : isFinite(
                ((profile?.data?.currMonthSales -
                  profile?.data?.prevMonthSales) /
                  profile?.data?.prevMonthSales) *
                  100
              )
            ? (
                ((profile?.data?.currMonthSales -
                  profile?.data?.prevMonthSales) /
                  profile?.data?.prevMonthSales) *
                100
              ).toFixed(2)
            : profile?.data?.currMonthSales * 100,
          changeType:
            Math.sign(
              ((profile?.data?.currMonthSales - profile?.data?.prevMonthSales) /
                profile?.data?.prevMonthSales) *
                100
            ) > 0
              ? "increase"
              : Math.sign(
                  ((profile?.data?.currMonthSales -
                    profile?.data?.prevMonthSales) /
                    profile?.data?.prevMonthSales) *
                    100
                ) < 0
              ? "decrease"
              : "",
        },
        {
          id: 3,
          href: "/offers",
          name: "Skickade offerter",
          stat: profile?.data?.currMonthOffers ?? 0,
          previousStat: profile?.data?.prevMonthOffers ?? 0,
          icon: CalendarIcon,
          change: isNaN(
            ((profile?.data?.currMonthOffers - profile?.data?.prevMonthOffers) /
              profile?.data?.prevMonthOffers) *
              100
          )
            ? 0
            : isFinite(
                ((profile?.data?.currMonthOffers -
                  profile?.data?.prevMonthOffers) /
                  profile?.data?.prevMonthOffers) *
                  100
              )
            ? (
                ((profile?.data?.currMonthOffers -
                  profile?.data?.prevMonthOffers) /
                  profile?.data?.prevMonthOffers) *
                100
              ).toFixed(2)
            : profile?.data?.currMonthOffers * 100,
          changeType:
            Math.sign(
              ((profile?.data?.currMonthOffers -
                profile?.data?.prevMonthOffers) /
                profile?.data?.prevMonthOffers) *
                100
            ) > 0
              ? "increase"
              : Math.sign(
                  ((profile?.data?.currMonthOffers -
                    profile?.data?.prevMonthOffers) /
                    profile?.data?.prevMonthOffers) *
                    100
                ) < 0
              ? "decrease"
              : "",
        },
      ];
  return (
    <dl className="mt-5 grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((item) => (
        <div
          key={item.id}
          className="relative overflow-hidden rounded-lg bg-gray-900 p-4 shadow sm:px-6 sm:py-6"
        >
          <dt>
            <div className="absolute rounded-md bg-[#EA6D5C] p-3">
              <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">
              {item.name}
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline justify-between">
            <p className="text-2xl font-semibold text-white">
              {item.stat}
              <span className="block text-sm font-medium text-gray-500">
                från {item.previousStat}
              </span>
            </p>
            <p className="ml-2 flex items-baseline text-sm font-semibold text-[#EA6D5C]">
              {item.changeType === "increase" && (
                <ArrowUpIcon
                  className="h-5 w-5 flex-shrink-0 self-center text-[#EA6D5C]"
                  aria-hidden="true"
                />
              )}
              {item.changeType === "decrease" && (
                <ArrowDownIcon
                  className="h-5 w-5 flex-shrink-0 self-center text-[#EA6D5C]"
                  aria-hidden="true"
                />
              )}
              {item.change > 100 ? "100.00" : item.change}%
            </p>
          </dd>
        </div>
      ))}
    </dl>
  );
};

export default Stats;
