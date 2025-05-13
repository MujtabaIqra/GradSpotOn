
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { User, Edit, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EditableAccountInfoProps {
  userId: string;
  studentId?: string | null;
  userType?: string;
  fullName?: string;
}

export function EditableAccountInfo({ userId, studentId, userType, fullName }: EditableAccountInfoProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: fullName || '',
    userType: userType || 'Student',
  });
  
  // Update local state when props change
  useEffect(() => {
    setFormData({
      fullName: fullName || '',
      userType: userType || 'Student',
    });
  }, [fullName, userType]);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      fullName: fullName || '',
      userType: userType || 'Student',
    });
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // In a production app, validate data before saving
      if (!formData.fullName.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Full name is required."
        });
        return;
      }
      
      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          user_type: formData.userType,
          student_id: studentId // Keep the existing studentId
        })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile Updated",
        description: "Your account information has been saved successfully.",
      });

      // Force page reload to reflect the changes
      window.location.reload();
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update your profile. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </div>
          {!isEditing && (
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                value={formData.fullName} 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Type</label>
              <Select 
                value={formData.userType}
                onValueChange={(value) => setFormData({...formData, userType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                  <SelectItem value="Visitor">Visitor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Full Name</span>
              <span>{fullName || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Type</span>
              <span>{userType || 'Student'}</span>
            </div>
          </>
        )}
      </CardContent>
      
      {isEditing && (
        <CardFooter className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancel}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSave}
            disabled={loading}
          >
            <Check className="h-4 w-4 mr-1" />
            Save
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
