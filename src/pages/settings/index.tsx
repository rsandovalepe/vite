import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TwoFactorSetupPage from './TwoFactorSetup';

function SettingsPage() {
  return (
    <Tabs defaultValue="2fa" className="w-full">
      <TabsList>
        <TabsTrigger value="2fa">Two Factor Authentication</TabsTrigger>
      </TabsList>
      <TabsContent value="2fa">
        <TwoFactorSetupPage />
      </TabsContent>
    </Tabs>
  );
}

export default SettingsPage;
