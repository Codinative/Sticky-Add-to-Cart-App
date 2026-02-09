"use client";
import useSWR from "swr";
import { useSession } from "../context/session";

async function fetcher([url, encodedContext]: [string, string]) {
  const res = await fetch(`${url}?context=${encodedContext}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}, ${await res.text()}`);
  }
  const json = await res.json();
  
  return json;
}


export function useProducts() {
  const encodedContext = useSession()?.context;

  const { data, error } = useSWR(
    encodedContext ? ["/api/products", encodedContext] : null,
    fetcher
  );

  return {
    summary: data?.data,
    isError: error,
  };
}
