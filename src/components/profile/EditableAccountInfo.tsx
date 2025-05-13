
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from 'lucide-react';

interface EditableAccountInfoProps {
  userId: string;
  studentId?: string | null;
  userType?: string;
  fullName?: string;
}

export function EditableAccountInfo({ userId, studentId, userType, fullName }: EditableAccountInfoProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5" />
          Account Information
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Full Name</span>
          <span>{fullName || 'Not set'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Account Type</span>
          <span>{userType || 'Student'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
