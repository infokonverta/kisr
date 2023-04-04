import { Profile } from '@prisma/client'
import { Error } from '@src/types'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../utils/prisma'

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Profile | Error>
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

  if(req.method === "POST"){
    const { name, email, password } = req.body
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if(error) {
      return res.status(500).json({
        error: "could not create user",
        description: error.message
      })
    }
    const profile = await prisma.profile.create({
      data: {
        id: data.user.id,
        email,
        name,
        role: "USER"
      }
    })
    res.status(200).json(profile)
  }
  else if(req.method === "DELETE"){
    const { id } = req.body
    const { error } = await supabase.auth.admin.deleteUser(id)
    if(error) {
      return res.status(500).json({
        error: "could not delete user",
        description: error.message
      })
    }
    const profile = await prisma.profile.update({
      where: {
        id
      },
      data: {
        active: false
      }
    })
    res.status(200).json(profile)
  }
  else{
    res.status(501).json({
      error: "method not found",
      description: "request method is not supported"
    })
  }
}

export default handler