import React from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

type ScoreData = {
	day: string;
	toi: number;
	amis: number;
	global: number;
};

type ScoreGraphProps = {
	scores: ScoreData[];
};

const ScoreGraph: React.FC<ScoreGraphProps> = ({ scores }) => (
	<ResponsiveContainer width="100%" height={400} className="mx-auto">
		<BarChart
			data={scores}
			margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
		>
			<XAxis dataKey="day" tick={{ fill: "var(--foreground)"}} />
			<YAxis tick={{ fill: "var(--foreground)" }} />
			<Tooltip contentStyle={{ color: "var(--foreground)", backgroundColor: "var(--foreground)", borderRadius: 8, border: "none" }}/>
			<Legend
				verticalAlign="top"
				align="center"
				iconType="circle"
				wrapperStyle={{ color: "var(--foreground)" }}
			/>
			<Bar
					dataKey="toi"
					stackId="a"
					fill="#eaff00"
					name="Toi"
					barSize={28}
					radius={[0, 0, 20, 20]}
				/>

				<Bar
					dataKey="amis"
					stackId="a"
					fill="#c86fff"
					name="Tes amis"
					barSize={28}
					radius={[0, 0, 0, 0]}
					style={{ transform: "translateY(10px)" }}
				/>
				<Bar
					dataKey="global"
					stackId="a"
					fill="#7b7bff"
					name="Global"
					barSize={28}
					radius={[20, 20, 0, 0]}
					style={{ transform: "translateY(10px)" }}
				/>
		</BarChart>
	</ResponsiveContainer>
);

export default ScoreGraph;
