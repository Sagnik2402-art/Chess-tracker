import React, { useState, useCallback, useEffect } from 'react';
import { 
  Search, 
  Zap, 
  Timer, 
  Hourglass, 
  Swords, 
  Puzzle, 
  Trophy,
  Github,
  ChessKnight,
  BarChart3
} from 'lucide-react';
import { LichessProfile, RatingHistoryEntry, TimeControl } from './types';
import { fetchUserProfile, fetchRatingHistory } from './services/lichessService';
import { LoadingSpinner } from './components/LoadingSpinner';
import { StatCard } from './components/StatCard';
import { GrowthChart } from './components/GrowthChart';

const App: React.FC = () => {
  const [username, setUsername] = useState('');
  const [searchedUsername, setSearchedUsername] = useState<string | null>(null);
  const [profile, setProfile] = useState<LichessProfile | null>(null);
  const [history, setHistory] = useState<RatingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<TimeControl>('blitz');

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setProfile(null);
    setHistory([]);

    try {
      const [userProfile, userHistory] = await Promise.all([
        fetchUserProfile(username.trim()),
        fetchRatingHistory(username.trim())
      ]);

      setProfile(userProfile);
      setHistory(userHistory);
      setSearchedUsername(userProfile.username);
      
      // Auto select the mode with most games played initially
      const modes: TimeControl[] = ['bullet', 'blitz', 'rapid', 'classical', 'puzzle'];
      let maxGames = -1;
      let bestMode: TimeControl = 'blitz';

      modes.forEach(m => {
        const games = userProfile.perfs[m]?.games || 0;
        if (games > maxGames) {
          maxGames = games;
          bestMode = m;
        }
      });
      setSelectedMode(bestMode);

    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  }, [username]);

  // Map internal keys to API history keys
  const getHistoryKey = (mode: TimeControl): string => {
    switch (mode) {
      case 'bullet': return 'Bullet';
      case 'blitz': return 'Blitz';
      case 'rapid': return 'Rapid';
      case 'classical': return 'Classical';
      case 'puzzle': return 'Puzzles';
      default: return 'Blitz';
    }
  };

  return (
    <div className="min-h-screen bg-lichess-dark text-lichess-text selection:bg-lichess-gold selection:text-lichess-dark flex flex-col">
      
      {/* Header */}
      <header className="bg-lichess-light border-b border-lichess-accent sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-lichess-gold p-1.5 rounded-lg">
              <ChessKnight className="w-6 h-6 text-lichess-dark" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Lichess<span className="text-lichess-gold">Insight</span></span>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <a href="#" className="text-white hover:text-lichess-gold transition-colors">Tracker</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Search Section */}
        <div className={`transition-all duration-500 ease-in-out ${profile ? 'mb-8' : 'min-h-[60vh] flex flex-col justify-center items-center'}`}>
          
          {!profile && !loading && (
            <div className="text-center mb-10 space-y-4 max-w-2xl mx-auto">
              <h1 className="text-5xl font-extrabold text-white tracking-tight">
                Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-lichess-gold to-yellow-200">Chess Growth</span>
              </h1>
              <p className="text-lg text-gray-400">
                Analyze your Lichess rating history, visualize progress across different time controls, and track your journey to mastery.
              </p>
            </div>
          )}

          <form onSubmit={handleSearch} className={`w-full ${profile ? 'max-w-full' : 'max-w-xl'} relative group`}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className={`w-5 h-5 ${profile ? 'text-gray-500' : 'text-lichess-gold'}`} />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Lichess username (e.g., MagnusCarlsen)"
              className={`
                w-full pl-11 pr-32 py-4 bg-lichess-light border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lichess-gold focus:border-transparent transition-all
                ${profile ? 'border-lichess-accent' : 'border-lichess-gold/50 shadow-[0_0_20px_rgba(197,160,89,0.1)]'}
              `}
            />
            <button
              type="submit"
              disabled={loading || !username}
              className="absolute right-2 top-2 bottom-2 px-6 bg-lichess-gold hover:bg-yellow-500 text-lichess-dark font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>
        </div>

        {error && (
          <div className="max-w-xl mx-auto bg-red-900/20 border border-red-900/50 text-red-200 p-4 rounded-lg flex items-center justify-center space-x-2 mb-8">
            <span className="font-bold">Error:</span>
            <span>{error}</span>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {/* Dashboard Content */}
        {profile && !loading && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Profile Header */}
            <div className="bg-lichess-light rounded-xl p-6 border border-lichess-accent flex flex-col md:flex-row items-center md:items-start gap-6">
               <div className="flex-shrink-0">
                 <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lichess-gold to-yellow-700 p-1 shadow-lg">
                   <div className="w-full h-full rounded-full bg-lichess-dark flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                     {profile.username.slice(0, 2).toUpperCase()}
                   </div>
                 </div>
               </div>
               <div className="flex-grow text-center md:text-left space-y-2">
                 <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h2 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start">
                      {profile.profile?.firstName} {profile.profile?.lastName}
                      <span className="ml-2 text-lichess-gold">{profile.username}</span>
                      {profile.online && <span className="ml-3 w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Online"></span>}
                    </h2>
                    <span className="bg-lichess-accent px-3 py-1 rounded-full text-xs text-gray-300 font-mono border border-gray-700">
                      ID: {profile.id}
                    </span>
                 </div>
                 <p className="text-gray-400 italic max-w-2xl">
                   {profile.profile?.bio || "No bio available."}
                 </p>
                 <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                    <div className="flex items-center text-sm text-gray-400">
                      <Swords className="w-4 h-4 mr-1.5 text-lichess-gold" />
                      <span>{profile.count.all.toLocaleString()} games played</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Trophy className="w-4 h-4 mr-1.5 text-lichess-gold" />
                      <span>{profile.count.win.toLocaleString()} wins</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <BarChart3 className="w-4 h-4 mr-1.5 text-lichess-gold" />
                      <span>{(profile.playTime.total / 3600).toFixed(1)} hours played</span>
                    </div>
                 </div>
               </div>
               <div className="flex flex-col gap-2 w-full md:w-auto">
                 <a 
                   href={profile.url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="px-4 py-2 bg-lichess-dark border border-lichess-accent hover:border-lichess-gold text-white rounded-lg text-sm font-medium transition-colors text-center"
                 >
                   View on Lichess
                 </a>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard 
                title="Bullet" 
                perf={profile.perfs.bullet} 
                icon={Zap} 
                isSelected={selectedMode === 'bullet'}
                onClick={() => setSelectedMode('bullet')}
              />
              <StatCard 
                title="Blitz" 
                perf={profile.perfs.blitz} 
                icon={Timer} 
                isSelected={selectedMode === 'blitz'}
                onClick={() => setSelectedMode('blitz')}
              />
              <StatCard 
                title="Rapid" 
                perf={profile.perfs.rapid} 
                icon={Hourglass} 
                isSelected={selectedMode === 'rapid'}
                onClick={() => setSelectedMode('rapid')}
              />
              <StatCard 
                title="Classical" 
                perf={profile.perfs.classical} 
                icon={Swords} 
                isSelected={selectedMode === 'classical'}
                onClick={() => setSelectedMode('classical')}
              />
              <StatCard 
                title="Puzzles" 
                perf={profile.perfs.puzzle} 
                icon={Puzzle} 
                isSelected={selectedMode === 'puzzle'}
                onClick={() => setSelectedMode('puzzle')}
              />
            </div>

            {/* Chart Section */}
            <GrowthChart 
              history={history} 
              selectedMode={getHistoryKey(selectedMode)}
              color="#C5A059"
            />
            
          </div>
        )}
      </main>

      <footer className="border-t border-lichess-accent bg-lichess-dark py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Lichess Insight. Not affiliated with Lichess.org.</p>
          <p className="mt-2">Data provided by the Lichess API.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;