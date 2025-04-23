
import React from "react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import CampusMap from "@/components/CampusMap";

const Dashboard = () => {
  return (
    <div className="min-h-screen pb-16 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Show the campus map only, per user request */}
        <CampusMap />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;

