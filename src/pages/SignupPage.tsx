
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AjmanLogo from '@/components/AjmanLogo';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    studentId: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleUserTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, userType: value }));
  };
  
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock signup - replace with actual registration logic
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
        <h1 className="text-2xl font-bold mb-6 text-center">Create Your Account</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Fill in your details to get started</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@ajman.ac.ae"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="userType">I am a</Label>
                <Select
                  value={formData.userType}
                  onValueChange={handleUserTypeChange}
                >
                  <SelectTrigger id="userType">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty Member</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="visitor">Visitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.userType === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input 
                    id="studentId" 
                    placeholder="Your student ID number"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full bg-spoton-purple hover:bg-spoton-purple-dark"
              >
                Create Account
              </Button>
              <p className="text-center text-sm">
                Already have an account?{' '}
                <a 
                  href="#" 
                  className="text-spoton-purple hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                  }}
                >
                  Sign in
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

export default SignupPage;
