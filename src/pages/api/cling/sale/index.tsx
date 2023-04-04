import { Sale, Service } from "@prisma/client";
import { Error } from "@src/types";
import { prisma } from "@src/utils/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Sale | Error | string>
) => {
  const user = await prisma.profile.findUnique({
    where: {
      email: req.body.data.companyUser.email,
    },
  });

  if (!user)
    return res.status(401).json({
      error: "not_authenticated",
      description:
        "The user does not have an active session or is not authenticated",
    });

  if (req.method === "POST") {
    try {
      if (
        req.body.data.articles.reduce(
          (acc: number, curr: { totalAmount: number }) =>
            acc + curr.totalAmount,
          0
        ) / 100
      ) {
        const service = (await prisma.service.findMany({})).find(
          (service: Service) => service.name === req.body.data.template.name
        );
        const [sale, profile] = await prisma.$transaction([
          prisma.sale.create({
            data: {
              name: req.body.data.clients
                .map((customer: { name: string }) => customer.name)
                .toString()
                .replace(",", ", "),
              date: req.body.data.createdAt.split("T")[0],
              time: req.body.data.createdAt.split("T")[1].substring(0, 5),
              amount: 1,
              revenue:
                req.body.data.articles.reduce(
                  (acc: number, curr: { totalAmount: number }) =>
                    acc + curr.totalAmount,
                  0
                ) / 100,
              invoice: "1 månad",
              customer: null,
              profile: {
                connect: {
                  id: user.id,
                },
              },
              services: {
                create: {
                  service: {
                    connect: {
                      id: service?.id,
                    },
                  },
                  subscription: "",
                },
              },
            },
          }),
          prisma.profile.update({
            data: {
              points:
                user.points +
                req.body.data.articles.reduce(
                  (acc: number, curr: { totalAmount: number }) =>
                    acc + curr.totalAmount,
                  0
                ) /
                  100,
              saleCount:
                user.points +
                req.body.data.articles.reduce(
                  (acc: number, curr: { totalAmount: number }) =>
                    acc + curr.totalAmount,
                  0
                ) /
                  100,
            },
            where: {
              id: user.id,
            },
          }),
        ]);
        await fetch(String(process.env.SLACK_URL), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text:
              profile.name +
              " har genomfört en försäljning på " +
              sale.revenue +
              " SEK 🎉",
          }),
        });
        return res.status(200).json(sale);
      }
      return res.status(200).send("success");
    } catch (err: any) {
      res.status(500).json({
        error: "the server was not able to process the request",
        description: err.message,
      });
    }
  } else {
    res.status(501).json({
      error: "method not found",
      description: "request method is not supported",
    });
  }
};

export default handler;
