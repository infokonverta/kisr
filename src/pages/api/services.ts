import { Service } from '@prisma/client';
import { Error, Service as ServiceWithPayload } from '@src/types';
import { prisma } from '@src/utils/prisma';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  services: ServiceWithPayload[]
} | Service

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
      const services = await prisma.service.findMany({
        include: {
          sales: {
            include: {
              sale: true
            }
          }
        },
      })
      services.sort((a: ServiceWithPayload, b: ServiceWithPayload) => b.sales.length - a.sales.length)
      res.status(200).json({
        services
      })
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to get services",
        description: err.message
      })
    }
  }
  else if(req.method === "PUT"){
    try{
      const { id, ...data } = req.body
      const service = await prisma.service.update({
        where: {
          id
        },
        data
      })
      res.status(200).json(service)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to update service",
        description: err.message
      })
    }
  }
  else if(req.method === "POST"){
    try{
      const service = await prisma.service.create({
        data: req.body
      })
      res.status(200).json(service)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to post service",
        description: err.message
      })
    }
  }
  else if(req.method === "DELETE"){
    try{
      const { id } = req.body
      const service = await prisma.service.delete({
        where: {
          id
        }
      })
      res.status(200).json(service)
    }
    catch(err: any){
      res.status(500).json({
        error: "failed to delete service",
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