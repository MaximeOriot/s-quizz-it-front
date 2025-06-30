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

// Hook pour détecter la largeur d'écran
function useIsMobile() {
	const [isMobile, setIsMobile] = React.useState(false);
	React.useEffect(() => {
		const check = () => setIsMobile(window.innerWidth < 640);
		check();
		window.addEventListener('resize', check);
		return () => window.removeEventListener('resize', check);
	}, []);
	return isMobile;
}

type ScoreData = {
	day: string;
	toi: number;
	amis: number;
	global: number;
};

type ScoreGraphProps = {
	scores: ScoreData[];
};

const ScoreGraph: React.FC<ScoreGraphProps> = ({ scores }) => {
	const isMobile = useIsMobile();
	const barSize = isMobile ? 20 : 28;
	const height = isMobile ? 350 : 400;
	const tickFontSize = isMobile ? 10 : 16;
	const legendFontSize = isMobile ? 14 : 22;
	const width = isMobile ? "100%" : "80%";
	

	return (
		<div>
			<ResponsiveContainer width={width} height={height} className="mx-auto">
			
				<BarChart
					data={scores}
					margin={{ top: isMobile ? 50 : 60, right: 10, left: 10, bottom: 5 }}
					
				>
					<XAxis dataKey="day" tick={{ fill: "var(--foreground)", fontSize: tickFontSize }} />
					<YAxis tick={{ fill: "var(--foreground)", fontSize: tickFontSize }} />

					<Tooltip contentStyle={{ color: "var(--foreground)", backgroundColor: "var(--foreground)", borderRadius: 8, border: "none" }}/>
					
					<Legend
						verticalAlign="top"
						align="center"
						iconType="circle"
						wrapperStyle={{
							color: "var(--foreground)",
							fontSize: legendFontSize,
							marginTop: isMobile ? -35 : -45,
							
						}}
					/>
					
					<Bar
						dataKey="toi"
						stackId="a"
						fill="#eaff00"
						name="Toi"
						barSize={barSize}
						radius={isMobile ? [0, 0, 10, 10] : [0, 0, 20, 20]}
					/>
					<Bar
						dataKey="amis"
						stackId="a"
						fill="#c86fff"
						name="Tes amis"
						barSize={barSize}
						radius={[0, 0, 0, 0]}
						style={{ transform: `translateY(${isMobile ? 5 : 10}px)` }}
					/>
					<Bar
						dataKey="global"
						stackId="a"
						fill="#7b7bff"
						name="Global"
						barSize={barSize}
						radius={isMobile ? [10, 10, 0, 0] : [20, 20, 0, 0]}
						style={{ transform: `translateY(${isMobile ? 5 : 10}px)` }}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};

export default ScoreGraph;
