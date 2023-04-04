import { Offer } from "@prisma/client";
import { Error } from "@src/types";
import { prisma } from "@src/utils/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Offer | Error>
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
      const [offer] = await prisma.$transaction([
        prisma.offer.create({
          data: {
            name: req.body.data.clients
              .map((customer: { name: string }) => customer.name)
              .toString()
              .replace(",", ", "),
            amount: 1,
            date: req.body.data.createdAt.split("T")[0],
            time: req.body.data.createdAt.split("T")[1].substring(0, 5),
            profile: {
              connect: {
                id: user.id,
              },
            },
          },
        }),
        prisma.profile.update({
          data: {
            points: user.points + 3000,
            offerCount: user.offerCount + 1,
          },
          where: {
            id: user.id,
          },
        }),
      ]);
      res.status(200).json(offer);
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
