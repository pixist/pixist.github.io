import { useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { RoomJoin } from './components/RoomJoin';
import { RoleSelection } from './components/RoleSelection';
import { InstructorView } from './components/InstructorView';
import { StudentView } from './components/StudentView';
import { Role, Sequence } from './lib/types';
import { Language, getTranslation } from './lib/i18n';
import { Toaster } from 'sonner';

function App() {
  const [roomId, setRoomId] = useKV<string | null>('room-id', null);
  const [language, setLanguage] = useKV<Language>('language', 'en');
  const [role, setRole] = useKV<Role>('user-role', null);
  const [sequence, setSequence] = useKV<Sequence | null>('current-sequence', null);

  const t = getTranslation(language || 'en');

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleJoinRoom = (newRoomId: string, newLanguage: Language) => {
    setRoomId(newRoomId);
    setLanguage(newLanguage);
    setRole(null);
    setSequence(null);
  };

  const handleLeaveRoom = () => {
    setRoomId(null);
    setRole(null);
    setSequence(null);
  };

  const handleRoleChange = () => {
    setRole(null);
  };

  const handleSequenceCreate = (newSequence: Sequence) => {
    setSequence(newSequence);
  };

  if (!roomId) {
    return (
      <>
        <RoomJoin onJoinRoom={handleJoinRoom} />
        <Toaster position="top-center" />
      </>
    );
  }

  if (!role) {
    return (
      <>
        <RoleSelection 
          roomId={roomId}
          onSelectRole={setRole} 
          onLeaveRoom={handleLeaveRoom}
          t={t}
        />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <>
      {role === 'instructor' ? (
        <InstructorView
          roomId={roomId}
          onRoleChange={handleRoleChange}
          onSequenceCreate={handleSequenceCreate}
          t={t}
        />
      ) : (
        <StudentView
          roomId={roomId}
          sequence={sequence ?? null}
          onRoleChange={handleRoleChange}
          t={t}
        />
      )}
      <Toaster position="top-center" />
    </>
  );
}

export default App;