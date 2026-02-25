// components/AudioPlayer/MusicLibrary.tsx
import { useEffect, useState } from "react";
import { useMusic } from "../contexts/MusicContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, Loader2, RefreshCw } from "lucide-react";
import NavBar from '../NavBar';
import Footer from "../Footer";

type Track = {
  id: string;
  name: string;
  artist_name: string;
  duration: number;
  audio: string;
  image: string;
  genre: string;
  tags: string[];
};

export function MusicLibrary() {
  const { tracks, loadTracks, playTrack, currentTrack, isLoading } = useMusic();

  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const genres = ["all", "meditation", "ambient", "relaxation", "chillout", "lounge"];

  useEffect(() => {
    //if tracks are in contecs then sync local filtered list
    setFilteredTracks(tracks);
  }, [tracks]);

  useEffect(() => {
    // apply filters locally based on global `tracks`
    let filtered = tracks;
    if (selectedGenre !== "all") {
      filtered = filtered.filter(track =>
        track.genre?.toLowerCase() === selectedGenre.toLowerCase() ||
        track.tags?.some(tag => tag.toLowerCase() === selectedGenre.toLowerCase())
      );
    }
    if (searchQuery) {
      filtered = filtered.filter(track =>
        track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    setFilteredTracks(filtered);
  }, [searchQuery, selectedGenre, tracks]);

  const loadGenre = (genre: string) => {
    setSelectedGenre(genre);
    if (genre !== "all") {
      loadTracks(genre); // call download in context
    } else {
      loadTracks("meditation");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2,'0')}`;
  };

  return (
    <div className="relative w-full min-h-screen bg-[#001F3F]">
      
      <NavBar />

      {/* Main Content Wrapper */}
      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8 8 flex justify-center">
      <div className="w-full max-w-6xl space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Search and Filters</CardTitle>
          <CardDescription>Find the perfect track for your project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
             className="!pl-10"
              placeholder="Search by name, artist, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs value={selectedGenre} onValueChange={loadGenre}>
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
              {genres.map(genre => (
                <TabsTrigger key={genre} value={genre} className="capitalize">
                  {genre === "all" ? "Everything" : genre}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </span>
              ) : `Tracks (${filteredTracks.length})`}
            </CardTitle>
            {!isLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadTracks(selectedGenre === "all" ? "meditation" : selectedGenre)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Update
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="p-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-visible p-10">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="aspect-square w-full rounded-t-lg bg-slate-200" />
                    <CardContent className="p-4 space-y-2">
                      <div className="h-5 w-3/4 bg-slate-200" />
                      <div className="h-4 w-1/2 bg-slate-200" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredTracks.map(track => (
                  <Card
                    key={track.id}
                    className={`cursor-pointer transition-all hover:shadow-lg rounded-xl overflow-hiddenp-2 ${
                      currentTrack?.id === track.id
                        ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-[#001F3F]'
                        : ''
                    }`}
                    onClick={() => playTrack(track)}
                  >
                    <div className="aspect-square relative overflow-hidden rounded-t-lg">
                      <img src={track.image} alt={track.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-black/50 text-white">
                          {formatDuration(track.duration)}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="line-clamp-1">{track.name}</h3>
                      <p className="text-muted-foreground line-clamp-1">{track.artist_name}</p>
                      <div className="flex flex-wrap gap-1">
                        {track.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={`${tag}-${idx}`} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {!isLoading && filteredTracks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No tracks found. Try changing the search parameters.
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      </div>
    </div>
    <Footer/>
    </div>
  );
}
