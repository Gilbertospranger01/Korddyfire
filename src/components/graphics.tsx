'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { useState, useEffect } from 'react';
import supabase from '@/utils/supabase';
import { io } from 'socket.io-client';

type CombinedData = {
    name: string;
    sales: number;
    purchases: number;
};

const socket = io('http://localhost:3500');

function Graph() {
    const [data, setData] = useState<CombinedData[]>([]);

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const fetchData = async () => {
        const { data: salesData, error: salesError } = await supabase
            .from('sales')
            .select('year, month, price');

        const { data: purchasesData, error: purchasesError } = await supabase
            .from('purchasing')
            .select('year, month, amount');

        if (salesError || purchasesError || !salesData || !purchasesData) {
            setData(generateDailyData());
            return;
        }

        const salesMap = new Map<string, number>();
        const purchasesMap = new Map<string, number>();

        salesData.forEach((sale) => {
            const key = `${sale.month}/${sale.year}`;
            salesMap.set(key, (salesMap.get(key) || 0) + sale.price);
        });

        purchasesData.forEach((purchase) => {
            const key = `${purchase.month}/${purchase.year}`;
            purchasesMap.set(key, (purchasesMap.get(key) || 0) + purchase.amount);
        });

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        const lastSixMonths = [];
        for (let i = 0; i < 6; i++) {
            let month = currentMonth - i;
            let year = currentYear;

            if (month <= 0) {
                month += 12;
                year -= 1;
            }

            const key = `${month}/${year}`;
            lastSixMonths.unshift(key);
        }

        const dataExists = lastSixMonths.some((key) => salesMap.has(key) || purchasesMap.has(key));

        if (dataExists) {
            const combinedData = lastSixMonths.map((key) => {
                const [month, year] = key.split('/');
                const monthName = new Date(`${year}-${month}`).toLocaleString('default', { month: 'short' });
                return {
                    name: `${monthName}/${year}`,
                    sales: salesMap.get(key) || 0,
                    purchases: purchasesMap.get(key) || 0,
                };
            });
            setData(combinedData);
        } else {
            setData(generateDailyData());
        }
    };

    const generateDailyData = () => {
        const today = new Date();
        const weekday = today.getDay();

        const dailyData = daysOfWeek.map((day, index) => {
            let name = '';
            if (index === weekday) {
                name = 'Today';
            } else {
                name = day;
            }
            return { name, sales: 0, purchases: 0 };
        });

        return dailyData;
    };

    useEffect(() => {
        fetchData();

        socket.on('update-graph', fetchData);

        const salesChannel = supabase
            .channel('realtime:sales')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
                socket.emit('sales-updated');
            })
            .subscribe();

        const purchasesChannel = supabase
            .channel('realtime:purchasing')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'purchasing' }, () => {
                socket.emit('purchases-updated');
            })
            .subscribe();

        return () => {
            supabase.removeChannel(salesChannel);
            supabase.removeChannel(purchasesChannel);
            socket.off('update-graph');
        };
    }, []);

    function formatNumber(value: number): string {
        if (value >= 1_000_000_000_000) return (value / 1_000_000_000_000).toFixed(1) + 'T';
        if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + 'B';
        if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
        if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
        return value.toString();
    }

    return (
        <div className="w-full h-100 pr-10 pb-16 pt-20 rounded-xl shadow-xl bg-gray-950 text-white">
            <ResponsiveContainer width="100%" height="100%">
                {data.length > 0 ? (
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
                            contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                            labelStyle={{ color: '#fff' }}
                            cursor={{ fill: '#374151' }}
                            formatter={(value: number) => [formatNumber(value), '']}
                        />
                        <Area
                            type="monotone"
                            dataKey="sales"
                            stroke="#2563eb"
                            fillOpacity={1}
                            fill="url(#colorSales)"
                            name="Sales"
                        />
                        <Area
                            type="monotone"
                            dataKey="purchases"
                            stroke="#16a34a"
                            fillOpacity={1}
                            fill="url(#colorPurchases)"
                            name="Purchases"
                        />
                    </AreaChart>
                ) : (
                    <div className="w-full h-full flex justify-center items-center text-gray-500">No data to display</div>
                )}
            </ResponsiveContainer>
        </div>
    );
}

export default Graph;
