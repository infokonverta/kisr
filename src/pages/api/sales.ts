import { Sale } from '@prisma/client';
import { Error, SaleWithPayload } from '@src/types';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../utils/prisma';

type Data = {
  prevMonth: number | null,
  currMonth: number | null,
  highest: SaleWithPayload
  sales: SaleWithPayload[]
} | Sale

const date = new Date()
const month = date.getMonth()
const year = date.getFullYear()

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Data | Error>
) => {
  const supabase = createServerSupabaseClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session)
    return res.status(401).json({
      error: 'not_authenticated',
      description: 'The user does not have an active session or is not authenticated',
    })

  if(req.method === "GET"){
    try{
      const [prevMonth, currMonth, highest, sales] = await prisma.$transaction([
        prisma.sale.aggregate({
          _sum: {
            revenue: true
          },
          where: {
            createdAt: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1)
            }
          }
        }),
        prisma.sale.aggregate({
          _sum: {
            revenue: true
          },
          where: {
            createdAt: {
              gte: new Date(year, month, 1),
              lt: new Date(year, month + 1, 1)
            }
          }
        }),
        prisma.sale.findMany({
          where:{
            createdAt: {
              gte: new Date(year, month, 1),
              lt: new Date(year, month + 1, 1)
            }
          },
          include: {
            profile: true
          },
          orderBy: {
            revenue: "desc"
          },
          take: 1
        }),
        prisma.sale.findMany({
          include: {
            profile: true,
            services: {
              include: {
                service: true
              }
            }
          },
          where: {
            createdAt: {
              gte: new Date(year, month, 1),
              lt: new Date(year, month + 1, 1)
            }
          },
          orderBy: {
            date: "desc"
          }
        })
      ])
      res.status(200).json({
        prevMonth: prevMonth._sum.revenue,
        currMonth: currMonth._sum.revenue,
        highest: highest[0],
        sales: sales.map((sale: SaleWithPayload) => {
          return{
            ...sale,
            provision: sale.services?.reduce((acc, item) => acc + (sale.revenue * (Number(item.service.provision) / 100)), 0).toFixed(2)
          }
        })
      })
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to get sales",
        description: err.message
      })
    }
  }
  else if(req.method === "PUT"){
    try{
      const { id, date, points, amount, revenue, profileId, saleCount, ...data } = req.body
      const [sale] = await prisma.$transaction([
        prisma.sale.update({
          data: {
            ...data,
            date: date.split("T")[0],
            time: date.split("T")[1],
            amount: Number(amount),
            revenue: Number(revenue)
          },
          where: {
            id
          }
        }),
        prisma.profile.update({
          data: {
            points,
            saleCount
          },
          where: {
            id: profileId
          }
        })
      ])
      res.status(200).json(sale)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to update sale",
        description: err.message
      })
    }
  }
  else if(req.method === "POST"){
    try{
      const { date, points, amount, revenue, services, saleCount, ...data } = req.body
      const [sale, profile] = await prisma.$transaction([
        prisma.sale.create({
          data: {
            ...data,
            date: date.split("T")[0],
            time: date.split("T")[1],
            amount: Number(amount),
            revenue: Number(revenue),
            profile: {
              connect: {
                id: session.user.id
              }
            },
            services: {
              create: services
            }
          }
        }),
        prisma.profile.update({
          data: {
            points,
            saleCount
          },
          where: {
            id: session.user.id
          }
        })
      ])
      await fetch(String(process.env.SLACK_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: profile.name + " har genomfört en försäljning på " + sale.revenue + " SEK 🎉"
        })
      })
      res.status(200).json(sale)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to post sale",
        description: err.message
      })
    }
  }
  else if(req.method === "DELETE"){
    try{
      const { id, ...data } = req.body
      const [sale] = await prisma.$transaction([
        prisma.sale.delete({
          where: {
            id
          }
        }),
        prisma.profile.update({
          data,
          where: {
            id: session.user.id
          }
        })
      ])
      res.status(200).json(sale)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to delete sale",
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