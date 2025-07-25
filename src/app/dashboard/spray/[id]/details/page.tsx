"use client";
import {
  Dashboard,
  DashboardHeader,
  DashboardHeaderText,
} from "@/components/ui/containers";
import { FaTrophy } from "react-icons/fa";
import { Reveal3 } from "@/app/components/animations/Text";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { TableContainer } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ManageWallet } from "@/components/dashboard/events/spray/Wallet";

export default function SprayOverview({ params }: any) {
  const { id } = params;
  const stats = [
    { label: "Your Rank", value: "--" },
    { label: "Total Sprayed", value: 0 },
    { label: "Sprays Made", value: 0 },
  ];

  return (
    <Dashboard className="mx-auto mt-16 bg-white items-start">
      <DashboardHeader>
        <DashboardHeaderText>Fund wallet</DashboardHeaderText>
      </DashboardHeader>
      <div className="space-y-1 mb-5">
        <h3>Leaderboard</h3>
        <p>See who's spraying the most at this event</p>
      </div>
      <div className="grid grid-cols-1 border-t md:grid-cols-[376px,1fr] w-full gap-6">
        <ManageWallet id={id} />

        <div className="space-y-6 sm:border-l sm:p-4 lg:p-6">
          <div className="space-y-2">
            <h4>Your Spraying Statistics</h4>
            <p>Track your contributions and ranking</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 pt-5 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="border space-y-1 p-2 md:p-4 rounded-md"
                >
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <Reveal3 width="100%">
                    <h3 className="text-lg font-bold">{stat.value}</h3>
                  </Reveal3>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-md sm:border sm:p-4">
            <h4>Top Sprayers</h4>
            <p>Showing top sprayers for: Birthday Celebration</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
              {topSprayers.map((sprayer, i) => (
                <div
                  key={i}
                  className="border p-4 rounded-md flex flex-col items-center justify-center gap-1"
                >
                  <FaTrophy
                    className={cn(
                      "h-5 w-5",
                      sprayer?.badge === "Masked Legend"
                        ? "text-green-500"
                        : sprayer?.badge === "Odogwu"
                        ? "text-red-500"
                        : "text-amber-500"
                    )}
                  />
                  <p className="font-medium text-black">{sprayer.name}</p>
                  <p className="text-sm">
                    <b className="text-black">{sprayer.cowries}</b> cowries
                  </p>
                  <Reveal3 width="100%">
                    <Badge
                      variant={
                        sprayer?.badge === "Masked Legend"
                          ? "success"
                          : sprayer?.badge === "Odogwu"
                          ? "destructive"
                          : "yellow"
                      }
                    >
                      {sprayer.badge}
                    </Badge>
                  </Reveal3>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="space-y-4">
            <h4>Leaderboard</h4>

            <TableContainer
              searchClassName="mb-0 rounded-ee-none rounded-es-none"
              isSearch
              searchPlaceHolder="Search sprayers..."
              columns={LeaderboardCol}
              data={[]}
            />
          </div>
        </div>
      </div>
    </Dashboard>
  );
}

const LeaderboardCol: ColumnDef<any>[] = [
  {
    accessorKey: "rank",
    header: "Rank",
    cell: ({ row }) => <p>{row.getValue("rank")}</p>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <p>{row.getValue("name")}</p>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => <p>{row.getValue("amount")}</p>,
  },
  {
    accessorKey: "badge",
    header: "Badge",
    cell: ({ row }) => <p>{row.getValue("badge")}</p>,
  },
];

const topSprayers = [
  {
    name: "Chinedu Okonkwo",
    cowries: 250,
    badge: "Masked Legend",
  },
  { name: "Amina Ibrahim", cowries: 175, badge: "Lion Sprayer" },
  { name: "David Adeleke", cowries: 120, badge: "Odogwu" },
];
