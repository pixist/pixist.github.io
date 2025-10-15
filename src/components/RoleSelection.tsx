import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, GraduationCap, SignOut } from '@phosphor-icons/react';
import { Role } from '@/lib/types';
import { Translations } from '@/lib/i18n';

interface RoleSelectionProps {
  roomId: string;
  onSelectRole: (role: Role) => void;
  onLeaveRoom: () => void;
  t: Translations;
}

export function RoleSelection({ roomId, onSelectRole, onLeaveRoom, t }: RoleSelectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline" className="text-base px-4 py-1">
              Room: {roomId}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t.roles.selectRole}</h1>
          <p className="text-muted-foreground">Choose your role in this training session</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Card
            className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
            onClick={() => onSelectRole('instructor')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap size={32} weight="duotone" className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">{t.roles.instructor}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {t.roles.instructorDesc}
                </p>
              </div>
              <Button className="w-full">Start as {t.roles.instructor}</Button>
            </div>
          </Card>

          <Card
            className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-student"
            onClick={() => onSelectRole('student')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-student/10 flex items-center justify-center">
                <User size={32} weight="duotone" className="text-student" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">{t.roles.student}</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {t.roles.studentDesc}
                </p>
              </div>
              <Button variant="outline" className="w-full border-student text-student hover:bg-student hover:text-student-foreground">
                Start as {t.roles.student}
              </Button>
            </div>
          </Card>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={onLeaveRoom}
        >
          <SignOut className="mr-2" size={18} />
          {t.roles.leaveRoom}
        </Button>
      </div>
    </div>
  );
}