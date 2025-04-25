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

// Map form values to database enum values
const USER_TYPE_MAP = {
  student: 'Student',
  admin: 'Admin',
  faculty: 'Staff',
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
    const emailDomain = "@ajmanuni.ac.ae";
    const normalizedEmail = email.trim().toLowerCase();
    
    if (!normalizedEmail.endsWith(emailDomain)) {
      return false;
    }

    // Check if it's an admin email (starts with 'a.')
    const isAdminEmail = normalizedEmail.startsWith("a.");
    const userType = formData.userType;

    // Validate that admin emails match admin user type and vice versa
    if (isAdminEmail && userType !== "admin") {
      toast({
        title: "Invalid User Type",
        description: "Admin emails must select 'Admin' as user type.",
        variant: "destructive",
      });
      return false;
    }

    if (!isAdminEmail && userType === "admin") {
      toast({
        title: "Invalid User Type",
        description: "Non-admin emails cannot select 'Admin' as user type.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please use a valid Ajman University email address with the correct format.",
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

    try {
      // Map the form user type to the database enum value
      const dbUserType = USER_TYPE_MAP[formData.userType as keyof typeof USER_TYPE_MAP];
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            user_type: dbUserType,
            student_id: formData.studentId,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Registration Successful",
        description: "Your account has been created. You can now sign in.",
      });
      
      // Navigate to dashboard if auto sign-in worked, else go to login
      if (data.user) {
        navigate(dbUserType === 'Admin' ? '/admin' : '/dashboard');
      } else {
        navigate('/login');
      }
    } catch (error: any) {
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
