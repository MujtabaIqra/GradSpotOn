
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: string;
  studentId: string;
}

// Map form values to database enum values that match the check constraint
const USER_TYPE_MAP = {
  student: 'Student',
  admin: 'Admin',
  faculty: 'Faculty',
  staff: 'Staff',
  security: 'Security'
} as const;

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleUserTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, userType: value }));
  };

  const isValidEmail = (email: string) => {
    // For testing purposes, accept all emails
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup form submitted with data:", formData);

    if (!isValidEmail(formData.email)) {
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

    try {
      // Map the form user type to the database enum value
      const dbUserType = USER_TYPE_MAP[formData.userType as keyof typeof USER_TYPE_MAP];
      
      console.log("About to sign up with:", {
        email: formData.email,
        password: "******",
        userType: formData.userType,
        dbUserType: dbUserType,
        name: formData.name,
        studentId: formData.userType === 'student' ? formData.studentId : null
      });
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            user_type: dbUserType,
            student_id: formData.userType === 'student' ? formData.studentId : null,
          }
        }
      });

      console.log("Sign up response:", { data, error });

      if (error) throw error;

      toast({
        title: "Registration Successful",
        description: "Your account has been created. You can now sign in.",
      });
      
      // Navigate to login page
      navigate('/login');
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "There was a problem creating your account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
