
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderProps {
  displayName: string;
  email?: string;
  userType?: string;
  initials: string;
}

export function ProfileHeader({ displayName, email, userType, initials }: ProfileHeaderProps) {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <Avatar className="h-16 w-16 bg-spoton-purple">
        <AvatarFallback className="text-white text-xl font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-xl font-bold">{displayName}</h1>
        <div className="flex items-center">
          <p className="text-muted-foreground text-sm mr-2">{email}</p>
          <Badge variant="outline" className="text-xs">{userType || 'Student'}</Badge>
        </div>
      </div>
    </div>
  );
}
