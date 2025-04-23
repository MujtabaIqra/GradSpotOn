
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="text-spoton-purple text-9xl font-bold mb-4">404</div>
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          We couldn't find the page you're looking for: 
          <span className="font-mono text-sm block mt-2 bg-muted p-2 rounded">
            {location.pathname}
          </span>
        </p>
        <Button 
          className="bg-spoton-purple hover:bg-spoton-purple-dark"
          onClick={() => navigate('/')}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
