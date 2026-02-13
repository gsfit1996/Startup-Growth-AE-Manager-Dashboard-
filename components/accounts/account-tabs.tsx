"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AccountTabs({
  overview,
  stakeholders,
  risks,
  plan,
}: {
  overview: React.ReactNode;
  stakeholders: React.ReactNode;
  risks: React.ReactNode;
  plan: React.ReactNode;
}) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
        <TabsTrigger value="risks">Risks</TabsTrigger>
        <TabsTrigger value="plan">Account Plan</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">{overview}</TabsContent>
      <TabsContent value="stakeholders">{stakeholders}</TabsContent>
      <TabsContent value="risks">{risks}</TabsContent>
      <TabsContent value="plan">{plan}</TabsContent>
    </Tabs>
  );
}

