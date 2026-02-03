import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { AlertCircle, Plus, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface ZoneEditorProps {
  cameraId?: number | null;
}

export default function ZoneEditor({ cameraId }: ZoneEditorProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    zoneType: "intrusion" as const,
    polygonPoints: "[]",
  });

  // Fetch cameras
  const { data: cameras } = trpc.cameras.list.useQuery(undefined);
  const [selectedCameraId, setSelectedCameraId] = useState<string>(
    cameraId?.toString() || ""
  );

  // Fetch zones
  const { data: zones, refetch: refetchZones } = trpc.zones.list.useQuery(
    selectedCameraId ? parseInt(selectedCameraId) : 0,
    { enabled: !!selectedCameraId }
  );

  // Mutations
  const createZoneMutation = trpc.zones.create.useMutation({
    onSuccess: () => {
      toast.success("Zone created successfully");
      setFormData({ name: "", zoneType: "intrusion", polygonPoints: "[]" });
      setOpen(false);
      refetchZones();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create zone");
    },
  });

  const deleteZoneMutation = trpc.zones.delete.useMutation({
    onSuccess: () => {
      toast.success("Zone deleted successfully");
      refetchZones();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete zone");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCameraId || !formData.name) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const points = JSON.parse(formData.polygonPoints);
      if (!Array.isArray(points)) {
        throw new Error("Polygon points must be an array");
      }

      createZoneMutation.mutate({
        cameraId: parseInt(selectedCameraId),
        name: formData.name,
        zoneType: formData.zoneType,
        polygonPoints: points,
      });
    } catch (error) {
      toast.error("Invalid polygon points format. Must be valid JSON array.");
    }
  };

  const getZoneTypeColor = (zoneType: string) => {
    switch (zoneType) {
      case "intrusion":
        return "bg-red-600";
      case "loitering":
        return "bg-yellow-600";
      case "counting":
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Zone Editor</h2>
        <p className="text-muted-foreground">Define detection zones for cameras</p>
      </div>

      {/* Camera Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Camera</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCameraId} onValueChange={setSelectedCameraId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a camera" />
            </SelectTrigger>
            <SelectContent>
              {cameras?.map((camera) => (
                <SelectItem key={camera.id} value={camera.id.toString()}>
                  {camera.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCameraId && (
        <>
          {/* Add Zone Button */}
          <div className="flex justify-end">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Zone
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Detection Zone</DialogTitle>
                  <DialogDescription>
                    Define a zone with polygon coordinates for detection rules
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Zone Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Entrance Area"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Zone Type *</Label>
                    <Select
                      value={formData.zoneType}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, zoneType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="intrusion">
                          Intrusion Detection
                        </SelectItem>
                        <SelectItem value="loitering">
                          Loitering Detection
                        </SelectItem>
                        <SelectItem value="counting">Object Counting</SelectItem>
                        <SelectItem value="general">General Zone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="points">Polygon Points (JSON) *</Label>
                    <Textarea
                      id="points"
                      placeholder='[{"x": 0, "y": 0}, {"x": 100, "y": 0}, {"x": 100, "y": 100}]'
                      value={formData.polygonPoints}
                      onChange={(e) =>
                        setFormData({ ...formData, polygonPoints: e.target.value })
                      }
                      rows={4}
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Define polygon vertices as JSON array with x,y coordinates
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createZoneMutation.isPending}
                  >
                    {createZoneMutation.isPending
                      ? "Creating..."
                      : "Create Zone"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Zones List */}
          <div className="space-y-2">
            {zones && zones.length > 0 ? (
              zones.map((zone) => (
                <Card key={zone.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <h3 className="font-semibold">{zone.name}</h3>
                          <Badge className={getZoneTypeColor(zone.zoneType)}>
                            {zone.zoneType}
                          </Badge>
                        </div>
                        {zone.polygonPoints && (
                          <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                            {JSON.stringify(zone.polygonPoints).substring(0, 100)}
                            ...
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteZoneMutation.mutate(zone.id)}
                        disabled={deleteZoneMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No zones defined yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add a zone to enable detection rules
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
