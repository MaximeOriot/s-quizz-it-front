import React from "react";
import ScoreGraph from "../../components/ui/ScoreGraph";
import Header from "../../components/ui/Header";

const data = [
  { day: "Lundi", toi: 18000, amis: 9000, global: 8000 },
  { day: "Mardi", toi: 22000, amis: 10000, global: 10000 },
  { day: "Mercredi", toi: 15000, amis: 7000, global: 19000 },
  { day: "Jeudi", toi: 20000, amis: 8000, global: 9000 },
  { day: "Vendredi", toi: 23000, amis: 11000, global: 8000 },
  { day: "Samedi", toi: 12000, amis: 4000, global: 20000 },
  { day: "Dimanche", toi: 17000, amis: 10000, global: 7000 },
];

const ScorePage: React.FC = () => (
  <div>
          <Header />
    <div className="my-4 text-lg font-bold lg:text-2xl">Score de la semaine</div>
    <ScoreGraph scores={data} />
  </div>
);

export default ScorePage;