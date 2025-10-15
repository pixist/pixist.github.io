import { useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { RoleSelection } from './components/RoleSelection';
import { InstructorView } from './components/InstructorView';
import { StudentView } from './components/StudentView';
import { Role, Sequence } from './lib/types';
import { Toaster } from 'sonner';

function App() {
  const [role, setRole] = useKV<Role>('user-role', null);
  const [sequence, setSequence] = useKV<Sequence | null>('current-sequence', null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleRoleChange = () => {
    setRole(null);
  };

  const handleSequenceCreate = (newSequence: Sequence) => {
    setSequence(newSequence);
  };

  if (!role) {
    return (
      <>
        <RoleSelection onSelectRole={setRole} />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <>
      {role === 'instructor' ? (
        <InstructorView
          onRoleChange={handleRoleChange}
          onSequenceCreate={handleSequenceCreate}
        />
      ) : (
        <StudentView
          sequence={sequence ?? null}
          onRoleChange={handleRoleChange}
        />
      )}
      <Toaster position="top-center" />
    </>
  );
}

export default App;