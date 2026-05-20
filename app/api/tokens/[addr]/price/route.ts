import { NextRequest, NextResponse } from "next/server";
import { getTokenPrice } from "@/lib/geckoterminal";

const CACHE_TTL = 30 * 1000; // 30 seconds

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ addr: string }> }
) {
  try {
    const { addr } = await params;

    if (!addr || addr.length < 10) {
      return NextResponse.json(
        { error: "Invalid token address" },
        { status: 400 }
      );
    }

    const price = await getTokenPrice(addr);

    if (!price) {
      return NextResponse.json(
        { error: "Price data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(price);
  } catch (error) {
    console.error("Token price API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch token price" },
      { status: 500 }
    );
  }
}
