import type { Sale } from "@prisma/client"
import { Error } from "@src/types"
import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "../../../utils/prisma"

const lt = new Date()
const gte = new Date()
gte.setDate(gte.getDate() - 1)

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<string | Error>) => {
  if(req.method === "GET"){
    try{
      const [meetings, offers, sales, profiles] = await prisma.$transaction([
        prisma.meeting.aggregate({
          _count: true,
          where: {
            createdAt: {
              lt,
              gte
            }
          }
        }),
        prisma.offer.aggregate({
          _count: true,
          where: {
            createdAt: {
              lt,
              gte
            }
          }
        }),
        prisma.sale.findMany({
          where: {
            createdAt: {
              lt,
              gte
            }
          }
        }),
        prisma.profile.findMany({
          where: {
            points: {
              gt: 0
            }
          },
          orderBy: {
            points: "desc"
          },
          take: 3
        })
      ])
      await fetch(String(process.env.SLACK_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: `
          God morgon kära kollegor!

Igår utfärdades ${sales.length}st affärer med ett ordervärde på ${sales.reduce((acc: number, sale: Sale) => acc + sale.revenue, 0)} SEK. Det genomfördes ${meetings._count} möten och skickades ${offers._count}st offerter. Bra jobbat allihopa! 🎉🏆🥂

Kan vi slå dem siffrorna idag?
${profiles.length === 3 ? (`
Topplistan ser ut som följande:

🥇 ${profiles[0].name}
🥈 ${profiles[1].name}
🥉 ${profiles[2].name}
`) : ""}
Lycka till!
Hälsningar, KISR 🤖`
        })
      })
      res.status(200).send("success")
    }
    catch(err: any){
      res.status(500).json({
        error: "the server was not able to process the request",
        description: err.message
      })
    }
  }
  else{
    res.status(501).json({
      error: "method not found",
      description: "request method is not supported"
    })
  }
}

export default handler