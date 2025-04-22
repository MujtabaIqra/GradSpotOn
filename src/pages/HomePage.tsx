
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import AjmanLogo from '@/components/AjmanLogo';
import CampusMap from '@/components/CampusMap';

const HomePage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center p-6 animate-fade-in">
        <div className="w-32 h-32 mb-8">
          <AjmanLogo />
        </div>
        
        <h1 className="text-4xl font-bold text-center mb-2">
          <span className="text-spoton-purple-darkest">Spot</span>
          <span className="text-spoton-purple">On</span>
        </h1>
        <p className="text-xl text-center text-muted-foreground mb-4">Find & reserve parking at Ajman University</p>
        
        {/* NEW: Campus Map for visual context */}
        <CampusMap />

        <div className="w-full max-w-sm space-y-4">
          <Button 
            className="w-full h-12 text-lg bg-spoton-purple hover:bg-spoton-purple-dark"
            onClick={() => navigate('/dashboard')}
          >
            Get Started
          </Button>
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1 h-12 border-spoton-purple text-spoton-purple hover:bg-spoton-purple/10"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
            <Button 
              variant="outline"
              className="flex-1 h-12 border-spoton-purple text-spoton-purple hover:bg-spoton-purple/10"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
      
      <footer className="text-center p-4 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Ajman University. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
