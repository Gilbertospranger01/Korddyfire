"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect, useCallback } from "react";
import api from "@/utils/api";
import { io } from "socket.io-client";

type CombinedData = {
  name: string;
  sales: number;
  purchases: number;
};

type Sale = {
  year: number;
  month: number;
  price: number;
};

type Purchase = {
  year: number;
  month: number;
  amount: number;
};

const socket = io("http://localhost:3500");

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const Graph = () => {
  const [data, setData] = useState<CombinedData[]>([]);

  const generateDailyData = useCallback((): CombinedData[] => {
    const today = new Date();
    const weekday = today.getDay();

    return daysOfWeek.map((day, index) => ({
      name: index === weekday ? "Today" : day,
      sales: 0,
      purchases: 0,
    }));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [salesRes, purchasesRes] = await Promise.all([
        api.get<Sale[]>("/sales"),
        api.get<Purchase[]>("/purchasing"),
      ]);

      const salesMap = new Map<string, number>();
      const purchasesMap = new Map<string, number>();

      salesRes.data.forEach((sale) => {
        const key = `${sale.month}/${sale.year}`;
        salesMap.set(key, (salesMap.get(key) || 0) + sale.price);
      });

      purchasesRes.data.forEach((purchase) => {
        const key = `${purchase.month}/${purchase.year}`;
        purchasesMap.set(key, (purchasesMap.get(key) || 0) + purchase.amount);
      });

      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      const lastSixMonths: string[] = [];
      for (let i = 0; i < 6; i++) {
        let month = currentMonth - i;
        let year = currentYear;
        if (month <= 0) {
          month += 12;
          year -= 1;
        }
        lastSixMonths.unshift(`${month}/${year}`);
      }

      const combinedData = lastSixMonths.map((key) => {
        const [month, year] = key.split("/").map(Number);
        const monthName = new Date(year, month - 1).toLocaleString("default", { month: "short" });
        return {
          name: `${monthName}/${year}`,
          sales: salesMap.get(key) || 0,
          purchases: purchasesMap.get(key) || 0,
        };
      });

      setData(combinedData.some((d) => d.sales || d.purchases) ? combinedData : generateDailyData());
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setData(generateDailyData());
    }
  }, [generateDailyData]);

  useEffect(() => {
    fetchData();
    socket.on("update-graph", fetchData);

    return () => {
      socket.off("update-graph", fetchData);
    };
  }, [fetchData]);

  const formatNumber = (value: number): string => {
    if (value >= 1_000_000_000_000) return (value / 1_000_000_000_000).toFixed(1) + "T";
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + "B";
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
    if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
    return value.toString();
  };

  return (
    <div className="w-full h-100 pr-10 pb-16 pt-20 rounded-xl shadow-xl bg-gray-950 text-white">
      <ResponsiveContainer width="100%" height="100%">
        {data.length ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
            <XAxis dataKey="name" stroke="#e5e5e5" />
            <YAxis stroke="#e5e5e5" tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
              labelStyle={{ color: "#fff" }}
              cursor={{ fill: "#374151" }}
              formatter={(value: number) => [formatNumber(value), ""]}
            />
            <Area type="monotone" dataKey="sales" stroke="#2563eb" fillOpacity={1} fill="url(#colorSales)" name="Sales" />
            <Area type="monotone" dataKey="purchases" stroke="#16a34a" fillOpacity={1} fill="url(#colorPurchases)" name="Purchases" />
          </AreaChart>
        ) : (
          <div className="w-full h-full flex justify-center items-center text-gray-500">
            No data to display
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default Graph;