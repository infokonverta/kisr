import { Prisma } from "@prisma/client";

export type Error = {
  error: string
  description: string
}

export type Sale = { provision: string } & Prisma.SaleGetPayload<{
  include: {
    profile: true;
  };
}>;

export type SaleWithPayload = Prisma.SaleGetPayload<{
  include: {
    profile: true;
    services?: {
      include: {
        service: true
      }
    },
  },
}>;

export type Offer = Prisma.OfferGetPayload<{
  include: {
    profile: true;
  };
}>;

export type Meeting = Prisma.MeetingGetPayload<{
  include: {
    profile: true;
  };
}>;

export type Booking = Prisma.BookingGetPayload<{
  include: {
    profile: true;
  };
}>;

export type Service = Prisma.ServiceGetPayload<{
  include: {
    sales: {
      include: {
        sale: true;
      };
    };
  };
}>;