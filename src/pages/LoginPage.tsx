import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AjmanLogo from '@/components/AjmanLogo';
// Toast
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isAjmanEmail = (email: string) => {
    return email.trim().toLowerCase().endsWith('@ajmanuni.ac.ae');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAjmanEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please use a valid Ajman University email address.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) throw authError;
      
      if (!authData.user) throw new Error("No user data returned");
      
      toast({
        title: "Login Successful",
        description: "Welcome back to SpotOn!"
      });
      
      // Check if it's an admin email and route accordingly
      const isAdminEmail = email.startsWith('a.') && email.endsWith('@ajmanuni.ac.ae');
      navigate(isAdminEmail ? '/admin' : '/dashboard');
      
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full p-4">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16">
            <AjmanLogo />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your SpotOn account</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@ajmanuni.ac.ae"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-spoton-purple hover:bg-spoton-purple-dark"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              
              <div className="text-sm text-center space-y-2">
                <p>
                  <Button variant="link" className="p-0" onClick={() => navigate('/forgot-password')}>
                    Forgot your password?
                  </Button>
                </p>
                <p>
                  Don't have an account?{' '}
                  <Button variant="link" className="p-0" onClick={() => navigate('/signup')}>
                    Sign up
                  </Button>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
