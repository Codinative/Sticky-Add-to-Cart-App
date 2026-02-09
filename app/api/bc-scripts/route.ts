import { NextResponse } from "next/server";

export async function POST (req: Request) {
  const body = await req.json();

  const res = await fetch(
    `https://api.bigcommerce.com/stores/${process.env.BC_STORE_HASH}/v3/content/scripts`,
    {
      method: "POST",
      headers: {
        "X-Auth-Token": process.env.BC_API_TOKEN!, // never expose this in frontend
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
