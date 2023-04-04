import { Meeting } from '@prisma/client'
import { Error } from '@src/types'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../utils/prisma'

type Data = {
  prevMonth: number,
  currMonth: number,
  meetings: Meeting[]
} | Meeting

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
      const [prevMonth, currMonth, meetings] = await prisma.$transaction([
        prisma.meeting.aggregate({
          _count: true,
          where: {
            createdAt: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1)
            }
          }
        }),
        prisma.meeting.aggregate({
          _count: true,
          where: {
            createdAt: {
              gte: new Date(year, month, 1),
              lt: new Date(year, month + 1, 1)
            }
          }
        }),
        prisma.meeting.findMany({
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
        meetings
      })
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to get meetings",
        description: err.message
      })
    }
  }
  else if(req.method === "PUT"){
    try{
      const { id, name, date } = req.body
      const meeting = await prisma.meeting.update({
        where: {
          id
        },
        data: {
          name,
          date: date.split("T")[0],
          time: date.split("T")[1]
        }
      })
      res.status(200).json(meeting)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to update meeting",
        description: err.message
      })
    }
  }
  else if(req.method === "POST"){
    try{
      const { name, date, ...data } = req.body
      const [meeting] = await prisma.$transaction([
        prisma.meeting.create({
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
      res.status(200).json(meeting)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to post meeting",
        description: err.message
      })
    }
  }
  else if(req.method === "DELETE"){
    try{
      const { id, ...data } = req.body
      const [meeting] = await prisma.$transaction([
        prisma.meeting.delete({
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
      res.status(200).json(meeting)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to delete meeting",
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