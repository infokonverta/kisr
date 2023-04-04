import { Profile } from '@prisma/client'
import { Error } from '@src/types'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../utils/prisma'

type Data = {
  prevMonthMeetings: number,
  currMonthMeetings: number,
  prevMonthOffers: number | null,
  currMonthOffers: number | null,
  prevMonthSales: number | null,
  currMonthSales: number | null,
  prevMonthBookings: number,
  currMonthBookings: number,
  user: Profile | null
} | Profile

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
  const { id } = req.query

  if (!session || !id)
    return res.status(401).json({
      error: 'not_authenticated',
      description: 'The user does not have an active session or is not authenticated',
    })
  if(req.method === "GET"){
    try{
      const [prevMonthMeetings, currMonthMeetings, prevMonthOffers, currMonthOffers, prevMonthSales, currMonthSales, prevMonthBookings, currMonthBookings, user] = await prisma.$transaction([
        prisma.meeting.aggregate({
          _count: true,
          where: {
            profileId: String(id),
            createdAt: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1)
            }
          }
        }),
        prisma.meeting.aggregate({
          _count: true,
          where: {
            profileId: String(id),
            createdAt: {
              gte: new Date(year, month, 1),
              lt: new Date(year, month + 1, 1)
            }
          }
        }),
        prisma.offer.aggregate({
          _sum: {
            amount: true
          },
          where: {
            profileId: String(id),
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
            profileId: String(id),
            createdAt: {
              gte: new Date(year, month, 1),
              lt: new Date(year, month + 1, 1)
            }
          }
        }),
        prisma.sale.aggregate({
          _sum: {
            revenue: true
          },
          where: {
            profileId: String(id),
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
            profileId: String(id),
            createdAt: {
              gte: new Date(year, month, 1),
              lt: new Date(year, month + 1, 1)
            }
          }
        }),
        prisma.booking.aggregate({
          _count: true,
          where: {
            profileId: String(id),
            createdAt: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1)
            }
          }
        }),
        prisma.booking.aggregate({
          _count: true,
          where: {
            profileId: String(id),
            createdAt: {
              gte: new Date(year, month, 1),
              lt: new Date(year, month + 1, 1)
            }
          }
        }),
        prisma.profile.findUnique({
          where: {
            id: String(id)
          }
        })
      ])
      res.status(200).json({
        prevMonthMeetings: prevMonthMeetings._count,
        currMonthMeetings: currMonthMeetings._count,
        prevMonthOffers: prevMonthOffers._sum.amount,
        currMonthOffers: currMonthOffers._sum.amount,
        prevMonthSales: prevMonthSales._sum.revenue,
        currMonthSales: currMonthSales._sum.revenue,
        prevMonthBookings: prevMonthBookings._count,
        currMonthBookings: currMonthBookings._count,
        user
      })
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to get profile",
        description: err.message
      })
    }
  }
  else if(req.method === "PUT"){
    try{
      const user = await prisma.profile.update({
        data: req.body,
        where: {
          id: String(id)
        }
      })
      res.status(200).json(user)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to level up",
        description: err.message
      })
    }
  }
  else if(req.method === "PATCH"){
    try{
      const user = await prisma.profile.update({
        data: req.body,
        where: {
          id: String(id)
        }
      })
      await fetch(String(process.env.SLACK_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: user.name + " har precis gått upp till level " + user.level + " 🎉"
        })
      })
      res.status(200).json(user)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to level up",
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