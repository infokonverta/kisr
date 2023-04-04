import { Booking } from '@prisma/client'
import { Error } from '@src/types'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../utils/prisma'

type Data = {
  prevMonth: number,
  currMonth: number,
  bookings: Booking[]
} | Booking

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
      const [prevMonth, currMonth, bookings] = await prisma.$transaction([
        prisma.booking.aggregate({
          _count: true,
          where: {
            createdAt: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1)
            }
          }
        }),
        prisma.booking.aggregate({
          _count: true,
          where: {
            createdAt: {
              gte: new Date(year, month, 1),
              lt: new Date(year, month + 1, 1)
            }
          }
        }),
        prisma.booking.findMany({
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
        prevMonth: prevMonth._count,
        currMonth: currMonth._count,
        bookings
      })
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to get bookings",
        description: err.message
      })
    }
  }
  else if(req.method === "PUT"){
    try{
      const { id, name, date } = req.body
      const booking = await prisma.booking.update({
        where: {
          id
        },
        data: {
          name,
          date: date.split("T")[0],
          time: date.split("T")[1]
        }
      })
      res.status(200).json(booking)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to update booking",
        description: err.message
      })
    }
  }
  else if(req.method === "POST"){
    try{
      const { name, date, ...data } = req.body
      const [booking] = await prisma.$transaction([
        prisma.booking.create({
          data: {
            name,
            date: date.split("T")[0],
            time: date.split("T")[1],
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
      res.status(200).json(booking)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to post booking",
        description: err.message
      })
    }
  }
  else if(req.method === "DELETE"){
    try{
      const { id, ...data } = req.body
      const [booking] = await prisma.$transaction([
        prisma.booking.delete({
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
      res.status(200).json(booking)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to delete booking",
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