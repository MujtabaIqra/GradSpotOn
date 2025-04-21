
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AjmanLogo from '@/components/AjmanLogo';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - replace with actual authentication logic
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen flex flex-col p-4">
      <div 
        className="flex items-center gap-2 mb-8 cursor-pointer" 
        onClick={() => navigate('/')}
      >
        <div className="w-10 h-10">
          <AjmanLogo />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight text-spoton-purple-darkest">Spot<span className="text-spoton-purple">On</span></span>
          <span className="text-xs text-muted-foreground leading-tight">Ajman University</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome Back</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Login to Your Account</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@ajman.ac.ae"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <a 
                    href="#" 
                    className="text-xs text-spoton-purple hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      // Handle forgot password
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full bg-spoton-purple hover:bg-spoton-purple-dark"
              >
                Sign In
              </Button>
              <p className="text-center text-sm">
                Don't have an account?{' '}
                <a 
                  href="#" 
                  className="text-spoton-purple hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/signup');
                  }}
                >
                  Sign up
                </a>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
      
      <footer className="text-center p-4 text-sm text-muted-foreground mt-8">
        &copy; {new Date().getFullYear()} Ajman University. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;
