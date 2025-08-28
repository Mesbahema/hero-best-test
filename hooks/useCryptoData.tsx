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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            let stored = await db.coins.toArray();
            if (stored.length > 0) {
                setCoins(stored.slice(start - 1, start - 1 + limit));
                setLoading(false);
            }

            try {
                const list = await fetchCoins(start, limit);
                 const mapped = list.map(mapCoin);
                if (list) {
                    await db.coins.bulkPut(mapped);
                    setCoins(mapped);
                }
            } catch (err) {
                console.error("API error:", err);
            }

            setLoading(false);
        }

        loadData();
    }, [start, limit]);

    return { coins, loading };
}
