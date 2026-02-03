import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, Clock, Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface EventMonitorProps {
  selectedCameraId?: number | null;
}

export default function EventMonitor({ selectedCameraId }: EventMonitorProps) {
  const [ruleTypeFilter, setRuleTypeFilter] = useState<string>("");
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>("24h");

  // Calculate time range
  const getTimeRange = () => {
    const now = new Date();
    const from = new Date();
    
    switch (timeRangeFilter) {
      case "1h":
        from.setHours(from.getHours() - 1);
        break;
      case "6h":
        from.setHours(from.getHours() - 6);
        break;
      case "24h":
        from.setDate(from.getDate() - 1);
        break;
      case "7d":
        from.setDate(from.getDate() - 7);
        break;
      default:
        from.setDate(from.getDate() - 1);
    }
    return { from, to: now };
  };

  const timeRange = getTimeRange();

  // Fetch events
  const { data: events, isLoading, refetch } = trpc.events.list.useQuery({
    cameraId: selectedCameraId || undefined,
    ruleType: ruleTypeFilter || undefined,
    from: timeRange.from,
    to: timeRange.to,
    limit: 100,
  });

  // Fetch cameras for display
  const { data: cameras } = trpc.cameras.list.useQuery(undefined);

  // Mutations
  const deleteEventMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      toast.success("Event deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete event");
    },
  });

  const getCameraName = (cameraId: number) => {
    return cameras?.find(c => c.id === cameraId)?.name || `Camera ${cameraId}`;
  };

  const getRuleTypeColor = (ruleType: string) => {
    switch (ruleType) {
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
        <h2 className="text-2xl font-bold">Event Monitor</h2>
        <p className="text-muted-foreground">View and manage detected events</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium">Time Range</label>
            <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last 1 Hour</SelectItem>
                <SelectItem value="6h">Last 6 Hours</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium">Rule Type</label>
            <Select value={ruleTypeFilter} onValueChange={setRuleTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All rule types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="intrusion">Intrusion</SelectItem>
                <SelectItem value="loitering">Loitering</SelectItem>
                <SelectItem value="counting">Counting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-2">
        {isLoading ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              Loading events...
            </CardContent>
          </Card>
        ) : events && events.length > 0 ? (
          events.map((event) => (
            <Card key={event.id} className="hover:bg-accent transition">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getRuleTypeColor(event.ruleType)}>
                        {event.ruleType}
                      </Badge>
                      <Badge variant="outline">{event.objectType}</Badge>
                      <span className="text-sm font-medium">
                        Confidence: {(parseFloat(event.confidence.toString()) * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        {getCameraName(event.cameraId)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.timestamp).toLocaleDateString()}
                      </div>
                    </div>

                    {event.snapshotUrl && (
                      <div className="mt-2">
                        <a
                          href={event.snapshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Snapshot →
                        </a>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEventMutation.mutate(event.id)}
                    disabled={deleteEventMutation.isPending}
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
              <p className="text-muted-foreground">No events found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Events will appear here when rules are triggered
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
