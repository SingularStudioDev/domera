'use client';

import {
  ArrowDown,
  ArrowDownIcon,
  ArrowUpIcon,
  TrendingUp,
} from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export const description = 'A multiple line chart with 5 lines';

const chartData = [
  { day: 1, ventas: 2, leads: 5, conversiones: 0, visitas: 8, ingresos: 1 },
  { day: 2, ventas: 15, leads: 3, conversiones: 12, visitas: 20, ingresos: 8 },
  {
    day: 3,
    ventas: 35,
    leads: 45,
    conversiones: 18,
    visitas: 12,
    ingresos: 30,
  },
  {
    day: 4,
    ventas: 22,
    leads: 65,
    conversiones: 40,
    visitas: 55,
    ingresos: 15,
  },
  { day: 5, ventas: 60, leads: 25, conversiones: 8, visitas: 70, ingresos: 45 },
  {
    day: 6,
    ventas: 28,
    leads: 80,
    conversiones: 55,
    visitas: 35,
    ingresos: 25,
  },
  {
    day: 7,
    ventas: 75,
    leads: 18,
    conversiones: 70,
    visitas: 90,
    ingresos: 60,
  },
  {
    day: 8,
    ventas: 45,
    leads: 95,
    conversiones: 25,
    visitas: 48,
    ingresos: 80,
  },
  {
    day: 9,
    ventas: 90,
    leads: 40,
    conversiones: 85,
    visitas: 22,
    ingresos: 35,
  },
  {
    day: 10,
    ventas: 18,
    leads: 110,
    conversiones: 45,
    visitas: 105,
    ingresos: 95,
  },
  {
    day: 11,
    ventas: 85,
    leads: 35,
    conversiones: 95,
    visitas: 65,
    ingresos: 50,
  },
  {
    day: 12,
    ventas: 55,
    leads: 125,
    conversiones: 30,
    visitas: 120,
    ingresos: 75,
  },
  {
    day: 13,
    ventas: 120,
    leads: 60,
    conversiones: 110,
    visitas: 45,
    ingresos: 40,
  },
  {
    day: 14,
    ventas: 40,
    leads: 90,
    conversiones: 65,
    visitas: 130,
    ingresos: 105,
  },
  {
    day: 15,
    ventas: 95,
    leads: 25,
    conversiones: 125,
    visitas: 80,
    ingresos: 65,
  },
  {
    day: 16,
    ventas: 70,
    leads: 140,
    conversiones: 50,
    visitas: 95,
    ingresos: 120,
  },
  {
    day: 17,
    ventas: 130,
    leads: 55,
    conversiones: 140,
    visitas: 35,
    ingresos: 85,
  },
  {
    day: 18,
    ventas: 25,
    leads: 105,
    conversiones: 75,
    visitas: 125,
    ingresos: 45,
  },
  {
    day: 19,
    ventas: 110,
    leads: 75,
    conversiones: 35,
    visitas: 145,
    ingresos: 130,
  },
  {
    day: 20,
    ventas: 65,
    leads: 130,
    conversiones: 120,
    visitas: 70,
    ingresos: 90,
  },
  {
    day: 21,
    ventas: 125,
    leads: 45,
    conversiones: 90,
    visitas: 110,
    ingresos: 55,
  },
  {
    day: 22,
    ventas: 35,
    leads: 115,
    conversiones: 145,
    visitas: 85,
    ingresos: 115,
  },
  {
    day: 23,
    ventas: 105,
    leads: 85,
    conversiones: 60,
    visitas: 140,
    ingresos: 75,
  },
  {
    day: 24,
    ventas: 80,
    leads: 145,
    conversiones: 105,
    visitas: 95,
    ingresos: 135,
  },
  {
    day: 25,
    ventas: 140,
    leads: 70,
    conversiones: 130,
    visitas: 120,
    ingresos: 95,
  },
  {
    day: 26,
    ventas: 95,
    leads: 120,
    conversiones: 85,
    visitas: 105,
    ingresos: 110,
  },
  {
    day: 27,
    ventas: 115,
    leads: 95,
    conversiones: 115,
    visitas: 135,
    ingresos: 125,
  },
  {
    day: 28,
    ventas: 125,
    leads: 135,
    conversiones: 125,
    visitas: 115,
    ingresos: 140,
  },
  {
    day: 29,
    ventas: 135,
    leads: 115,
    conversiones: 140,
    visitas: 130,
    ingresos: 120,
  },
  {
    day: 30,
    ventas: 120,
    leads: 125,
    conversiones: 135,
    visitas: 140,
    ingresos: 130,
  },
];

