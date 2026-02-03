import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Camera, MapPin, Activity, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import CameraManager from "@/components/CameraManager";
import EventMonitor from "@/components/EventMonitor";
import ZoneEditor from "@/components/ZoneEditor";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCameraId, setSelectedCameraId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch sites and cameras
  const { data: sites, isLoading: sitesLoading } = trpc.sites.list.useQuery();
  const { data: cameras, isLoading: camerasLoading } = trpc.cameras.list.useQuery(undefined);
  const { data: events, isLoading: eventsLoading } = trpc.events.list.useQuery({
    limit: 50,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>SentinelSight</CardTitle>
            <CardDescription>AI Video Analytics Platform</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please log in to access the video surveillance and analytics platform.
            </p>
            <Button className="w-full" asChild>
              <a href="/api/oauth/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SentinelSight</h1>
            <p className="text-muted-foreground">AI Video Analytics Platform</p>
          </div>
          {user?.role === "admin" && (
            <Button onClick={() => setActiveTab("cameras")}>
              <Camera className="w-4 h-4 mr-2" />
              Manage Cameras
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            {(user?.role === "admin" || user?.role === "operator") && (
              <>
                <TabsTrigger value="cameras">Cameras</TabsTrigger>
                <TabsTrigger value="zones">Zones</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Cameras</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cameras?.length || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cameras?.filter(c => c.status === "online").length || 0} online
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {events?.filter(e => new Date(e.timestamp).getTime() > Date.now() - 3600000).length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Last hour</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Sites</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sites?.length || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Locations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{events?.length || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Recorded</p>
                </CardContent>
              </Card>
            </div>

            {/* Camera Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Camera Status</CardTitle>
                <CardDescription>Real-time monitoring of all camera streams</CardDescription>
              </CardHeader>
              <CardContent>
                {camerasLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading cameras...</div>
                ) : cameras && cameras.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cameras.map(camera => (
                      <div
                        key={camera.id}
                        className="border rounded-lg p-4 hover:bg-accent cursor-pointer transition"
                        onClick={() => setSelectedCameraId(camera.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-muted-foreground" />
                            <h3 className="font-semibold text-sm">{camera.name}</h3>
                          </div>
                          <Badge
                            variant={camera.status === "online" ? "default" : "secondary"}
                            className={camera.status === "online" ? "bg-green-600" : ""}
                          >
                            {camera.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {camera.locationTag && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {camera.locationTag}
                            </div>
                          )}
                          {camera.fps && (
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {camera.fps} FPS
                            </div>
                          )}
                          {camera.lastFrameTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(camera.lastFrameTime).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No cameras configured</p>
                    {user?.role === "admin" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setActiveTab("cameras")}
                      >
                        Add Camera
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <EventMonitor selectedCameraId={selectedCameraId} />
          </TabsContent>

          {/* Cameras Tab */}
          {(user?.role === "admin" || user?.role === "operator") && (
            <TabsContent value="cameras">
              <CameraManager />
            </TabsContent>
          )}

          {/* Zones Tab */}
          {(user?.role === "admin" || user?.role === "operator") && (
            <TabsContent value="zones">
              <ZoneEditor cameraId={selectedCameraId} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
