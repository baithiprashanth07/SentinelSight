import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function CameraManager() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    siteId: "",
    name: "",
    locationTag: "",
    rtspUrl: "",
  });

  // Fetch data
  const { data: sites } = trpc.sites.list.useQuery();
  const { data: cameras, refetch: refetchCameras } = trpc.cameras.list.useQuery(undefined);

  // Mutations
  const createCameraMutation = trpc.cameras.create.useMutation({
    onSuccess: () => {
      toast.success("Camera added successfully");
      setFormData({ siteId: "", name: "", locationTag: "", rtspUrl: "" });
      setOpen(false);
      refetchCameras();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add camera");
    },
  });

  const deleteCameraMutation = trpc.cameras.delete.useMutation({
    onSuccess: () => {
      toast.success("Camera deleted successfully");
      refetchCameras();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete camera");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.siteId || !formData.name || !formData.rtspUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    createCameraMutation.mutate({
      siteId: parseInt(formData.siteId),
      name: formData.name,
      locationTag: formData.locationTag || undefined,
      rtspUrl: formData.rtspUrl,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Camera Management</h2>
          <p className="text-muted-foreground">Add and manage RTSP camera streams</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Camera
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Camera</DialogTitle>
              <DialogDescription>
                Configure a new RTSP camera stream for monitoring
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site">Site *</Label>
                <Select value={formData.siteId} onValueChange={(value) => setFormData({ ...formData, siteId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites?.map((site) => (
                      <SelectItem key={site.id} value={site.id.toString()}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Camera Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Front Door"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location Tag</Label>
                <Input
                  id="location"
                  placeholder="e.g., Floor 1, Entrance"
                  value={formData.locationTag}
                  onChange={(e) => setFormData({ ...formData, locationTag: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rtsp">RTSP URL *</Label>
                <Input
                  id="rtsp"
                  placeholder="rtsp://user:password@camera-ip:554/stream"
                  value={formData.rtspUrl}
                  onChange={(e) => setFormData({ ...formData, rtspUrl: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={createCameraMutation.isPending}>
                {createCameraMutation.isPending ? "Adding..." : "Add Camera"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Camera List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cameras?.map((camera) => (
          <Card key={camera.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-muted-foreground" />
                  <CardTitle className="text-base">{camera.name}</CardTitle>
                </div>
                <Badge
                  variant={camera.status === "online" ? "default" : "secondary"}
                  className={camera.status === "online" ? "bg-green-600" : ""}
                >
                  {camera.status}
                </Badge>
              </div>
              {camera.locationTag && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  {camera.locationTag}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs space-y-1">
                <div className="break-all font-mono text-muted-foreground">
                  {camera.rtspUrl.substring(0, 40)}...
                </div>
                {camera.fps && <div>FPS: {camera.fps}</div>}
                {camera.lastFrameTime && (
                  <div className="text-muted-foreground">
                    Last frame: {new Date(camera.lastFrameTime).toLocaleTimeString()}
                  </div>
                )}
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => deleteCameraMutation.mutate(camera.id)}
                disabled={deleteCameraMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {!cameras || cameras.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No cameras configured yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first camera to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
