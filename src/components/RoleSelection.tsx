import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, GraduationCap } from '@phosphor-icons/react';
import { Role } from '@/lib/types';

interface RoleSelectionProps {
  onSelectRole: (role: Role) => void;
}

export function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Vocal Training Studio</h1>
          <p className="text-muted-foreground">Choose your role to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card
            className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
            onClick={() => onSelectRole('instructor')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap size={32} weight="duotone" className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Instructor</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Create sequences, set ranges, and guide vocal exercises
                </p>
              </div>
              <Button className="w-full">Start as Instructor</Button>
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
                <h2 className="text-xl font-semibold mb-2">Student</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Practice with sequences and receive real-time guidance
                </p>
              </div>
              <Button variant="outline" className="w-full border-student text-student hover:bg-student hover:text-student-foreground">
                Start as Student
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}