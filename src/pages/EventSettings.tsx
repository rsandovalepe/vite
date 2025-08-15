import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function EventSettingsPage() {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList>
        <TabsTrigger className="w-40" value="general">General</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="moderation">Moderation</TabsTrigger>
        <TabsTrigger value="photo-wall">Photo Wall</TabsTrigger>
        <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
      </TabsList>
      <TabsContent value="general">General settings</TabsContent>
      <TabsContent value="appearance">Appearance settings</TabsContent>
      <TabsContent value="moderation">Moderation settings</TabsContent>
      <TabsContent value="photo-wall">Photo Wall settings</TabsContent>
      <TabsContent value="collaborators">Collaborators settings</TabsContent>
    </Tabs>
  );
}

export default EventSettingsPage;
