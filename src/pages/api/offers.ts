import { Offer } from '@prisma/client'
import { Error } from '@src/types'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../utils/prisma'

type Data = {
  prevMonth: number | null,
  currMonth: number | null,
  offers: Offer[]
} | Offer

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
      const [prevMonth, currMonth, offers] = await prisma.$transaction([
        prisma.offer.aggregate({
          _sum: {
            amount: true
          },
          where: {
            createdAt: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1)
            }
          }
        }),
        prisma.offer.aggregate({
          _sum: {
            amount: true
          },
          where: {
            createdAt: {
              gte: new Date(year, month, 1),
              lt: new Date(year, month + 1, 1)
            }
          }
        }),
        prisma.offer.findMany({
          include: {
            profile: true
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
        prevMonth: prevMonth._sum.amount,
        currMonth: currMonth._sum.amount,
        offers
      })
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to get offers",
        description: err.message
      })
    }
  }
  else if(req.method === "PUT"){
    try{
      const { id, name, date, amount, profileId, ...data } = req.body
      const [offer] = await prisma.$transaction([
        prisma.offer.update({
          where: {
            id
          },
          data: {
            name,
            date: date.split("T")[0],
            time: date.split("T")[1],
            amount: Number(amount)
          }
        }),
        prisma.profile.update({
          where: {
            id: profileId
          },
          data
        })
      ])
      res.status(200).json(offer)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to update offer",
        description: err.message
      })
    }
  }
  else if(req.method === "POST"){
    try{
      const { name, date, amount, ...data } = req.body
      const [offer] = await prisma.$transaction([
        prisma.offer.create({
          data: {
            name,
            date: date.split("T")[0],
            time: date.split("T")[1],
            amount: Number(amount),
            profileId: session.user.id
          }
        }),
        prisma.profile.update({
          where: {
            id: session.user.id
          },
          data
        })
      ])
      res.status(200).json(offer)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to post offer",
        description: err.message
      })
    }
  }
  else if(req.method === "DELETE"){
    try{
      const { id, ...data } = req.body
      const [offer] = await prisma.$transaction([
        prisma.offer.delete({
          where: {
            id
          }
        }),
        prisma.profile.update({
          where: {
            id: session.user.id
          },
          data
        })
      ])
      res.status(200).json(offer)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to delete offer",
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