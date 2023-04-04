import { Profile } from '@prisma/client'
import { Error } from '@src/types'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../utils/prisma'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Profile[] | Error>
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
      const profiles = await prisma.profile.findMany({
        where: {
          active: true
        },
        orderBy: {
          points: "desc"
        }
      })
      res.status(200).json(profiles)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to get profiles",
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