const chartConfig = {
  ventas: {
    label: 'Ventas',
    color: '#2563eb',
  },
  leads: {
    label: 'Leads',
    color: '#dc2626',
  },
  conversiones: {
    label: 'Conversiones',
    color: '#16a34a',
  },
  visitas: {
    label: 'Visitas',
    color: '#ca8a04',
  },
  ingresos: {
    label: 'Ingresos',
    color: '#9333ea',
  },
} satisfies ChartConfig;

export function ChartLineMultiple() {
  return (
    <Card className="max-h-[60vh]">
      <CardHeader className="pb-8">
        <CardTitle className="text-2xl text-[#0040FF]">
          Ventas por mes o período
        </CardTitle>

        <div className="mt-3 flex w-full items-center justify-between gap-5">
          <LegendCard
            title="Vendido Monoambiente"
            color="#DE9000"
            number={12}
            stat="2"
            statBool
          />
          <LegendCard
            title="Vendido 1 dormitorio"
            color="#71BBFF"
            number={8}
            stat="5"
          />
          <LegendCard
            title="Vendido 2 dormitorio"
            color="#CC017B"
            number={25}
            stat="4"
          />
          <LegendCard
            title="Vendido 3 dormitorios"
            color="#0040FF"
            number={2}
            stat="28"
            statBool
          />
          <LegendCard
            title="Vendido garage"
            color="#509C43"
            number={16}
            stat="1"
            statBool
          />
        </div>
      </CardHeader>
      <CardContent className="pr-6 pb-2 pl-0">
        <ChartContainer
          config={chartConfig}
          className="h-[35vh] min-h-[200px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 0,
              right: 0,
            }}
          >
            <CartesianGrid vertical={false} horizontal={true} />
            <XAxis
              dataKey="day"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              domain={[1, 30]}
              type="number"
              ticks={[1, 5, 10, 15, 20, 25, 30]}
            />
            <YAxis
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              domain={[0, 150]}
              ticks={[0, 50, 100, 150]}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            <Line
              dataKey="ventas"
              type="monotone"
              stroke="var(--color-ventas)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="leads"
              type="monotone"
              stroke="var(--color-leads)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="conversiones"
              type="monotone"
              stroke="var(--color-conversiones)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="visitas"
              type="monotone"
              stroke="var(--color-visitas)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="ingresos"
              type="monotone"
              stroke="var(--color-ingresos)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

interface LegendCardProps {
  title: string;
  number: number;
  color: string;
  stat: string;
  statBool?: boolean;
}

function LegendCard({ title, number, color, stat, statBool }: LegendCardProps) {
  return (
    <div className="w-full rounded-md border border-[#DCDCDC] px-4 py-3">
      <div className="flex items-center gap-2">
        <div
          style={{ backgroundColor: color }}
          className="h-3 w-3 rounded-full"
        />
        <p className="text-xs text-[#7B7B7B]">{title}</p>
      </div>
      <div className="mt-1 flex items-center justify-start gap-2">
        <p className="font-semibold text-[#0040FF]">{number} unidades</p>
        <div
          className={`${statBool ? 'bg-green-100 text-green-500' : 'bg-red-200 text-red-500'} flex items-center justify-center gap-1 rounded-full px-1 py-0.5 text-xs font-bold`}
        >
          {statBool ? (
            <ArrowUpIcon className="h-4 w-4" />
          ) : (
            <ArrowDownIcon className="h-4 w-4" />
          )}
          {stat}%
        </div>
      </div>
    </div>
  );
}
