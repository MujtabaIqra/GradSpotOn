
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: string;
  studentId: string;
}

export function useSignup(initialData?: Partial<SignupFormData>) {
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "student",
    studentId: "",
    ...initialData,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Update form fields by field id
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleUserTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, userType: value }));
  };

  const isAjmanStudentEmail = (email: string) => {
    return email.trim().toLowerCase().endsWith("@ajmanuni.ac.ae");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAjmanStudentEmail(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Only students with @ajmanuni.ac.ae email addresses can sign up.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
          user_type: formData.userType,
          student_id: formData.studentId,
        }
      }
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Registration Failed",
        description: error.message || "There was a problem creating your account.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registration Successful",
        description: "Your account has been created. You can now sign in.",
      });
      // Navigate to dashboard if auto sign-in worked, else go to login
      if (data.user) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  };

  return {
    formData,
    setFormData,
    loading,
    handleChange,
    handleUserTypeChange,
    handleSignup,
  };
}
