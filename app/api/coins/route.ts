import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start") || "1";
  const limit = searchParams.get("limit") || "10";

  try {
    const url = `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?start=${start}&limit=${limit}&sortBy=rank&sortType=desc&convert=USD,BTC,ETH&cryptoType=all&tagType=all&audited=false&aux=ath,atl,high24h,low24h,num_market_pairs,cmc_rank,date_added,max_supply,circulating_supply,total_supply,volume_7d,volume_30d,self_reported_circulating_supply,self_reported_market_cap`;

    const response = await axios.get(url);

    return NextResponse.json({
        cryptoCurrencyList: response.data.data.cryptoCurrencyList,
        totalCount: response.data.data.totalCount
    });
  } catch (error: any) {
    console.error("Error fetching coins:", error.message);
    return NextResponse.json({ error: "Failed to fetch coins" }, { status: 500 });
  }
}
