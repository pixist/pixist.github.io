import { useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GraduationCap, User, Circle } from '@phosphor-icons/react';
import { Role, RoomPresence as RoomPresenceType, InstructorState, StudentPlaybackState } from '@/lib/types';
import { Translations } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface RoomPresenceProps {
  roomId: string;
  currentRole: Role;
  t: Translations;
  instructorState?: InstructorState;
  studentState?: StudentPlaybackState;
}

export function RoomPresence({ roomId, currentRole, t, instructorState, studentState }: RoomPresenceProps) {
  const [presence, setPresence] = useKV<Record<string, RoomPresenceType>>(`room-${roomId}-presence`, {});
  const [instructorStateShared] = useKV<InstructorState | null>(`room-${roomId}-instructor-state`, null);
  const [studentStateShared] = useKV<StudentPlaybackState | null>(`room-${roomId}-student-state`, null);
  const [userId] = useState(() => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const updatePresence = () => {
      setPresence((current) => ({
        ...current,
        [userId]: {
          userId,
          role: currentRole,
          timestamp: Date.now(),
        },
      }));
    };

    updatePresence();
    const interval = setInterval(updatePresence, 5000);

    return () => {
      clearInterval(interval);
      setPresence((current) => {
        const updated = { ...current };
        delete updated[userId];
        return updated;
      });
    };
  }, [userId, currentRole, setPresence]);

  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      setPresence((current) => {
        const updated = { ...current };
        Object.keys(updated).forEach((key) => {
          if (now - updated[key].timestamp > 15000) {
            delete updated[key];
          }
        });
        return updated;
      });
    };

    const interval = setInterval(cleanup, 10000);
    return () => clearInterval(interval);
  }, [setPresence]);

  useEffect(() => {
    if (currentRole === 'instructor' && instructorState) {
      setPresence((current) => ({
        ...current,
        [`instructor-state`]: instructorState as any,
      }));
    }
  }, [instructorState, currentRole, setPresence]);

  useEffect(() => {
    if (currentRole === 'student' && studentState) {
      setPresence((current) => ({
        ...current,
        [`student-state`]: studentState as any,
      }));
    }
  }, [studentState, currentRole, setPresence]);

  const users = Object.values(presence || {}).filter((p) => p.userId);
  const instructors = users.filter((u) => u.role === 'instructor');
  const students = users.filter((u) => u.role === 'student');

  const displayState = currentRole === 'student' ? instructorStateShared : studentStateShared;

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {currentRole === 'instructor' ? t.instructor.activeUsers : t.student.activeUsers}
          </h3>
          <Badge variant="outline" className="text-xs">
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </Badge>
        </div>

        <div className="space-y-2">
          {instructors.length > 0 && (
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 bg-primary">
                <AvatarFallback>
                  <GraduationCap size={16} weight="duotone" className="text-primary-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{t.roles.instructor}</span>
                  <Circle weight="fill" size={8} className="text-green-500" />
                </div>
                {currentRole === 'student' && instructorStateShared && (
                  <p className="text-xs text-muted-foreground">
                    {instructorStateShared.isRecording && t.student.instructorRecording}
                    {instructorStateShared.isPlaying && t.student.instructorPlaying}
                    {!instructorStateShared.isRecording && !instructorStateShared.isPlaying && t.student.instructorActive}
                  </p>
                )}
              </div>
            </div>
          )}

          {students.length > 0 ? (
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 bg-student">
                <AvatarFallback>
                  <User size={16} weight="duotone" className="text-student-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{t.roles.student}</span>
                  <Circle weight="fill" size={8} className="text-green-500" />
                  {students.length > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      +{students.length - 1}
                    </Badge>
                  )}
                </div>
                {currentRole === 'instructor' && studentStateShared && (
                  <p className="text-xs text-muted-foreground">
                    {studentStateShared.isPlaying && !studentStateShared.isPaused && (
                      <>
                        {t.student.playing} - {Math.round(studentStateShared.progress)}%
                      </>
                    )}
                    {studentStateShared.isPaused && t.student.paused}
                    {!studentStateShared.isPlaying && !studentStateShared.isPaused && 'Idle'}
                  </p>
                )}
              </div>
            </div>
          ) : (
            currentRole === 'instructor' && (
              <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                {t.instructor.noStudents}
              </div>
            )
          )}
        </div>
      </div>
    </Card>
  );
}
