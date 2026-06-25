import { LibraryProvider } from './hooks/useLibraryStore';
import AppRouter from './routes';


function App() {
  return (
    <LibraryProvider>
      <AppRouter />
    </LibraryProvider>
  );
}

export default App;
