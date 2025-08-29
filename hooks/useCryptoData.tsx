'use client'
import { useEffect, useState } from "react";
import Dexie, { Table } from "dexie";
import axios from "axios";



export interface Coin {
    id: number;          // ✅ primary key from API
    name: string;
    symbol: string;
    cmcRank: number;
    priceUsd?: number;
    priceBtc?: number;
    priceEth?: number;
    change1h?: number;
    change24h?: number;
    change7d?: number;
}

class MyDB extends Dexie {
    coins!: Table<Coin, number>;

    constructor() {
        super("MyDB");
        this.version(1).stores({
            coins: "id, cmcRank, symbol, name"
        });
    }
}

const db = new MyDB();


async function fetchCoins(start = 1, limit = 10) {
    const res = await axios.get(`/api/coins?start=${start}&limit=${limit}`);
    return res.data;
}

function mapCoin(c: any): Coin {
  const usd = c.quotes.find((q: any) => q.name === "USD");
  const btc = c.quotes.find((q: any) => q.name === "BTC");
  const eth = c.quotes.find((q: any) => q.name === "ETH");

  return {
    id: c.id,
    name: c.name,
    symbol: c.symbol,
    cmcRank: c.cmcRank,
    priceUsd: usd?.price,
    priceBtc: btc?.price,
    priceEth: eth?.price,
    change1h: usd?.percentChange1h,
    change24h: usd?.percentChange24h,
    change7d: usd?.percentChange7d,
  };
}

export function useCryptoData(start = 1, limit = 10) {
    const [coins, setCoins] = useState<Coin[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        async function loadFromDB() {
            // ✅ Always read from Dexie first (fast + ordered)
            const stored = await db.coins
                .orderBy("cmcRank")
                .offset(start - 1)
                .limit(limit)
                .toArray();

            setCoins(stored);
            setLoading(false);
        }

        async function fetchAndUpdate() {
            try {
                const response = await fetchCoins(start, limit);
                const mapped = response.cryptoCurrencyList.map(mapCoin);

                if (response) {
                    // ✅ store/refresh data in Dexie
                    await db.coins.bulkPut(mapped);

                    // ✅ refresh from Dexie again (not directly from API)
                    const stored = await db.coins
                        .orderBy("cmcRank")
                        .offset(start - 1)
                        .limit(limit)
                        .toArray();

                    setCoins(stored);
                    setTotal(response.totalCount);
                }
            } catch (err) {
                console.error("API error:", err);
            }
        }

        // 1️⃣ Load cached data first
        loadFromDB();

        // 2️⃣ Fetch fresh data + update cache
        fetchAndUpdate();

        // 3️⃣ Refresh every 30s
        intervalId = setInterval(fetchAndUpdate, 30000);

        return () => clearInterval(intervalId);
    }, [start, limit]);


    return { coins, total, loading };
}
