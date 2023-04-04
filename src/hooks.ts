import { useQuery } from "@tanstack/react-query";

const fetcher = async (endpoint: string, id?: string) => {
  const services = await fetch(id ? endpoint + id : endpoint)
  const response = await services.json();
  return response;
};

export const useBookings = () => {
  return useQuery(["bookings"], () => fetcher("/api/bookings"));
};

export const useMe = (id: string | undefined) => {
  return useQuery(["me", id], () => fetcher("/api/me/", id as string), {
    enabled: !!id
  });
};

export const useMeetings = () => {
  return useQuery(["meetings"], () => fetcher("/api/meetings"));
};

export const useOffers = () => {
  return useQuery(["offers"], () => fetcher("/api/offers"));
};

export const useProfile = (id: string | undefined) => {
  return useQuery(["profile", id], () => fetcher("/api/me/", id as string), {
    enabled: !!id
  });
};

export const useProfiles = () => {
  return useQuery(["profiles"], () => fetcher("/api/profiles"));
};

export const useSales = () => {
  return useQuery(["sales"], () => fetcher("/api/sales"));
};

export const useServices = () => {
  return useQuery(["services"], () => fetcher("/api/services"));
};